#!/usr/bin/env python3
"""Refresh the Philippines Plus reference price at most once per Shanghai day."""
import argparse
from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import hashlib
from http.client import HTTPSConnection
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import ssl
import sys
import tempfile
from urllib.parse import urlsplit

PRICE_URL = 'https://gptsub.linusx.dev/api/proxy/configs/PH'
FX_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
ALLOWED_ENDPOINTS = {
    'gptsub.linusx.dev': '/api/proxy/configs/PH',
    'cdn.jsdelivr.net': '/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
}
SHANGHAI = timezone(timedelta(hours=8), 'Asia/Shanghai')
TARGETS = (
    'map.plus-guide.fun/index.html',
    'map.plus-guide.fun/guides/17-plus.html',
    'plus-guide/index.html',
    'plus-guide/app.js',
)
NOTE_START = '<!-- ph-plus-price:start -->'
NOTE_END = '<!-- ph-plus-price:end -->'


def stamp():
    return datetime.now(SHANGHAI)


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def atomic_write(path, content, mode=None):
    path = Path(path)
    if path.is_symlink():
        raise ValueError(f'Refusing symlink: {path}')
    previous_mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
    fd, name = tempfile.mkstemp(prefix='.' + path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, previous_mode if mode is None else mode)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def lock(directory):
    import fcntl
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / 'update.lock').open('a') as handle:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield


class PinnedHTTPSConnection(HTTPSConnection):
    def __init__(self, host, address):
        super().__init__(host, timeout=25, context=ssl.create_default_context())
        self.address = address

    def connect(self):
        raw = socket.create_connection((self.address, self.port), self.timeout)
        try:
            self.sock = self._context.wrap_socket(raw, server_hostname=self.host)
        except BaseException:
            raw.close()
            raise


def public_dns(host, port, **kwargs):
    if host not in ALLOWED_ENDPOINTS or port != 443:
        raise ValueError('DNS lookup is outside the source allowlist')
    dns_address = '1.1.1.1'
    if not ipaddress.ip_address(dns_address).is_global:
        raise ValueError('DNS resolver must be public')
    connection = PinnedHTTPSConnection('cloudflare-dns.com', dns_address)
    try:
        connection.request('GET', '/dns-query?name=' + host + '&type=A', headers={
            'Accept': 'application/dns-json', 'Accept-Encoding': 'identity',
        })
        response = connection.getresponse()
        if response.status != 200:
            raise ValueError('Public DNS lookup failed')
        content = response.read(16385)
        if len(content) > 16384:
            raise ValueError('DNS response exceeds 16 KiB')
        data = json.loads(content.decode('utf-8'))
        if data.get('Status') != 0:
            raise ValueError('Public DNS returned an error')
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (answer['data'], 443))
                for answer in data.get('Answer', []) if answer.get('type') == 1]
    finally:
        connection.close()


def checked_destination(url, resolver=public_dns):
    parsed = urlsplit(url)
    if (parsed.scheme != 'https' or parsed.username or parsed.password
            or parsed.port not in (None, 443) or parsed.query or parsed.fragment
            or ALLOWED_ENDPOINTS.get(parsed.hostname) != parsed.path):
        raise ValueError('Source URL is outside the fixed HTTPS endpoint allowlist')
    addresses = list(dict.fromkeys(row[4][0] for row in resolver(
        parsed.hostname, 443, type=socket.SOCK_STREAM)))
    def public(address):
        ip = ipaddress.ip_address(address)
        return ip.is_global and not (ip.is_private or ip.is_loopback or ip.is_reserved
                                     or ip.is_multicast or ip.is_link_local or ip.is_unspecified)
    if not addresses or not all(public(address) for address in addresses):
        raise ValueError('Source DNS contains a non-public address')
    addresses.sort(key=lambda address: ipaddress.ip_address(address).version)
    return parsed, addresses[0]


def fetch_json(url):
    parsed, address = checked_destination(url)
    connection = PinnedHTTPSConnection(parsed.hostname, address)
    try:
        connection.request('GET', parsed.path, headers={
            'Accept': 'application/json',
            'User-Agent': 'PlusGuide-DailyPrice/1.0',
            'Accept-Encoding': 'identity',
        })
        response = connection.getresponse()
        if response.status != 200:
            raise ValueError(f'Source returned HTTP {response.status}; redirects are not followed')
        if 'application/json' not in response.getheader('Content-Type', '').lower():
            raise ValueError('Source did not return JSON')
        content = response.read(262145)
        if len(content) > 262144:
            raise ValueError('Source response exceeds 256 KiB')
        return json.loads(content.decode('utf-8'), parse_float=Decimal)
    finally:
        connection.close()


def number(value, label, minimum, maximum):
    if isinstance(value, bool) or not isinstance(value, (str, int, float, Decimal)):
        raise ValueError(f'Invalid {label}')
    try:
        result = Decimal(str(value))
    except InvalidOperation as error:
        raise ValueError(f'Invalid {label}') from error
    if not result.is_finite() or not Decimal(str(minimum)) <= result <= Decimal(str(maximum)):
        raise ValueError(f'Out of range {label}')
    return result


def money(value):
    return format(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP), '.2f')


def parse_quote(config, rates, now):
    if config.get('country_code') != 'PH':
        raise ValueError('Price data is not for the Philippines')
    currency = config.get('currency_config', {})
    if currency.get('symbol_code') != 'PHP':
        raise ValueError('Price currency is not PHP')
    month = currency.get('plus', {}).get('month', {})
    override = month.get('psp_override', {})
    if month.get('tax') != 'inclusive' or override.get('tax') != 'exclusive':
        raise ValueError('Expected Plus monthly inclusive price and exclusive PSP price')
    gross = number(month.get('amount'), 'Plus monthly PHP amount', 1, 100000)
    net = number(override.get('amount'), 'Plus monthly exclusive PHP amount', 1, gross)
    usd = rates.get('usd', {})
    php = number(usd.get('php'), 'USD/PHP rate', 1, 1000)
    cny = number(usd.get('cny'), 'USD/CNY rate', 0.1, 100)
    rate_date = date.fromisoformat(rates.get('date', ''))
    if not timedelta(0) <= now.date() - rate_date <= timedelta(days=7):
        raise ValueError('Exchange rate date is stale or in the future')
    return {
        'schema': 1, 'country': 'PH', 'plan': 'plus', 'period': 'month',
        'php': money(net), 'php_including_tax': money(gross),
        'cny': money(net * cny / php), 'tax': 'exclusive',
        'updated_at': now.isoformat(timespec='seconds'),
        'fx_date': rate_date.isoformat(),
        'source': 'https://gptsub.linusx.dev/',
        'price_api': PRICE_URL, 'exchange_api': FX_URL,
        'update_schedule': '每天早上4:00（北京时间）',
    }


def price_note(quote):
    updated = datetime.fromisoformat(quote['updated_at']).astimezone(SHANGHAI).strftime('%Y-%m-%d %H:%M')
    return (NOTE_START + '<p class="ph-plus-price-note" style="font-size:13px;line-height:1.8;'
            'color:#636980;margin:12px 0 18px">菲律宾 Plus 月付参考：免税 '
            f'₱{quote["php"]}，约 ¥{quote["cny"]}；含税标价 ₱{quote["php_including_tax"]}。'
            '<a href="https://gptsub.linusx.dev/" target="_blank" rel="noopener noreferrer">来源 GPTSub</a>'
            f' · 更新于 {updated}（北京时间），每天 04:00 查询一次。'
            '人民币为汇率折算，实际税费与扣款以官方结账页为准。</p>' + NOTE_END)


def replace_currency(source, old, quote):
    cny_values = {'106', '105.65', quote['cny']}
    php_values = {'982', '982.14', quote['php']}
    gross_values = {'1,100', '1100', '1100.00', quote['php_including_tax']}
    if old:
        cny_values.add(old['cny'])
        php_values.add(old['php'])
        gross_values.add(old['php_including_tax'])
    marker = re.search(re.escape(NOTE_START) + r'(.*?)' + re.escape(NOTE_END), source, re.S)
    if marker:
        embedded = re.search(r'免税\s*₱([\d.]+)，约\s*¥([\d.]+)；含税标价\s*₱([\d.]+)', marker.group(1))
        if embedded:
            php, cny, gross = embedded.groups()
            php_values.add(php)
            cny_values.add(cny)
            gross_values.add(gross)
    php_pattern = '|'.join(re.escape(value) for value in sorted(php_values, key=len, reverse=True))
    equation = r'(?:₱\s*)?(?:' + php_pattern + r')\s*(?:PHP)?\s*≈\s*(\d+(?:\.\d{1,2})?)\s*元'
    cny_values.update(re.findall(equation, source))
    alternatives = lambda values: '|'.join(re.escape(v) for v in sorted(values, key=len, reverse=True))
    source, count = re.subn(r'(?<![\d.])(?:' + alternatives(cny_values) + r')(?=\s*元)', quote['cny'], source)
    if count == 0:
        raise ValueError('No expected CNY price found in target')
    for values, value in [(gross_values, quote['php_including_tax']), (php_values, quote['php'])]:
        amounts = alternatives(values)
        source = re.sub(r'(?P<currency>₱\s*|PHP\s+)(?:' + amounts + r')(?![\d.])', lambda m: m['currency'] + value, source)
        source = re.sub(r'(?<![\d.])(?:' + amounts + r')(?P<currency>\s+PHP)(?!\w)', lambda m: value + m['currency'], source)
    return source


def render_target(source, relative, old, quote):
    source = replace_currency(source, old, quote)
    if not relative.endswith('.html'):
        return source
    note = price_note(quote)
    if NOTE_START in source or NOTE_END in source:
        pattern = re.escape(NOTE_START) + r'.*?' + re.escape(NOTE_END)
        source, count = re.subn(pattern, lambda _: note, source, flags=re.S)
        if count != 1:
            raise ValueError('Expected exactly one price information block')
        return source
    if relative == 'map.plus-guide.fun/index.html':
        anchor = '<div id="barSentinel"'
    elif relative == 'plus-guide/index.html':
        anchor = '      <details class="principle-card" id="principleCard">'
    else:
        anchor = '        <div class="g-meta">'
    if source.count(anchor) != 1:
        raise ValueError(f'Price note insertion anchor changed: {relative}')
    return source.replace(anchor, note + '\n' + anchor, 1)


def publish(root, state_dir, old, quote):
    changes = {}
    for relative in TARGETS:
        path = root / relative
        if path.is_symlink() or not path.is_file():
            raise ValueError(f'Missing or unsafe target: {relative}')
        source = path.read_text(encoding='utf-8')
        changes[path] = render_target(source, relative, old, quote).encode('utf-8')
    for relative in ['map.plus-guide.fun/plus-price.json', 'plus-guide/plus-price.json']:
        path = root / relative
        if path.is_symlink():
            raise ValueError(f'Unsafe price output: {relative}')
        changes[path] = encode(quote)
    originals = {path: path.read_bytes() if path.exists() else None for path in changes}
    backup = state_dir / 'backups' / stamp().strftime('%Y%m%d-%H%M%S-%f')
    backup.mkdir(parents=True)
    for path, data in originals.items():
        if data is not None:
            destination = backup / path.relative_to(root)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
    written = []
    try:
        for path, data in changes.items():
            atomic_write(path, data)
            written.append(path)
        for path, data in changes.items():
            if hashlib.sha256(path.read_bytes()).digest() != hashlib.sha256(data).digest():
                raise ValueError(f'Installed content mismatch: {path}')
    except BaseException:
        for path in reversed(written):
            if originals[path] is None:
                path.unlink()
            else:
                atomic_write(path, originals[path])
        raise
    return str(backup)


def run(root, state_dir, cached=False, fetch=fetch_json, now=None):
    now = now or stamp()
    state_path = state_dir / 'state.json'
    state = json.loads(state_path.read_text(encoding='utf-8')) if state_path.exists() else {}
    old = state.get('quote')
    if cached:
        if not old:
            raise ValueError('No successful cached quote to publish')
        print('CACHE_ONLY ' + publish(root, state_dir, old, old))
        return
    today = now.date().isoformat()
    if state.get('last_attempt_date') == today:
        print(f'SKIP: source already queried or attempted on {today}')
        return
    state.update(last_attempt_date=today, last_attempt_at=now.isoformat(timespec='seconds'), status='querying')
    atomic_write(state_path, encode(state), mode=0o600)
    try:
        quote = parse_quote(fetch(PRICE_URL), fetch(FX_URL), now)
        backup = publish(root, state_dir, old, quote)
        state.update(quote=quote, status='ok', backup=backup)
        state.pop('error', None)
        atomic_write(state_path, encode(state), mode=0o600)
    except Exception as error:
        state.update(status='failed', error=f'{type(error).__name__}: {error}')
        atomic_write(state_path, encode(state), mode=0o600)
        raise
    print(f'UPDATED {quote["updated_at"]}: PHP {quote["php"]} = CNY {quote["cny"]}; backup={backup}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site-root', type=Path, default=Path('/var/www'))
    parser.add_argument('--state-dir', type=Path, default=Path('/var/lib/plus-guide-price'))
    parser.add_argument('--apply-cached', action='store_true', help='Reapply the last successful quote without network requests')
    args = parser.parse_args()
    with lock(args.state_dir):
        run(args.site_root, args.state_dir, cached=args.apply_cached)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'PRICE_UPDATE_FAILED: {type(error).__name__}: {error}', file=sys.stderr)
        sys.exit(1)

import importlib.util
import json
from pathlib import Path
import socket
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('update_price', Path(__file__).with_name('update_price.py'))
price = importlib.util.module_from_spec(spec)
spec.loader.exec_module(price)
ART = Path('F:/AI/tmp')
NOW = price.datetime(2026, 11, 1, 8, 0, tzinfo=price.SHANGHAI)
CONFIG = {'country_code': 'PH', 'currency_config': {'symbol_code': 'PHP', 'plus': {'month': {
    'amount': 1100, 'tax': 'inclusive', 'psp_override': {'amount': 982.14, 'tax': 'exclusive'}}}}}
RATES = {'date': '2026-10-31', 'usd': {'php': '63.76474524', 'cny': '6.65649514'}}


def records(address):
    return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', (address, 443))]


class PriceTests(unittest.TestCase):
    def test_quote_matches_gptsub(self):
        quote = price.parse_quote(CONFIG, RATES, NOW)
        self.assertEqual(quote['cny'], '102.53')
        self.assertEqual(quote['php'], '982.14')
        self.assertEqual(quote['plan'], 'plus')

    def test_wrong_plan_country_and_rates_rejected(self):
        for config in [{}, dict(CONFIG, country_code='US'), {'country_code':'PH','currency_config':{'symbol_code':'PHP','go':CONFIG['currency_config']['plus']}}]:
            with self.assertRaises(ValueError):
                price.parse_quote(config, RATES, NOW)
        for value in ['NaN', '-1', '0', 'Infinity']:
            rates = {'date':RATES['date'],'usd':dict(RATES['usd'],php=value)}
            with self.assertRaises(ValueError):
                price.parse_quote(CONFIG,rates,NOW)
        with self.assertRaises(ValueError):
            price.parse_quote(CONFIG,dict(RATES,date='2026-09-01'),NOW)

    def test_source_allowlist_and_private_dns(self):
        for address in ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.1','169.254.169.254','0.0.0.0','224.0.0.1','::1','fc00::1','2001:db8::1']:
            with self.assertRaises(ValueError):
                price.checked_destination(price.PRICE_URL,lambda *a,**k:records(address))
        for url in ['http://gptsub.linusx.dev/api/proxy/configs/PH','file:///etc/passwd','https://localhost/api/proxy/configs/PH','https://gptsub.linusx.dev.evil.test/api/proxy/configs/PH','https://gptsub.linusx.dev/api/proxy/configs/US','https://gptsub.linusx.dev:8080/api/proxy/configs/PH','https://user:secret@gptsub.linusx.dev/api/proxy/configs/PH']:
            with self.assertRaises(ValueError):
                price.checked_destination(url,lambda *a,**k:records('1.1.1.1'))
        parsed,address=price.checked_destination(price.PRICE_URL,lambda *a,**k:records('1.1.1.1'))
        self.assertEqual(parsed.hostname,'gptsub.linusx.dev')
        self.assertEqual(address,'1.1.1.1')

    def site(self, directory):
        root=Path(directory)/'www'
        state=Path(directory)/'state'
        state.mkdir()
        fixtures = {
            'map.plus-guide.fun/index.html': '<h3>ChatGPT Plus</h3><p>菲律宾区约 106 元/月</p><div id="barSentinel"></div>',
            'map.plus-guide.fun/guides/17-plus.html': '<p>菲律宾区约 106 元/月</p>\n        <div class="g-meta"></div>\n<script>const example="约 982 PHP ≈ 105.65 元";const image="ph-subscribe-982.webp";</script>',
            'plus-guide/index.html': '<p>最低约 106 元/月</p>\n      <details class="principle-card" id="principleCard"></details><img src="ph-subscribe-982.png">',
            'plus-guide/app.js': 'const example="Plus 标价 1,100 PHP/月；免税约 982 PHP ≈ 105.65 元";const price="106 元";const image="ph-subscribe-982.png";',
        }
        for relative,source in fixtures.items():
            target=root/relative
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(source,encoding='utf-8')
        return root,state

    def test_once_a_day_and_repeated_price_updates(self):
        with TemporaryDirectory(dir=ART) as temp:
            root,state=self.site(temp)
            calls=[]
            def fetch(url):
                calls.append(url)
                return CONFIG if url==price.PRICE_URL else RATES
            price.run(root,state,fetch=fetch,now=NOW)
            self.assertEqual(calls,[price.PRICE_URL,price.FX_URL])
            price.run(root,state,fetch=fetch,now=NOW)
            self.assertEqual(len(calls),2)
            for relative in price.TARGETS:
                content=(root/relative).read_text(encoding='utf-8')
                self.assertIn('102.53 元',content)
                self.assertNotRegex(content,r'(?:106|105\.65)\s*元')
                self.assertNotIn('ph-subscribe-982.14',content)
                if relative.endswith('.html'):
                    self.assertEqual(content.count(price.NOTE_START),1)
            changed={'date':'2026-11-01','usd':dict(RATES['usd'],cny='7')}
            price.run(root,state,fetch=lambda url:CONFIG if url==price.PRICE_URL else changed,now=NOW+price.timedelta(days=1))
            for relative in price.TARGETS:
                content=(root/relative).read_text(encoding='utf-8')
                self.assertIn('107.82 元',content)
                self.assertNotIn('102.53 元',content)
                if relative.endswith('.html'):
                    self.assertEqual(content.count(price.NOTE_START),1)
            price.run(root,state,cached=True,fetch=lambda url:self.fail('cached replay must not query sources'),now=NOW)
            self.assertEqual(json.loads((root/'map.plus-guide.fun/plus-price.json').read_text())['cny'],'107.82')

    def test_cached_replay_handles_packaged_price_different_from_server_cache(self):
        with TemporaryDirectory(dir=ART) as temp:
            root, state = self.site(temp)
            cached = dict(price.parse_quote(CONFIG, RATES, NOW), cny='102.54')
            packaged = dict(cached, cny='102.55')
            app = root / 'plus-guide/app.js'
            app.write_text(app.read_text(encoding='utf-8').replace('105.65 元', '102.53 元').replace('106 元', '102.53 元'), encoding='utf-8')
            for relative in ['map.plus-guide.fun/index.html', 'map.plus-guide.fun/guides/17-plus.html']:
                target = root / relative
                target.write_text(price.render_target(target.read_text(encoding='utf-8'), relative, None, packaged), encoding='utf-8')
            (state / 'state.json').write_text(json.dumps({'quote': cached}), encoding='utf-8')
            price.run(root, state, cached=True, fetch=lambda url: self.fail('cache replay must stay offline'))
            for relative in price.TARGETS:
                content = (root / relative).read_text(encoding='utf-8')
                self.assertIn('102.54 元', content)
                self.assertNotIn('102.55', content)
                self.assertNotIn('102.53', content)

    def test_failure_preserves_files_and_does_not_retry_today(self):
        with TemporaryDirectory(dir=ART) as temp:
            root,state=self.site(temp)
            before={relative:(root/relative).read_bytes() for relative in price.TARGETS}
            calls=[]
            def fail(url):
                calls.append(url)
                raise TimeoutError('source unavailable')
            with self.assertRaises(TimeoutError):
                price.run(root,state,fetch=fail,now=NOW)
            price.run(root,state,fetch=fail,now=NOW)
            self.assertEqual(len(calls),1)
            self.assertEqual(json.loads((state/'state.json').read_text())['status'],'failed')
            for relative in price.TARGETS:
                self.assertEqual((root/relative).read_bytes(),before[relative])

    def test_write_failure_rolls_back(self):
        with TemporaryDirectory(dir=ART) as temp:
            root,state=self.site(temp)
            before={relative:(root/relative).read_bytes() for relative in price.TARGETS}
            write=price.atomic_write
            calls=0
            def broken(path,content,mode=None):
                nonlocal calls
                calls+=1
                if calls==3:
                    raise OSError('simulated disk failure')
                return write(path,content,mode)
            with patch.object(price,'atomic_write',side_effect=broken), self.assertRaises(OSError):
                price.publish(root,state,None,price.parse_quote(CONFIG,RATES,NOW))
            for relative in price.TARGETS:
                self.assertEqual((root/relative).read_bytes(),before[relative])
            self.assertFalse((root/'map.plus-guide.fun/plus-price.json').exists())


if __name__=='__main__':
    unittest.main(verbosity=2)

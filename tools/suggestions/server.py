#!/usr/bin/env python3
"""Receive private tutorial suggestions for map.plus-guide.fun."""
import argparse
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import hashlib
import ipaddress
import json
import logging
from pathlib import Path
import re
import secrets
import sqlite3
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ORIGIN = 'https://map.plus-guide.fun'
MAX_BODY = 8192
SHANGHAI = timezone(timedelta(hours=8))
TUTORIALS = {
    '17-plus', '15-roogoo-card', '13-claude-account-env', '28-google-account',
    '21-google-region', '20-gemini-student', '04-muse-invite', '12-magpie',
    '14-claude-to-codex', '16-antigravity', '26-chatgpt-account-switch',
    '27-gemini-proxy', '11-grok-orca', '29-pixel-ai-pro', 'ip-guide',
}
VPN = re.compile(r'vpn|翻墙|科学上网|梯子|机场|代理节点|代理服务器|搭建代理|购买节点|节点购买', re.I)


class Rejected(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def clean_text(value, minimum, maximum, label):
    if not isinstance(value, str):
        raise Rejected(400, f'请填写{label}。')
    value = value.strip()
    if not minimum <= len(value) <= maximum:
        raise Rejected(400, f'{label}需要 {minimum}–{maximum} 个字。')
    if any(ord(c) < 32 and c not in '\n\r\t' for c in value):
        raise Rejected(400, f'{label}中含有无法识别的字符。')
    return value


def validate(payload):
    if not isinstance(payload, dict):
        raise Rejected(400, '提交格式不正确，请刷新后重试。')
    if payload.get('website'):
        raise Rejected(400, '提交未通过校验，请刷新后重试。')
    try:
        request_id = str(uuid.UUID(payload.get('request_id', ''), version=4))
    except (ValueError, TypeError, AttributeError):
        raise Rejected(400, '提交编号无效，请刷新后重试。') from None
    if request_id != payload.get('request_id'):
        raise Rejected(400, '提交编号无效，请刷新后重试。')
    category = payload.get('category')
    if category not in ('improve', 'new'):
        raise Rejected(400, '请选择建议类型。')
    tutorial = payload.get('tutorial', '')
    if category == 'improve' and tutorial not in TUTORIALS:
        raise Rejected(400, '请选择需要优化的教程。')
    title = clean_text(payload.get('title', ''), 2, 80, '教程主题') if category == 'new' else ''
    message = clean_text(payload.get('message'), 10, 1500, '建议内容')
    if VPN.search(title + '\n' + message):
        raise Rejected(422, '涉及 VPN 的内容不提供教学，请提交其他教程建议；操作问题请进右下角群询问。')
    return request_id, category, tutorial if category == 'improve' else '', title, message


class Store:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.path = self.directory / 'suggestions.sqlite3'
        salt_path = self.directory / 'rate-salt'
        try:
            with salt_path.open('xb') as handle:
                handle.write(secrets.token_bytes(32))
            salt_path.chmod(0o600)
        except FileExistsError:
            pass
        self.salt = salt_path.read_bytes()
        with self.connect() as connection:
            connection.executescript('''
                CREATE TABLE IF NOT EXISTS suggestions (
                    request_id TEXT PRIMARY KEY,
                    reference TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    category TEXT NOT NULL,
                    tutorial TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS attempts (
                    client TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS attempts_client_time ON attempts(client, created_at);
                CREATE INDEX IF NOT EXISTS suggestions_time ON suggestions(created_at);
            ''')
        self.path.chmod(0o600)

    @contextmanager
    def connect(self):
        connection = sqlite3.connect(self.path, timeout=5)
        try:
            connection.execute('PRAGMA max_page_count=4096')
            with connection:
                yield connection
        finally:
            connection.close()

    def submit(self, values, client, now=None):
        now = int(time.time()) if now is None else now
        request_id, category, tutorial, title, message = values
        client_hash = hashlib.sha256(self.salt + client.encode('utf-8')).hexdigest()
        created = datetime.fromtimestamp(now, SHANGHAI)
        with self.connect() as connection:
            connection.execute('BEGIN IMMEDIATE')
            existing = connection.execute('SELECT reference FROM suggestions WHERE request_id=?', (request_id,)).fetchone()
            if existing:
                return existing[0], False
            connection.execute('DELETE FROM attempts WHERE created_at < ?', (now - 86400,))
            recent = connection.execute('SELECT COUNT(*) FROM attempts WHERE client=? AND created_at>=?', (client_hash, now - 3600)).fetchone()[0]
            if recent >= 5:
                raise Rejected(429, '提交有些频繁，请一小时后再试。')
            day_start = created.replace(hour=0, minute=0, second=0, microsecond=0).isoformat(timespec='seconds')
            today = connection.execute('SELECT COUNT(*) FROM suggestions WHERE created_at>=?', (day_start,)).fetchone()[0]
            total = connection.execute('SELECT COUNT(*) FROM suggestions').fetchone()[0]
            if today >= 200 or total >= 5000:
                raise Rejected(503, '建议箱暂时已满，请稍后再试；操作问题可进右下角群询问。')
            reference = 'SUG-' + created.strftime('%Y%m%d') + '-' + secrets.token_hex(4).upper()
            connection.execute('INSERT INTO suggestions VALUES (?,?,?,?,?,?,?)', (
                request_id, reference, created.isoformat(timespec='seconds'), category, tutorial, title, message,
            ))
            connection.execute('INSERT INTO attempts VALUES (?,?)', (client_hash, now))
        return reference, True


class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(10)

    def log_message(self, *_):
        pass

    def reply(self, status, payload):
        data = (json.dumps(payload, ensure_ascii=False) + '\n').encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Connection', 'close')
        if status == 429:
            self.send_header('Retry-After', '3600')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == '/health':
            self.reply(200, {'ok': True})
        else:
            self.reply(405 if self.path == '/api/suggestions' else 404, {'ok': False, 'message': '此入口只接收教程建议。'})

    def do_POST(self):
        try:
            if self.path != '/api/suggestions':
                raise Rejected(404, '未找到提交入口。')
            if self.headers.get('Origin') != ORIGIN or self.headers.get('X-Requested-With') != 'PlusGuideSuggestions':
                raise Rejected(403, '请从教程导航页提交建议。')
            if self.headers.get('Content-Type', '').split(';')[0].lower() != 'application/json':
                raise Rejected(415, '提交格式不正确。')
            if self.headers.get('Transfer-Encoding'):
                raise Rejected(400, '提交格式不正确。')
            length = self.headers.get('Content-Length', '')
            if not length.isdigit() or not 1 <= int(length) <= MAX_BODY:
                raise Rejected(413, '内容过长，请缩短建议后再提交。')
            data = self.rfile.read(int(length))
            try:
                payload = json.loads(data.decode('utf-8'))
            except (ValueError, UnicodeError):
                raise Rejected(400, '内容读取失败，请刷新后重试。') from None
            values = validate(payload)
            client = self.headers.get('CF-Connecting-IP', self.client_address[0])
            try:
                client = str(ipaddress.ip_address(client))
            except ValueError:
                client = self.client_address[0]
            reference, created = self.server.store.submit(values, client)
            self.reply(201 if created else 200, {'ok': True, 'reference': reference})
        except Rejected as error:
            self.reply(error.status, {'ok': False, 'message': error.message})
        except Exception:
            logging.exception('Suggestion storage failed')
            self.reply(503, {'ok': False, 'message': '暂时未能保存，请稍后重试。你的内容仍留在输入框里。'})


class Server(ThreadingHTTPServer):
    daemon_threads = True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, default=Path('/var/lib/plus-guide-suggestions'))
    parser.add_argument('--port', type=int, default=18093)
    parser.add_argument('--export', action='store_true', help='Print stored suggestions as JSON for the site owner')
    args = parser.parse_args()
    if args.export:
        database = args.data_dir / 'suggestions.sqlite3'
        connection = sqlite3.connect(database.resolve().as_uri() + '?mode=ro', uri=True)
        connection.row_factory = sqlite3.Row
        try:
            rows = connection.execute('SELECT reference,created_at,category,tutorial,title,message FROM suggestions ORDER BY created_at DESC').fetchall()
            print(json.dumps([dict(row) for row in rows], ensure_ascii=False, indent=2))
        finally:
            connection.close()
        return
    store = Store(args.data_dir)
    with Server(('127.0.0.1', args.port), Handler) as server:
        server.store = store
        print(f'Tutorial suggestions listening on 127.0.0.1:{args.port}', flush=True)
        server.serve_forever()


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Prepare an explicit, checksummed G release. Transfer the output to the server's /tmp.

python tools/stage-g-release.py --out F:/AI/tmp/map-g-release --live-root <downloaded-map-snapshot>
This only prepares local files. It never connects to or modifies a running site.
"""
import argparse
import hashlib
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'map'


def digest(path, algorithm='sha256'):
    return hashlib.new(algorithm, path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--live-root', required=True, type=Path)
    args = parser.parse_args()
    destination = args.out.resolve()
    if destination.exists() and any(destination.iterdir()):
        raise SystemExit('输出目录必须为空，防止混入上次产物')
    published = (SITE / 'published-guides.txt').read_text(encoding='utf-8').splitlines()
    if not published or any(not re.fullmatch(r'\d{2}-[a-z0-9-]+\.html', name) for name in published):
        raise SystemExit('无效的已发布教程清单')
    live_names = sorted(path.name for path in (args.live_root / 'guides').glob('*.html'))
    if sorted(published) != live_names:
        raise SystemExit('已发布教程清单与线上快照不一致；请先核对新增/下线页面')
    files = {}
    home = ['index.html', 'ai-group-qr.png', 'backup-qq-qr.webp', 'og-image.png', 'apple-touch-icon.png', 'plus-price.json']
    for relative in home:
        files['map.plus-guide.fun/' + relative] = SITE / relative
    for name in published:
        files['map.plus-guide.fun/guides/' + name] = SITE / 'guides' / name
    for directory in ['assets', 'guides/assets']:
        for path in (SITE / directory).rglob('*'):
            if path.is_file():
                files['map.plus-guide.fun/' + path.relative_to(SITE).as_posix()] = path
    files['ip.plus-guide.fun/index.html'] = SITE / 'guides/30-ip-guide.html'
    files['ip.plus-guide.fun/ip-guide.html'] = SITE / 'guides/30-ip-guide.html'
    files['ip.plus-guide.fun/ai-group-qr.png'] = SITE / 'ai-group-qr.png'
    for name in ['g-guide.css', 'g-engine.js', 'pg-heading-900.woff2', 'bricolage-800-sub.woff2']:
        files['ip.plus-guide.fun/assets/' + name] = SITE / 'assets' / name
    for path in (SITE / 'assets/guides/ip-guide').rglob('*'):
        if path.is_file():
            files['ip.plus-guide.fun/' + path.relative_to(SITE).as_posix()] = path
    manifest = []
    for relative, source in sorted(files.items(), key=lambda item: (item[0].endswith('.html'), item[0])):
        target = destination / 'payload' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        manifest.append(f'{digest(target, "md5")}  {relative}')
    (destination / 'manifest.md5').write_text('\n'.join(manifest) + '\n', encoding='utf-8', newline='\n')
    scripts = destination / 'scripts'
    scripts.mkdir()
    for source, name in [(ROOT / 'tools/plus-price/update_price.py', 'price.py'), (ROOT / 'tools/suggestions/server.py', 'suggestions.py')]:
        shutil.copy2(source, scripts / name)
    (destination / 'scripts.md5').write_text('\n'.join(f'{digest(path, "md5")}  scripts/{path.name}' for path in sorted(scripts.iterdir())) + '\n', encoding='utf-8', newline='\n')
    expected = []
    for relative in ['index.html', 'plus-price.json'] + ['guides/' + name for name in published]:
        path = args.live_root / relative
        expected.append(f'{digest(path)}  {relative}')
    (destination / 'expected-live.sha256').write_text('\n'.join(expected) + '\n', encoding='utf-8', newline='\n')
    apply = '''#!/bin/sh
set -eu
stage=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$stage/payload"
md5sum -c "$stage/manifest.md5"
cd "$stage"
md5sum -c scripts.md5
cd /var/www/map.plus-guide.fun
sha256sum -c "$stage/expected-live.sha256"
backup="/home/ubuntu/map-g-before-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$backup" -C / var/www/map.plus-guide.fun var/www/ip.plus-guide.fun var/www/plus-guide opt/plus-guide-price/update_price.py opt/plus-guide-suggestions/server.py
printf 'BACKUP %s\\n' "$backup"
while read -r sum relative; do
  install -D -m 644 "$stage/payload/$relative" "/var/www/$relative"
done < "$stage/manifest.md5"
cd /var/www
md5sum -c "$stage/manifest.md5"
install -m 644 "$stage/scripts/price.py" /opt/plus-guide-price/update_price.py
install -m 644 "$stage/scripts/suggestions.py" /opt/plus-guide-suggestions/server.py
python3 -B /opt/plus-guide-price/update_price.py --apply-cached
systemctl restart plus-guide-suggestions.service
systemctl is-active plus-guide-suggestions.service plus-guide-price.timer
count=$(grep -l 'assets/g-engine.js?v=' /var/www/map.plus-guide.fun/guides/*.html | wc -l)
printf 'G tutorials: 应 25 / 实 %s\\n' "$count"
test "$count" -eq 25
for file in /var/www/map.plus-guide.fun/index.html /var/www/map.plus-guide.fun/guides/17-plus.html; do
  count=$(grep -o 'ph-plus-price:start' "$file" | wc -l)
  printf 'Price marker %s: 应 1 / 实 %s\\n' "$file" "$count"
  test "$count" -eq 1
done
count=$(grep -o 'g-engine.js?v=' /var/www/ip.plus-guide.fun/index.html | wc -l)
printf 'IP shared engine: 应 1 / 实 %s\\n' "$count"
test "$count" -eq 1
printf 'PASS G release installed and checked\\n'
'''
    (destination / 'apply.sh').write_text(apply, encoding='utf-8', newline='\n')
    print(f'Staged {len(files)} public files and 2 service scripts to {destination}')


if __name__ == '__main__':
    main()

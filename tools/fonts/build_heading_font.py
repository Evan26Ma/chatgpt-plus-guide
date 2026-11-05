"""Subset and merge Fontsource Noto Sans SC Black chunks for the site's headings.

Usage: python build_heading_font.py <fontsource-files-dir> <chars.txt> <out.woff2>
"""
import os
from pathlib import Path
import sys
from tempfile import TemporaryDirectory

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont


def main():
    source, characters, output = map(Path, sys.argv[1:4])
    needed = {ord(c) for c in characters.read_text(encoding='utf-8') if not c.isspace()}
    needed.update(map(ord, '，。、：；？！（）·…—'))
    output.parent.mkdir(parents=True, exist_ok=True)
    covered = set()
    with TemporaryDirectory(prefix='heading-font-', dir=output.parent) as temporary:
        parts = []
        for path in sorted(source.glob('noto-sans-sc-*-900-normal.woff2')):
            font = TTFont(path)
            matched = (needed & set(font.getBestCmap())) - covered
            if not matched:
                font.close()
                continue
            options = subset.Options()
            options.flavor = None
            options.layout_features = ['*']
            options.name_IDs = ['*']
            options.notdef_outline = True
            selection = subset.Subsetter(options)
            selection.populate(unicodes=matched)
            selection.subset(font)
            part = Path(temporary) / f'part{len(parts)}.ttf'
            font.flavor = None
            font.save(part)
            font.close()
            parts.append(str(part))
            covered.update(matched)
        if not parts:
            raise SystemExit(f'No matching Black font chunks in {source}')
        missing = needed - covered
        if missing:
            raise SystemExit('Missing font characters: ' + ''.join(map(chr, sorted(missing))))
        merged = Merger().merge(parts) if len(parts) > 1 else TTFont(parts[0])
        merged.flavor = 'woff2'
        candidate = Path(temporary) / output.name
        merged.save(candidate)
        merged.close()
        os.replace(candidate, output)
    print(f'chunks used: {len(parts)}, chars: {len(covered)}, bytes: {output.stat().st_size}')


if __name__ == '__main__':
    main()

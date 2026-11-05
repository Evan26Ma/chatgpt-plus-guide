#!/usr/bin/env python3
"""Statically validate canonical JavaScript guide modules without executing them.

python ai-guides/_src/check.py
For complete route/resource checks after building: node ai-guides/_src/check-g.cjs
"""
import re
from pathlib import Path

from build import ROOT, g_index, g_string

KINDS = {'info', 'inputs', 'choice', 'task', 'html', 'checks', 'faq', 'done'}


def tokens(source):
    pattern = re.compile(r'''//[^\n]*|/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[A-Za-z_$][\w$]*|\d+|[^\s]''')
    for match in pattern.finditer(source):
        if match.group().startswith(('//', '/*')):
            continue
        yield match


def split_steps(source):
    items = list(tokens(source))
    start = next((i + 3 for i in range(len(items) - 2)
                  if items[i].group().strip('"\'') == 'steps'
                  and items[i + 1].group() == ':' and items[i + 2].group() == '['), None)
    if start is None:
        return []
    depth = 0
    beginning = None
    chunks = []
    for token in items[start:]:
        value = token.group()
        if value == ']' and depth == 0:
            break
        if value in '{[':
            if depth == 0:
                beginning = token.start()
            depth += 1
        elif value in '}]':
            depth -= 1
            if depth == 0 and beginning is not None:
                chunks.append(source[beginning:token.end()])
                beginning = None
    return chunks


def main():
    problems = []
    files = sorted(path for path in (ROOT / 'guides').glob('*.js') if not path.name.startswith('_'))
    for path in files:
        source = path.read_text(encoding='utf-8')
        try:
            g_index(path, source)
            for field in ['slug', 'title', 'subtitle']:
                if not g_string(source, field):
                    raise ValueError('缺少 ' + field)
            steps = split_steps(source)
            if not steps:
                raise ValueError('没有可识别的 steps 数组')
            for index, step in enumerate(steps):
                kind = g_string(step, 'kind', 'task')
                if kind not in KINDS:
                    raise ValueError(f'步骤 {index} 不支持 kind={kind}')
                if not g_string(step, 'title'):
                    raise ValueError(f'步骤 {index} 缺少标题')
                for target in re.findall(r'''(?:\bnext|["']next["'])\s*:\s*(\d+)''', step):
                    if int(target) >= len(steps):
                        raise ValueError(f'步骤 {index} 的 next={target} 越界')
            for relative in re.findall(r'''@embed-(?:image|file|text):([^\s'"\\<>]+)''', source):
                target = (ROOT / relative).resolve()
                if not target.is_relative_to(ROOT.resolve()) or not target.is_file():
                    raise ValueError('资源不存在或超出目录：' + relative)
            print(f'PASS {path.name}: {len(steps)} steps')
        except (ValueError, SyntaxError) as error:
            problems.append(f'{path.name}: {error}')
    if problems:
        print('\n'.join(problems))
        return 1
    print(f'全部 {len(files)} 篇静态检查通过')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

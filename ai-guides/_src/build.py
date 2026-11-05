#!/usr/bin/env python3
"""把每篇教程的内容数据（guides/<slug>.js）生成 HTML 页面。两种样式：

旧样式（默认，行为和以前完全一样）：
    python _src/build.py                     # 生成全部
    python _src/build.py cli-proxy-api       # 只生成某一篇
    输入 assets/guide.css + assets/guide.js，输出 ai-guides/<编号>-<slug>.html，
    样式、引擎、正文、配图全部内联，单独拿走也能打开。

G 风格（2026-11 新版，说明见 map/DESIGN-G.md）：
    python _src/build.py --g --home                   # 生成全部和正式首页，输出到 ../map/
    python _src/build.py --g google-account _g-demo   # 只生成指定几篇（文件名，可带或不带开头的 _）
    python _src/build.py --g --inline google-account  # 单文件版：样式、引擎、配图都内联
    python _src/build.py --g --out D:/preview         # 换一个输出目录（目录结构同 map/）

    输入：
        assets/g-page.html    页面外壳（$占位符由本脚本填）
        assets/g-guide.css    共享样式
        assets/g-engine.js    共享向导引擎
        guides/<slug>.js      正文数据（和旧样式同一份，不用改）
    输出（默认 ../map/，目录结构和线上站点一致）：
        guides/<编号>-<slug>.html    每篇一个页面，只含正文数据
        assets/g-guide.css           共享样式（带 ?v=内容哈希，改了就自动换缓存）
        assets/g-engine.js           共享引擎
        assets/guides/<子目录>/...    配图（来自 '@embed-image:assets/...'，按原路径复制，多篇共用不重复）
    标题字体 assets/pg-heading-900.woff2 由 tools/fonts/build_heading_font.py 生成；
    本脚本会检查新标题里有没有字体缺的字，缺字会追加到 tools/fonts/heading-chars.txt 并提示重新生成。
"""
import argparse
import ast
import base64
import hashlib
import html
import json
import mimetypes
import re
import shutil
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from group_widget import widget as support_widget

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / 'assets' / 'guide.css'
ENGINE = ROOT / 'assets' / 'guide.js'
GUIDES = ROOT / 'guides'

FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Crect width='64' height='64' rx='19' fill='%236459d9'/%3E"
    "%3Cpath d='M20 24h24M20 32h24M20 40h14' stroke='white' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E"
)


def read(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def guide_files() -> list[Path]:
    return sorted(p for p in GUIDES.glob('*.js') if not p.name.startswith('_'))


def slug_of(path: Path) -> str:
    return path.stem


def index_of(path: Path, source: str) -> str:
    """编号优先取内容数据里的 index 字段，其次取文件名前缀。"""
    match = re.search(r"index:\s*'(\d+)'", source)
    if match:
        return match.group(1)
    match = re.match(r'(\d+)', path.name)
    return match.group(1) if match else '00'


def title_of(source: str, fallback: str) -> str:
    match = re.search(r"title:\s*'([^']+)'", source)
    return match.group(1) if match else fallback


def subtitle_of(source: str) -> str:
    match = re.search(r"subtitle:\s*'([^']+)'", source)
    return match.group(1) if match else '一步一步来'


def embed_resources(source: str) -> str:
    """仅处理显式资源标记；附件和配图随单文件教材一起打包。"""
    def replace(match: re.Match) -> str:
        mode, relative = match.groups()
        path = (ROOT / relative).resolve()
        if not path.is_relative_to(ROOT.resolve()) or not path.is_file():
            raise ValueError(f'资源不存在或超出 ai-guides：{relative}')
        if mode == 'text':
            return json.dumps(read(path), ensure_ascii=False).replace('<', '\\u003c')
        mime = 'image/webp' if path.suffix.lower() == '.webp' else mimetypes.guess_type(path.name)[0]
        if mime not in {'image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'}:
            raise ValueError(f'不支持的图片格式：{relative}')
        encoded = base64.b64encode(path.read_bytes()).decode('ascii')
        return json.dumps(f'data:{mime};base64,{encoded}')

    return re.sub(r"'@embed-(text|image):([^'\r\n]+)'", replace, source)


def build(slug: str | None = None) -> None:
    css = read(CSS)
    engine = read(ENGINE)
    widget = support_widget()
    files = [p for p in guide_files() if slug is None or slug_of(p) == slug]
    if not files:
        print('没有找到匹配的内容文件')
        return
    for path in files:
        source = embed_resources(read(path).strip())
        source = re.sub(r'^window\.AI_GUIDE\s*=\s*', '', source)
        source = source.rstrip(';').rstrip()
        name = slug_of(path)
        index = index_of(path, source)
        title = title_of(source, name)
        subtitle = subtitle_of(source)
        page = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f7f8fc" />
  <meta name="description" content="{title}：一步一步的引导版教程，填好参数照着做就行。" />
  <meta name="robots" content="noindex" />
  <link rel="icon" type="image/svg+xml" href="{FAVICON}" />
  <title>{title} · 配置向导</title>
  <style>
{css}
  </style>
</head>
<body>
  <a class="skip-link" href="#stepCard">跳到当前步骤</a>
  <header class="site-header">
    <div class="header-inner">
      <span class="brand"><span class="brand-mark" aria-hidden="true">›_</span><span>配置向导<span class="brand-name"> · {index}</span></span><span class="brand-tag">一步一步</span></span>
      <div class="header-actions">
        <a class="header-link" href="#phaseList"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg><span>看步骤总览</span></a>
        <button class="ghost-button" id="resetButton" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6"/></svg><span>重新开始</span></button>
      </div>
    </div>
  </header>
  <div class="progress-strip">
    <div class="progress-strip-inner">
      <span class="strip-guide" id="guideTitle">{title}</span>
      <div class="strip-progress"><div class="progress-track" id="progressTrack" role="progressbar" aria-label="当前进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar" id="progressBar"></div></div></div>
      <div class="strip-meta"><span id="progressCount">第 1 步</span><strong id="progressPercent">0%</strong><span class="save-status" id="saveStatus"><span class="status-dot"></span>进度自动保存</span></div>
    </div>
  </div>
  <main class="main-content">
    <section class="journey" aria-label="流程概览">
      <ol class="phase-list" id="phaseList"></ol>
    </section>
    <section class="content-grid">
      <article class="step-card" id="stepCard" tabindex="-1">
        <div class="missing-card"><h2>正在加载内容…</h2><p>如果这行字一直在，说明页面脚本没跑起来。</p></div>
      </article>
      <aside class="coach-column" aria-label="向导提示">
        <section class="coach-card">
          <div class="coach-cover">
            <div class="coach-title"><span class="coach-kicker">你的向导</span><h2>{subtitle}</h2><p>每一步只做一件事，做完再点继续。</p></div>
          </div>
          <div class="coach-content">
            <div class="tip-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 .8-1 1.5-1 2H9c0-.5 0-1.2-1-2Z"/></svg>这一步的小提示</div>
            <p id="coachText"></p>
            <div class="handoff-row"><span>当前状态</span><span class="handoff-status" id="handoffStatus"><span class="status-dot"></span>准备中</span></div>
          </div>
        </section>
        <section class="step-toc" id="stepToc" aria-label="步骤目录"></section>
        <div class="save-note"><span class="save-note-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2Z"/><path d="m9 9 2 2 4-4"/></svg></span><div><strong>走到哪，就记到哪</strong><p>进度和填过的参数都保存在当前浏览器，下次打开可以接着来。</p></div></div>
      </aside>
    </section>
    <footer class="footer-note"><span>配置向导 <span class="footer-dot">·</span> 一步一步来</span><span>第三方服务、价格与规则以对方页面为准；请遵守相关服务条款与当地法规</span></footer>
  </main>
  <dialog class="reset-dialog" id="resetDialog" aria-labelledby="resetTitle">
    <form method="dialog"><span class="dialog-symbol" aria-hidden="true">↺</span><h2 id="resetTitle">重新开始这篇向导？</h2><p>会清除当前浏览器里这篇教程的进度和填过的参数，从第一步重新开始。</p><div class="dialog-actions"><button class="secondary-button" value="cancel" autofocus>继续当前步骤</button><button class="primary-button" id="confirmReset" value="reset">重新开始</button></div></form>
  </dialog>
  <dialog class="image-dialog" id="imageDialog" aria-labelledby="imageDialogCaption">
    <div class="image-dialog-bar"><span id="imageDialogCaption"></span><button class="icon-button" id="closeImage" type="button" aria-label="关闭大图"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="image-dialog-scroll"><img id="imageDialogImage" alt="" /></div>
  </dialog>
  <script>
    window.AI_GUIDE_SLUG = '{name}';
    window.AI_GUIDE = {source};
  </script>
  <script>
{engine}
  </script>
{widget}
</body>
</html>
"""
        target = ROOT / f'{index}-{name}.html'
        target.write_text(page, encoding='utf-8')
        print(f'已生成 {target.relative_to(ROOT.parent)}  ({len(page) // 1024} KB)')


# ───────────────────────── G 风格 ─────────────────────────

SITE_DEFAULT = ROOT.parent / 'map'
G_PAGE = ROOT / 'assets' / 'g-page.html'
G_CSS = ROOT / 'assets' / 'g-guide.css'
G_ENGINE = ROOT / 'assets' / 'g-engine.js'
G_FONTS = ('pg-heading-900.woff2', 'bricolage-800-sub.woff2')
HEADING_CHARS = ROOT.parent / 'tools' / 'fonts' / 'heading-chars.txt'
QR_URL = '../ai-group-qr.png?v=20261020tg'
FAVICON_G = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Crect x='3' y='3' width='58' height='58' rx='18' fill='%236459d9' stroke='%231a1830' stroke-width='4'/%3E"
    "%3Cpath d='M20 24h24M20 32h24M20 40h14' stroke='white' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E"
)


def short_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:10]


def write_if_changed(path: Path, data: bytes) -> bool:
    if path.is_file() and path.read_bytes() == data:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return True


def g_select(names: list[str]) -> list[Path]:
    """不给名字就是全部正式教程（不含 _ 开头的草稿/演示）；给了名字就按名字找，_ 可省略。"""
    if not names:
        return guide_files()
    found = []
    for name in names:
        stem = name.removesuffix('.js')
        candidates = [GUIDES / f'{stem}.js', GUIDES / f'_{stem.lstrip("_")}.js', GUIDES / f'{stem.lstrip("_")}.js']
        path = next((p for p in candidates if p.is_file()), None)
        if not path:
            raise SystemExit(f'没有找到内容文件：guides/{stem}.js')
        found.append(path)
    return found


def g_string(source: str, key: str, default: str = '') -> str:
    pattern = rf'''(?<![\w$])(?:{re.escape(key)}|["']{re.escape(key)}["'])\s*:\s*((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))'''
    match = re.search(pattern, source)
    return ast.literal_eval(match.group(1)) if match else default


def g_index(path: Path, source: str) -> str:
    value = g_string(source, 'index')
    if not value:
        match = re.search(r'''(?:\bindex|["']index["'])\s*:\s*(\d+)''', source)
        value = match.group(1) if match else index_of(path, source)
    if not re.fullmatch(r'\d{2}', value):
        raise ValueError(f'教程编号必须为两位数字：{path.name}: {value}')
    return value


def g_resources(source: str, site: Path, inline: bool = False) -> str:
    """资源标记可用于 JS 字段和富文本中的图片地址。"""
    def resource(mode: str, relative: str) -> str:
        path = (ROOT / relative).resolve()
        if not path.is_relative_to(ROOT.resolve()) or not path.is_file():
            raise ValueError(f'资源不存在或超出 ai-guides：{relative}')
        if mode == 'text':
            return read(path)
        mime = {'.webp': 'image/webp', '.pdf': 'application/pdf',
                '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'}.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0]
        allowed = {'image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf',
                   'application/vnd.openxmlformats-officedocument.presentationml.presentation'}
        if mime not in allowed:
            raise ValueError(f'不支持的资源格式：{relative}')
        data = path.read_bytes()
        if inline:
            return f'data:{mime};base64,' + base64.b64encode(data).decode('ascii')
        assets = (ROOT / 'assets').resolve()
        sub = path.relative_to(assets) if path.is_relative_to(assets) else path.relative_to(ROOT.resolve())
        write_if_changed(site / 'assets' / 'guides' / sub, data)
        return f'../assets/guides/{sub.as_posix()}?v={short_hash(data)}'

    def quoted(match: re.Match) -> str:
        _, mode, relative = match.groups()
        return json.dumps(resource(mode, relative), ensure_ascii=False).replace('<', '\\u003c')

    for relative in set(re.findall(r'(?<![\w/])\./assets/([\w./-]+\.(?:pdf|pptx))', source)):
        path = (ROOT / 'assets' / relative).resolve()
        if not path.is_relative_to((ROOT / 'assets').resolve()) or not path.is_file():
            raise ValueError(f'缺少教程配套下载：assets/{relative}')
        write_if_changed(site / 'guides' / 'assets' / relative, path.read_bytes())
    source = re.sub(r'''(?<!\\)(["'])@embed-(text|image|file):([^'"\\\r\n]+)\1''', quoted, source)
    return re.sub(r'''@embed-(image|file):([^\s'"<>\\]+)''',
                  lambda match: resource(*match.groups()), source)


def g_link_resources(source: str, site: Path) -> str:
    return g_resources(source, site)


def heading_text(source: str) -> str:
    pattern = r'''(?:\btitle|["']title["'])\s*:\s*((?:"(?:\\.|[^"\\])*")|(?:'(?:\\.|[^'\\])*'))'''
    return ''.join(ast.literal_eval(match.group(1)) for match in re.finditer(pattern, source))


def price_cache():
    sys.path.insert(0, str(ROOT.parent / 'tools' / 'plus-price'))
    import update_price
    quote = json.loads(read(SITE_DEFAULT / 'plus-price.json'))
    home_source = read(SITE_DEFAULT / 'index-g.html')
    match = re.search(r'免税 ₱([\d.]+)，约 ¥([\d.]+)；含税标价 ₱([\d.]+)', home_source)
    if not match:
        raise ValueError('首页源文件缺少价格来源标记')
    old = dict(zip(('php', 'cny', 'php_including_tax'), match.groups()))
    return update_price, old, quote


def g_price_note(slug: str) -> str:
    if slug != 'plus':
        return ''
    price, _, quote = price_cache()
    return '<section class="guide-price" aria-label="每日价格参考">' + price.price_note(quote) + '</section>'


def build_g_home(site: Path) -> None:
    site = site.resolve()
    source = read(SITE_DEFAULT / 'index-g.html')
    price, old, quote = price_cache()
    source = price.render_target(source, 'map.plus-guide.fun/index.html', old, quote)
    assets = [
        'assets/pg-heading-900.woff2', 'assets/bricolage-800-sub.woff2',
        'assets/shot-plus-pricing.webp', 'assets/shot-gemini-offer.webp',
        'assets/shot-magpie-picker.webp', 'ai-group-qr.png', 'backup-qq-qr.webp',
        'apple-touch-icon.png', 'og-image.png', 'plus-price.json',
    ]
    for relative in assets:
        data = (SITE_DEFAULT / relative).read_bytes()
        if site != SITE_DEFAULT.resolve():
            write_if_changed(site / relative, data)
        source = re.sub(re.escape('./' + relative) + r'(?:\?v=[\w-]+)?',
                        './' + relative + '?v=' + short_hash(data), source)
    write_if_changed(site / 'index.html', source.encode('utf-8'))
    print(f'已生成 {site / "index.html"}')


def check_heading_font(site: Path, text: str) -> None:
    font = site / 'assets' / 'pg-heading-900.woff2'
    wanted = {c for c in text if ord(c) > 0x2e7f}
    if not wanted:
        return
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        print('提示：没装 fontTools，跳过标题字体缺字检查（pip install fonttools brotli）')
        return
    if not font.is_file():
        print(f'提示：没有找到标题字体 {font}，跳过缺字检查')
        return
    try:
        have = set(TTFont(font).getBestCmap())
    except Exception as error:  # 没装 brotli 时读不了 woff2
        print(f'提示：读不了标题字体（{error}），跳过缺字检查')
        return
    missing = sorted(c for c in wanted if ord(c) not in have)
    if not missing:
        print('✓ 标题字体包含全部标题用字')
        return
    known = set(HEADING_CHARS.read_text(encoding='utf-8')) if HEADING_CHARS.is_file() else set()
    HEADING_CHARS.parent.mkdir(parents=True, exist_ok=True)
    HEADING_CHARS.write_text(''.join(sorted((known | set(missing)) - {'\n'})), encoding='utf-8')
    print(f'！标题字体缺 {len(missing)} 个字：{"".join(missing)}')
    print(f'  已追加到 {HEADING_CHARS.relative_to(ROOT.parent)}，重新生成字体：')
    print('  python tools/fonts/build_heading_font.py <思源黑体分片目录> tools/fonts/heading-chars.txt map/assets/pg-heading-900.woff2')
    print('  （不重新生成也能用，缺的字会用系统粗体显示，只是粗细不完全一致）')


def build_g(names: list[str], site: Path, inline: bool) -> None:
    page_template = string.Template(read(G_PAGE))
    css = read(G_CSS)
    engine = read(G_ENGINE)
    site = site.resolve()
    (site / 'guides').mkdir(parents=True, exist_ok=True)
    (site / 'assets').mkdir(parents=True, exist_ok=True)

    for font in G_FONTS:
        target = site / 'assets' / font
        source = SITE_DEFAULT / 'assets' / font
        if source.is_file() and source.resolve() != target.resolve():
            write_if_changed(target, source.read_bytes())
        if not target.is_file():
            raise ValueError(f'缺少共享字体：assets/{font}')
        data = target.read_bytes()
        url = ('data:font/woff2;base64,' + base64.b64encode(data).decode('ascii')) if inline else f'{font}?v={short_hash(data)}'
        css = css.replace(f'url("{font}")', f'url("{url}")')

    qr_source = SITE_DEFAULT / 'ai-group-qr.png'
    if inline:
        css_tag = '<style>\n' + css + '</style>'
        engine_tag = '<script>\n' + engine + '</script>'
        font_preload = ''
        qr = 'data:image/png;base64,' + base64.b64encode(qr_source.read_bytes()).decode('ascii')
    else:
        css_bytes, engine_bytes = css.encode('utf-8'), engine.encode('utf-8')
        for name, data in (('g-guide.css', css_bytes), ('g-engine.js', engine_bytes)):
            if write_if_changed(site / 'assets' / name, data):
                print(f'已更新 assets/{name}')
        css_tag = f'<link rel="stylesheet" href="../assets/g-guide.css?v={short_hash(css_bytes)}">'
        engine_tag = f'<script src="../assets/g-engine.js?v={short_hash(engine_bytes)}" defer></script>'
        font_data = (site / 'assets' / G_FONTS[0]).read_bytes()
        font_preload = f'<link rel="preload" href="../assets/{G_FONTS[0]}?v={short_hash(font_data)}" as="font" type="font/woff2" crossorigin>'
        qr = '../ai-group-qr.png?v=' + short_hash(qr_source.read_bytes())
        if site != SITE_DEFAULT.resolve():
            write_if_changed(site / 'ai-group-qr.png', qr_source.read_bytes())

    all_titles = []
    for path in g_select(names):
        raw = read(path).strip()
        if g_string(raw, 'slug', path.stem) == 'plus':
            price, old, quote = price_cache()
            raw = price.replace_currency(raw, old, quote)
        source = g_resources(raw, site, inline)
        source = re.sub(r'''^\s*(?:(?://[^\n]*\n)|(?:/\*.*?\*/\s*))*\s*(?:window\.AI_GUIDE_SLUG\s*=\s*(?:"[^"]*"|'[^']*')\s*;\s*)?window\.AI_GUIDE\s*=\s*''', '', source, flags=re.S)
        source = source.rstrip().rstrip(';').rstrip().replace('</script', '<\\/script')
        if not source.startswith('{') or not source.endswith('}'):
            raise ValueError(f'内容文件需要赋值一个 AI_GUIDE 对象：{path.name}')
        stem = slug_of(path).lstrip('_')
        slug = g_string(source, 'slug', stem)
        if not re.fullmatch(r'[a-z0-9_-]+', slug):
            raise ValueError(f'非法教程标识：{slug}')
        index = g_index(path, source)
        title = g_string(source, 'title', stem)
        subtitle = g_string(source, 'subtitle', '一步一步来')
        if not re.search(r'''(?:\bcategory|["']category["'])\s*:''', source):
            account = {'claude-account-env', 'google-account', 'google-region', 'plus', 'roogoo-card', 'gemini-student', 'pixel-ai-pro'}
            coding = {'cli-proxy-api', 'new-api', 'poste-io', 'cloudflare-halo', 'swap-memory', 'grok-orca', 'vps'}
            category = 'account' if slug in account else 'coding' if slug in coding else 'tools'
            source = source.replace('{', '{category: ' + json.dumps(category) + ',', 1)
        all_titles.append(heading_text(source))
        page = page_template.substitute(
            title=html.escape(title),
            description=html.escape(f'{title}：{subtitle}。每一步配截图，跟着做就行。'),
            favicon=FAVICON_G,
            asset_base='../assets/',
            css_tag=css_tag,
            engine_tag=engine_tag,
            font_preload=font_preload,
            price_note=g_price_note(slug),
            home='../',
            qr=qr,
            slug=slug,
            data=source,
        )
        target = site / 'guides' / f'{index}-{stem}.html'
        target.write_text(page, encoding='utf-8')
        print(f'已生成 {target}  ({len(page.encode("utf-8")) // 1024} KB{"，单文件" if inline else ""})')

    check_heading_font(site, ''.join(all_titles))


def main() -> None:
    parser = argparse.ArgumentParser(description='把 guides/<slug>.js 生成教程页面')
    parser.add_argument('names', nargs='*', help='只生成这几篇（guides/ 下的文件名，不带 .js）')
    parser.add_argument('--g', action='store_true', help='用 G 风格模板生成（输出到 map/）')
    parser.add_argument('--inline', action='store_true', help='G 风格：样式、引擎和配图全部内联成单文件')
    parser.add_argument('--home', action='store_true', help='G 风格：同时由 index-g.html 生成正式首页')
    parser.add_argument('--out', type=Path, default=SITE_DEFAULT, help='G 风格：输出根目录，默认 ../map')
    args = parser.parse_args()
    if args.g:
        build_g(args.names, args.out, args.inline)
        if args.home:
            build_g_home(args.out)
        return
    if args.inline or args.home or args.out != SITE_DEFAULT:
        raise SystemExit('--inline、--home 和 --out 只能和 --g 一起用')
    if len(args.names) > 1:
        raise SystemExit('旧样式一次只能指定一篇')
    build(args.names[0] if args.names else None)


if __name__ == '__main__':
    main()

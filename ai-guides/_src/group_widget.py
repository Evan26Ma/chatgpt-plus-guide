"""AI 交流群悬浮入口：构建脚本共用的自包含区块（二维码内联为 data URI）。"""
import base64
from pathlib import Path

QR = Path(__file__).resolve().parents[2] / 'ai-group-qr.png'

TEMPLATE = """
<!-- ═══ AI 交流群入口（自包含，不依赖站点样式）═══ -->
<div class="support-float" id="supportFloat">
  <button class="support-btn" id="supportBtn" type="button" aria-expanded="false" aria-controls="supportPanel">
    <span class="support-btn-icon" aria-hidden="true">?</span>
    <span class="support-btn-text">有不会的？点这里</span>
  </button>
  <div class="support-panel" id="supportPanel" hidden>
    <button class="support-close" id="supportClose" type="button" aria-label="关闭">&times;</button>
    <h3>有不会的，扫码进群问</h3>
    <p>AI 交流群，操作和配置上遇到问题都可以进群问。</p>
    <img src="@@QR@@" alt="AI 交流群二维码" decoding="async" />
    <p class="support-num"><a href="https://t.me/+_lOsXtUCD9MxNzY1" target="_blank" rel="noopener noreferrer">Telegram 交流群 &rarr;</a></p>
  </div>
</div>
<style>
  .support-float{position:fixed;right:20px;bottom:20px;z-index:800;font-family:"Microsoft YaHei UI","Segoe UI",system-ui,sans-serif;}
  .support-btn{display:flex;align-items:center;gap:8px;border:none;border-radius:999px;padding:12px 20px;background:#6459d9;color:#fff;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:0 6px 20px rgba(100,89,217,.36);transition:background .15s,transform .1s;}
  .support-btn:hover{background:#5145c4;}
  .support-btn:active{transform:translateY(1px);}
  .support-btn-icon{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.25);font-size:13px;line-height:1;}
  .support-panel{position:absolute;right:0;bottom:62px;width:264px;max-height:calc(100vh - 96px);overflow:auto;background:#fff;border-radius:16px;padding:18px;box-shadow:0 16px 44px rgba(0,0,0,.2);text-align:center;}
  .support-close{position:absolute;top:6px;right:10px;border:none;background:none;padding:4px;font-size:22px;line-height:1;color:#9aa0b4;cursor:pointer;}
  .support-close:hover{color:#272938;}
  .support-panel h3{margin:0 0 6px;font-size:16px;color:#272938;}
  .support-panel p{margin:0 0 12px;font-size:13px;line-height:1.6;color:#5b5f72;}
  .support-panel img{width:100%;display:block;border-radius:10px;}
  .support-panel .support-num{margin:10px 0 0;font-size:13px;font-weight:600;color:#272938;}
  .support-panel .support-num a{color:inherit;text-decoration:underline;text-underline-offset:2px;}
  @media (max-width:520px){.support-float{right:12px;bottom:12px;}.support-panel{width:min(264px,calc(100vw - 40px));}.support-btn{padding:11px 14px;}.support-btn-text{display:none;}}
  @media (prefers-reduced-motion:reduce){.support-btn{transition:none;}}
</style>
<script>
  (function () {
    var btn = document.getElementById('supportBtn');
    var panel = document.getElementById('supportPanel');
    var close = document.getElementById('supportClose');
    if (!btn || !panel) return;
    function open() { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    function shut() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () { panel.hidden ? open() : shut(); });
    if (close) close.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  })();
</script>
"""


def widget() -> str:
    """返回悬浮入口区块，二维码内联为 data URI。"""
    qr = 'data:image/png;base64,' + base64.b64encode(QR.read_bytes()).decode('ascii')
    return TEMPLATE.replace('@@QR@@', qr)


def inject(page: str) -> str:
    """把悬浮入口插到 </body> 之前。"""
    marker = '</body>'
    if marker not in page:
        raise ValueError('页面里找不到 </body>')
    return page.replace(marker, widget() + marker, 1)

# 菲律宾 Plus 每日参考价

价格来源为用户指定的 [GPTSub](https://gptsub.linusx.dev/)。查询固定的 `/api/proxy/configs/PH`，只接受 `PH`、`PHP`、`plus.month`；教程沿用免税参考价 `psp_override.amount`，并同时显示含税 `amount`。人民币按 GPTSub 使用的 currency-api 美元基准汇率换算：`PHP金额 × USD/CNY ÷ USD/PHP`，四舍五入到分。

## 已部署

- 程序：`sg:/opt/plus-guide-price/update_price.py`
- 状态：`/var/lib/plus-guide-price/state.json`
- 每次写入前备份：`/var/lib/plus-guide-price/backups/<时间>/`
- systemd：`plus-guide-price.service` / `plus-guide-price.timer`
- 时间：`OnCalendar=*-*-* 04:00:00 Asia/Shanghai`；无随机延迟，服务器关机错过时段时不额外补跑。
- 首次更新：2026-11-01 08:25:04 +08:00，PHP 982.14，约 CNY 102.53，汇率数据日期 2026-10-31。
- 首次发布整站备份：`sg:/home/ubuntu/plus-guide-price-before-20261101-082233.tar.gz`。

每日任务只执行一轮查询：菲律宾价格一次、汇率一次。查询开始前写入当天尝试日期，并用文件锁防并发；同一天再次启动只打印 `SKIP`，失败也不自动重复请求。只解析这两个目标，不抓取全部国家。访客浏览页面不会调用价格源。

首次运行因服务器 Mihomo 返回 198.18.x.x 虚拟地址被安全检查拒绝，尚未发出价格源请求。改为经固定公网解析器 `1.1.1.1` 的 HTTPS DNS 获取来源真实地址，校验后固定 IP 连接且保留原域名做 TLS 校验；不修改现有代理配置。DNS 失败记录保存在 `initial-dns-failure.json`。任意跳转均拒绝，来源主机/路径固定，私网、环回、保留、组播和链路本地地址均拒绝。

## 更新页面

- `/var/www/map.plus-guide.fun/index.html`
- `/var/www/map.plus-guide.fun/guides/17-plus.html`
- `/var/www/plus-guide/index.html`
- `/var/www/plus-guide/app.js`
- 两个站点各自的 `plus-price.json`

价格变动时只替换已知人民币与 PHP 数字，保留图片文件名、其他正文和用户进度；页面新增来源、上次成功时间、每天 04:00 更新及结账页为准说明。写入前先生成全部候选文件并备份，任一写入失败回滚已改文件。请求或数据校验失败保留上次成功页面。

主页及 map 教程当前 `no-cache / DYNAMIC`，主站脚本 `no-store / BYPASS`；首次发布从公网检查四份文件和 JSON。若未来调整 CDN 缓存策略，需要同时安排缓存刷新。

## 运维

```bash
systemctl list-timers plus-guide-price.timer
journalctl -u plus-guide-price.service -n 30 --no-pager
sudo systemctl start plus-guide-price.service
```

同日启动不会重新查询。重新发布首页或教程后，可使用缓存值恢复价格和提示块，不请求外站：

```bash
sudo python3 -B /opt/plus-guide-price/update_price.py --apply-cached
```

本地 `map/index.html`、`map/index-practical.html`、根 `index.html`、`app.js` 和两份 JSON 已同步首次结果。后续部署前先读取服务器当前 JSON，在本地应用缓存，或部署后立即执行 `--apply-cached`，防止旧价格覆盖。新版 Plus 的内容源为 `ai-guides/guides/plus.js`，通过 `python ai-guides/_src/build.py --g --home` 重建。构建保留唯一价格标记；缓存重放会识别发布包标记中的旧价格，兼容发布包和服务器缓存金额不同。旧 `ai-guides/17-plus.html` 仅作历史归档。

```bash
PYTHONDONTWRITEBYTECODE=1 python F:/AI/chatgpt-plus-guide/tools/plus-price/test_update_price.py
```

测试覆盖换算、只取 Plus 月付、异常数据拒绝、URL 与私网校验、同日只查一次、源失败保留、次日变化、无网络缓存重放、写入回滚。首轮真实站点夹具测试已通过，仓库测试使用最小页面夹具，避免依赖临时文件。

# 教程建议区

免费教程首页 https://map.plus-guide.fun/ 左下角的「教程建议」用于收集「优化现有教程」和「想看新教程」两类建议。操作与配置问题引导到现有右下角交流群；页面和服务端都提示涉及 VPN 的内容不提供教学，并拦截对应关键词。

建议存入服务器私有 SQLite 数据库，不公开展示，不要求联系方式，也不向交流群或其他服务自动发送消息。表单提醒用户不要填写密码、验证码或密钥。提交成功显示建议编号，失败保留当前页面中的草稿；刷新页面不保留草稿。

## 文件和运行位置

- 前端：`map/index.html`，同内容设计稿 `map/index-practical.html`。
- 服务端：本目录 `server.py`，服务器 `/opt/plus-guide-suggestions/server.py`，只依赖 Python 标准库。
- systemd：本目录 `plus-guide-suggestions.service`，服务器 `/etc/systemd/system/plus-guide-suggestions.service`，开机启动。
- 监听：`127.0.0.1:18093`；`/health` 仅供本机检查。
- Caddy：`/etc/caddy/sites/map.plus-guide.fun.caddy` 只把 `/api/suggestions` 代理到该服务，其他路径仍使用原静态文件服务。
- 数据：`/var/lib/plus-guide-suggestions/suggestions.sqlite3`；目录 0700，数据库 0600，由 systemd DynamicUser 和 StateDirectory 管理。
- 频率校验盐：同目录 `rate-salt`，0600。保留此文件以维持同一客户端的限额判断。

## 查看建议

在有已配置 SSH 别名的机器上运行：

```sh
ssh -o ControlMaster=no -o BatchMode=yes sg 'sudo python3 -B /opt/plus-guide-suggestions/server.py --export'
```

输出私有 JSON，包含编号、北京时间、类型、教程标识、主题和建议正文，按时间倒序排列。`improve` 表示优化现有教程，`new` 表示新教程选题。这个命令只读数据库；服务端没有公开的建议列表接口。

检查运行状态与错误：

```sh
ssh -o ControlMaster=no -o BatchMode=yes sg 'systemctl is-active plus-guide-suggestions.service; sudo journalctl -u plus-guide-suggestions.service -n 30 --no-pager'
```

备份数据时使用 SQLite 的 backup 功能，或先暂停此建议服务再复制数据库。不要在服务写入期间只复制主数据库文件后将其视为一致备份。

## 接收限制

- 仅接受来自 `https://map.plus-guide.fun` 的 JSON POST，要求固定自定义请求头。
- 正文 10–1500 字；新主题 2–80 字；请求体最多 8192 字节。
- 优化建议必须选择首页现有的 14 篇教程之一（住宅 IP 向导标识为 `ip-guide`）。新增或移除首页教程时，同步维护 `server.py` 的 `TUTORIALS` 允许列表。
- UUID 提交编号用于重试去重，重复请求返回原编号。
- 每个客户端每小时最多保存 5 条；全站每天最多 200 条、总计最多 5000 条；SQLite 页数上限约 16 MiB。达到限额后明确提示提交失败，不显示虚假成功。
- 只持久化加盐哈希用于短期限额，不保存原始 IP；限额记录在后续提交时清除超过 24 小时的条目。关键词检查用于限定教学范围，不作为完整语义分类器。

## 验证与发布记录

2026-11-01 上线。本地 `python -B tools/suggestions/test_server.py` 三项测试通过，覆盖输入与范围检查、SQLite 持久化与重试去重、限额与请求校验。Playwright 覆盖两类建议、失败保留草稿、VPN 拦截、交流群切换、键盘关闭和 1440/768/390/320px 布局。

发布时校验暂存文件 MD5 与 SHA-256、检查旧首页与 Caddy 配置摘要，备份整站及该站配置，验证全套 Caddy 配置后平滑 reload。只新增此建议服务，没有重启其他业务服务。首页发布后使用价格程序 `--apply-cached` 重放当日缓存，未额外请求价格源，04:00 价格定时器仍运行。

- 备份：`sg:/home/ubuntu/map-suggestions-before-20261101-094056.tar.gz`。
- 首页 SHA-256：`ce9ce2b26cdb6408cf62fa03ac9360297e2dca9dcdbf77f58ed9654c43c63635`。
- Caddy 配置 SHA-256：`541dd0a02abe0426c7fb5c415398b00027452d3e5063c792b622d4e967b493a1`。
- 服务端 SHA-256：`cb9b5fb83b2c35fe270d912e5cc192c5b4d29484f6946a7595bc8c55c26bb42f`。
- systemd 单元 SHA-256：`21cfe502abe08d16127ae55ea0d8cf406504e9bdec07f2d6dea64a0dc8f5799b`。

公网首页回拉 SHA-256 一致，HTTP 200、`Cache-Control: no-cache`、Cloudflare `DYNAMIC`。Chrome 通过桌面端「优化现有教程」和 390px 手机端「想看新教程」真实提交，均取得建议编号并核对服务器记录；重复提交返回同一编号，VPN 内容返回 422，公开读取接口返回 405。两条带「上线验收测试」标识的测试建议已按精确编号清除，SQLite 完整性和维护者只读导出正常。未执行 Cloudflare purge，也未发送群消息。

# Plus Guide · G 风格说明（贴纸 + 深色描边）

2026-11-04 定稿。首页和所有教程内页统一用这一套。新页面、改旧页面之前先读完这份。

一句话：**白底、深色 2px 描边、浅色底块、歪着贴的小贴纸、很粗的中文标题；动效多但都有用，且全部尊重“减少动态效果”。**

---

## 1. 文件

**源文件（改这些）**

| 文件 | 作用 |
|---|---|
| `ai-guides/assets/g-page.html` | 教程页外壳：顶栏、三栏布局、求助栏、弹窗；`$title` 这类占位符由构建脚本填 |
| `ai-guides/assets/g-guide.css` | 教程页共享样式 |
| `ai-guides/assets/g-engine.js` | 教程页共享引擎：读 `window.AI_GUIDE`，负责渲染、路线、导航、本地进度 |
| `ai-guides/guides/<slug>.js` | 每篇正文数据，新旧样式共用同一份 |
| `ai-guides/guides/_g-demo.js` | 模板演示数据（谷歌注册节选 5 步），`_` 开头，旧构建会跳过 |
| `ai-guides/_src/build.py` | 构建脚本：默认出旧样式，加 `--g` 出 G 风格 |
| `map/index-g.html` | 新首页（确认后改名为 `index.html` 上线） |
| `tools/fonts/build_heading_font.py` / `heading-chars.txt` | 重新生成标题字体的脚本，以及字体里该有哪些字 |

**生成的文件（不要手改，重新构建会覆盖）**

| 文件 | 作用 |
|---|---|
| `map/guides/<编号>-<slug>.html` | 每篇教程页，只含正文数据，样式和引擎外链 |
| `map/assets/g-guide.css`、`map/assets/g-engine.js` | 从 `ai-guides/assets/` 复制过来的共享文件 |
| `map/assets/guides/<子目录>/…` | 教程配图，按 `ai-guides/assets/` 下的原路径复制，多篇共用同一张图时只存一份 |
| `map/assets/pg-heading-900.woff2` | 标题字体：思源黑体 Black 裁剪版，已包含首页和现有 26 篇全部标题用字（约 91 KB，全站共用一份缓存） |
| `map/assets/bricolage-800-sub.woff2` | `plus.guide` 字标字体（约 5 KB，OFL 授权） |

`map/guides/g-template.html` 是拆分之前的单文件样稿，已被 `00-g-demo.html` 取代，可以删掉。

## 2. 设计原则

1. **一眼像贴纸本**：白纸上贴着一张张带深色勾边的卡片和贴纸。所有可点的东西都有 2px 深色描边。
2. **大胆只用在三处**：首屏大标题、歪着的贴纸、悬停时卡片抬起露出的深色底边。其余部分保持干净。
3. **颜色只是浅底**：卡片底色在 5 种浅色里轮换，不用渐变、不用柔和阴影、不用彩色描边。
4. **文案口语化、短**：标题像朋友说话（“别慌，跟着做就行。”），按钮写清点了会发生什么（“邮箱与密码已设置”）。
5. **动效回应操作**：开场一次、滚动入场、悬停和勾选反馈。开了“减少动态效果”的用户看到完全静态的页面。

## 3. 颜色（CSS 变量，写在 `:root`）

| 变量 | 值 | 用途 |
|---|---|---|
| `--ink` | `#1a1830` | 文字、所有描边、深色按钮 |
| `--text` | `#3d3a55` | 次要正文 |
| `--muted` | `#5d5a75` | 说明文字 |
| `--faint` | `#6b6885` | 小字、日期（白底对比度约 5:1，不要再浅） |
| `--violet` | `#6459d9` | 品牌紫：主按钮、进度条、强调 |
| `--violet-dark` | `#4f44c6` | 紫色小字链接 |
| `--green` | `#1fa971` | 完成、勾选 |
| `--soft` / `--track` | `#faf9fe` / `#f1eff9` | 浅灰紫区块、进度条底 |
| 卡片浅底 | `--lilac #f1eeff` `--mint #eafbf3` `--butter #fff8d9` `--sky #eef5ff` `--peach #fff1e8` | 卡片、对照表、选项轮换使用 |
| 贴纸色 | `--stk-yellow #fff1a8` `--stk-mint #cff5e7` `--stk-peach #ffe0cc` `--stk-lilac #e9e5ff` `--stk-sky #e0ecff` | 只用于贴纸和高亮 |

规则：紫色小字不要放在浅紫底上（对比度不够）。新教程标签用薄荷绿贴纸，“先看这篇”用黄色，价格用淡紫。

## 4. 字体

- 正文：系统字体 `PingFang SC / Microsoft YaHei UI / HarmonyOS Sans SC / Noto Sans SC`。**不要引用 Google Fonts**，国内经常打不开。
- 标题（h1/h2/h3、区块标题、滚动条）：`PG Heading`，即思源黑体 Black 裁剪版，缺字时退回系统粗体。
- 字标 `plus.guide`：`PG Mark`（Bricolage Grotesque 800），紫色的点是 `<i>.</i>`。
- 代码、提示词：系统等宽字体。

**加了新教程标题后必须重新生成标题字体**，否则新字会用系统字体显示，粗细不一致：

```bash
# 1) 把新标题里的字追加进 tools/fonts/heading-chars.txt
# 2) 用 npm 下载思源黑体分片（只需一次）：npm pack @fontsource/noto-sans-sc@5.1.0 && tar xzf fontsource-noto-sans-sc-5.1.0.tgz
# 3) 生成（需要 pip install fonttools brotli）
python tools/fonts/build_heading_font.py package/files tools/fonts/heading-chars.txt map/assets/pg-heading-900.woff2
```

字号：首屏大标题 `clamp(52px, 8.6vw, 104px)`，字距 -0.04em；区块标题 36px；卡片标题 21px；内页步骤标题 `clamp(30px, 3.4vw, 42px)`；正文 15–17px，行高 1.7–1.9。

## 5. 形状与组件规则

| 元素 | 规则 |
|---|---|
| 描边 | 卡片、按钮、输入框 `2px solid var(--ink)`；贴纸、清单行、小图 `1.5px` |
| 圆角 | 卡片 24px，大区块 36px，清单/对照表 18px，按钮和贴纸全圆角 999px |
| 阴影 | 平时没有。悬停时 `0 4–6px 0 var(--ink)`，是实色硬边，不是模糊阴影 |
| 贴纸 `.sticker` | 1.5px 描边、全圆角、12–14px 粗体；外层套一个 `rotate(-6°~6°)` 的容器，让它歪着贴 |
| 按钮 `.btn` | 白底 / 紫底 `.btn-violet` / 深色 `.btn-ink`；悬停上移 2px 并露出深色底边，按下下沉 |
| 卡片 `.card` | 浅底轮换；`tall` 占两行并在底部露出截图；`wide` 占两列。排布用 `grid-auto-flow:dense`，每个分区要刚好铺满，不留空格 |
| 搜索高亮 `mark` | 黄色贴纸底加 1px 描边 |

不要做：渐变、模糊阴影、左侧彩条卡片、全大写英文小标签、给不是步骤的内容加 01/02/03、emoji 图标、链接后面加“→”。

## 6. 动效清单

所有动画都写在 `@media (prefers-reduced-motion: no-preference)` 里。悬停效果用独立的 `translate` / `rotate` / `scale` 属性，入场动画用 `transform`，两者不会互相覆盖。

**首页**
- 开场：标题两行依次升起，副标题和搜索框随后出现
- 常搜贴纸：从上方掉下、弹一下，之后轻轻漂浮；悬停时歪一下并放大
- 搜索框：占位文字自动打字示例（聚焦或已输入时停止）
- 滚动条：微斜的黄色条带滚动教程名，悬停暂停
- 起步卡：看过的篇数进度条带斜纹填满；路线药丸依次上下跳，虚线持续前进
- 滚动入场：卡片、分区标题、问答依次浮现（用 `animation-timeline: view()`，不支持的浏览器直接显示）
- 卡片悬停：抬起 6px 并露出深色底边，角贴纸转动，截图上滑
- 问答：展开时加号转成叉、底色变黄；问号贴纸和二维码慢慢摆动

**内页**
- 每次换步：内容分块依次升起，焦点移到新标题（读屏可感知）
- 目录：首次进入依次滑入；“在这”贴纸轻跳
- 勾选：所在行变薄荷绿、文字划线、勾选框弹一下
- 完成一步：底部弹出“第 n 步搞定！”贴纸，约 1.5 秒后消失
- 完成页：“搞定！”贴纸弹出；“注意”贴纸进入时晃一下

## 7. 教程内页模板

### 7.1 布局

```
┌ 顶栏：plus.guide ｜ 分类 / 教程名 ────────────── [全部教程] ┐
├──────────────┬──────────────────────────────┬───────────────┤
│ 进度卡       │ 第 n 步 · 阶段名              │ 小提示（coach）│
│ 阶段一       │ 步骤标题                      │ 卡住了？进群   │
│  ✓ 步骤      │ 引导语                        │ 本机记录/重来  │
│  ● 当前 在这 │ ……内容块……                    │               │
│  ○ 未到      │ [上一步]   [完成，下一步]     │               │
└──────────────┴──────────────────────────────┴───────────────┘
```

- ≥1180px：三栏。820–1180px：右栏移到正文下方。<820px：左栏收成顶部可展开的“第 n / N 步 ▾”，上一步 / 下一步固定在屏幕底部。
- 目录只显示当前路线上的步骤；选择题没选之前，后面显示“选好路线后显示”。没到过的步骤不能点。

### 7.2 数据格式（和现有 `guides/*.js` 完全相同）

模板读 `window.AI_GUIDE`，进度存在 `localStorage['aiGuideStateV1::<slug>']`，和旧引擎同一个键、同一结构，**换模板后读者原来的进度直接接上**。新增两个可选字段：`category`（`'account'` / `'tools'` / `'coding'` 或 `{title, href}`）显示在面包屑里；`homeHref` 指定首页地址（默认 `../`）。旧数据里的 `hint`（按钮下方的提示）、`promo`（邀请码块）、`faq` 步骤、`inputs` 的 `example` 和 `optional` 都支持。

| 步骤类型 `kind` | 页面上的样子 | 常用字段 |
|---|---|---|
| `info` | 开始前说明：对照表 + 注意 + 官方链接 | `facts` `note` `links` `button` |
| `choice` | 两三张大选项卡，点了直接进入对应路线 | `choices[{value,title,copy,icon,next}]` |
| `task` | 普通操作步骤 | `facts` `bullets` `images` `code` `agentPrompt` `note` `warn` `tip` `links` `seeAlso` `button` |
| `checks` | 逐项核对，全部勾完才能继续，按钮提示“还差 n 项” | `checks` `tip` `seeAlso` `button` |
| `inputs` | 填参数（地址、端口等），下方实时显示“你填过的参数”，后面步骤里的 `{{key}}` 自动替换 | 顶层 `inputs[{key,label,short,placeholder,hint,example,optional}]` |
| `faq` | 单独的一页问答 | `faqGroups` |
| `done` | 完成页：“搞定！”、接着看、常见问题 | `seeAlso` `faqGroups` `doneGroups` |

字段在页面上的对应：

| 字段 | 呈现 |
|---|---|
| `title` / `intro` / `short` | 步骤标题 / 引导语 / 目录里的短名 |
| `phase` | 所属阶段（`phases` 数组下标），决定目录分组 |
| `facts: [[情况, 说明]]` | “先对照你的情况”：两列彩色小卡 |
| `bullets` | “跟着做”：可勾选的清单。勾选只帮读者记位置，不拦截；存在 `state.ticks` |
| `images: [{src,alt,caption,layout}]` | 带描边的截图卡，点了全屏放大；`layout:'phone'` 用于竖屏截图 |
| `note` / `warn` / `tip` | 黄色“注意” / 橙色“小心” / 绿色“提示”便签，左上角贴纸 |
| `links` | “官方说明”链接卡，新标签页打开 |
| `seeAlso` | “相关 / 接着看”卡片 |
| `code: [{lang,caption,text,note}]` | 浅色代码块，带复制按钮，`#` 开头的行变灰 |
| `agentPrompt: {title,intro,text,hint}` | 淡紫提示词块，带“复制这段提示词” |
| `coach` | 右栏“这一步的小提示” |
| `hint` | 主按钮下方的一行小字；在选择题里替换默认的“选择会决定后面的步骤” |
| `promo: {badge,title,code,reward,hint}` | 黄色邀请码块，带“复制邀请码” |
| `button` | 主按钮上的文字，写成“做完的状态”，例如“邮箱与密码已设置” |
| `next` / `choices[].next` | 跳到指定步骤（下标），不写就是下一步 |

### 7.3 交互约定

- 主按钮会把当前步骤记为完成，弹出“第 n 步搞定！”，然后进入下一步。
- 键盘：← 上一步，→ 下一步。在输入框里和弹窗打开时不响应。
- “重新开始”点两次确认（不用浏览器自带的 confirm 弹窗），只清除这一篇的进度。
- 改了选择题的答案，后面走过的步骤会重置。

## 8. 构建与迁移

### 8.1 命令（在 `ai-guides/` 下运行）

```bash
python _src/build.py                              # 旧样式，全部（和以前完全一样）
python _src/build.py cli-proxy-api                # 旧样式，单篇

python _src/build.py --g                          # G 风格，全部正式教程 → ../map/guides/
python _src/build.py --g google-account _g-demo   # G 风格，只生成指定几篇
python _src/build.py --g --inline google-account  # G 风格单文件版：样式、引擎、配图全部内联（约 400 KB）
python _src/build.py --g --out D:/preview         # 输出到别的目录，结构和 map/ 一样
python _src/check.py                              # 内容数据自检（新旧通用）
```

- 共享样式和引擎带 `?v=内容哈希`。改了 `g-guide.css` 或 `g-engine.js` 再构建，地址自动变化，浏览器和 Cloudflare 不会拿到旧缓存。
- 配图写法不变，还是 `'@embed-image:assets/xxx/yyy.webp'`。G 风格默认把图复制到 `map/assets/guides/xxx/yyy.webp` 并改成外链，`--inline` 时才转成 base64。
- 构建时会检查标题字体缺字。缺的字会自动追加到 `tools/fonts/heading-chars.txt`，并提示重新生成字体。不重新生成也能用，只是这些字会用系统粗体显示。
- 旧样式的页面（`ai-guides/<编号>-<slug>.html`）和新样式的页面（`map/guides/`）放在不同位置，迁移期间可以并存。

### 8.2 迁移一篇教程

1. 在 `guides/<slug>.js` 里补一行分类：`category: 'account'`（也可以是 `'tools'`、`'coding'`，或者 `{ title: '…', href: '../#…' }`），面包屑会显示这个分类。不写也能用，面包屑就只显示教程名。
2. 运行 `python _src/build.py --g <slug>`，用 `python -m http.server` 在 `map/` 下预览。
3. 检查标题和按钮文字。旧数据里有些标题自带“第 1 步：”，新模板已经有“第 n 步”贴纸，可以去掉重复的。
4. 上线：上传 `map/guides/<编号>-<slug>.html`、`map/assets/g-guide.css`、`map/assets/g-engine.js`、两个字体，以及这篇用到的 `map/assets/guides/…` 配图。
5. 进度不会丢：新引擎和旧引擎读写同一个 `localStorage` 键（`aiGuideStateV1::<slug>`），数据结构也一样。

### 8.3 注意

- 已保留完整旧文件名：`18-more-ai` / `18-skill-basics`、`20-web-chat-comparison` / `20-gemini-student` 等前缀相同，完整文件名不同，各自可以访问，不重命名旧地址。
- Plus、Gemini 学生、Claude 迁移、Roogoo、Antigravity、Pixel、首个 AI 与 VPS 均已整理为正式 `guides/<slug>.js`。家宽页也通过 `ip-guide.js` 使用共享模板；原域名保持不变。富文本、下载、路由方法和所有步骤的检查门槛均被保留。
- Plus 使用原进度键 `aiGuideStateV2::plus`，其声明键不变。Gemini、首个 AI 和 IP 在新主键不存在时，从原键转换进度，保留旧键；Google 的旧下标映射继续生效。VPS 参数保持仅当次内存使用。
- Plus 页由构建器插入唯一 `<!-- ph-plus-price:start -->…<!-- ph-plus-price:end -->`。构建首页与 Plus 正文使用 `map/plus-price.json` 缓存；发布后运行价格程序 `--apply-cached`。价格更新器会识别页面标记内的原价格，因此发布包价格与服务器缓存不同时仍可重放。
- G 风格页面用自己的求助栏（Telegram + 二维码），不再插入旧版右下角悬浮的交流群按钮。

## 9. 首页上线前检查

- 价格任务：首页保留了 `<!-- ph-plus-price:start/end -->` 块，以及两处“约 102.55 元”，`update_price.py` 能直接改写，已自测通过。
- 需要一起上传：`index-g.html`（改名为 `index.html`）、`assets/pg-heading-900.woff2`、`assets/bricolage-800-sub.woff2`、`assets/shot-plus-pricing.webp`、`assets/shot-gemini-offer.webp`、`assets/shot-magpie-picker.webp`。
- 保留的功能：搜索高亮、筛选篇数、网址记住 `?q=` 和 `#tools`、`/` 快捷键、吸顶搜索栏、看过标记和上次看到、空结果提示、6 个常见问题、教程建议表单（`/api/suggestions` 接口和校验不变）、交流群面板、备用 QQ。
- 上线流程照旧：先备份线上文件，上传后核对 SHA-256，必要时清 Cloudflare 缓存，再记一笔到 `map/README.md`。

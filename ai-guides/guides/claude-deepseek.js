window.AI_GUIDE = {
  index: '09',
  slug: 'claude-deepseek',
  title: 'Claude Desktop 接入 DeepSeek API',
  subtitle: '不用服务器也能接',
  phases: [
    { title: '准备 Key', copy: '实名、充值、建 Key' },
    { title: '装 cc-switch', copy: '下载安装' },
    { title: '配置供应商', copy: '填 Key、开路由' },
    { title: '验证', copy: '重登 Claude 测试' }
  ],
  inputs: [
    { key: 'deepseekKey', label: 'DeepSeek API Key', short: 'DeepSeek Key', placeholder: 'sk-开头的密钥', hint: '在 DeepSeek 开放平台的密钥管理里创建，一般只显示一次，记得马上存好。', example: 'sk-1a2b3c4d5e' }
  ],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '这篇在做什么',
      title: '这篇教程，是用 cc-switch 把 DeepSeek 接到桌面端',
      intro: '上一篇需要你有一台中转站；这一篇不需要。装一个叫 cc-switch 的小工具，把 DeepSeek 的 API 填进去，开一下路由，Claude 桌面端就能用上 DeepSeek。',
      facts: [
        ['要准备', '一台 Windows 或 macOS 电脑'],
        ['要准备', 'DeepSeek 官网账号：完成实名认证，充一点余额'],
        ['要准备', '一个 DeepSeek 的 API Key'],
        ['要装', 'cc-switch（开源工具，GitHub 上有）'],
        ['大概要多久', '25 分钟左右，主要在等实名认证']
      ],
      bullets: [
        '和上一篇的区别：不用自建中转站，直接用官方 API，花多少充多少。',
        'cc-switch 的作用是帮你管理供应商配置，并在本机开一个转发入口，让 Claude 桌面端指向本地。',
        '充值建议先少量：够测试和日常用就行，用完了再充。'
      ],
      note: 'DeepSeek 的 API 是官方对外开放的付费接口，按用量计费；价格与规则以官方页面为准。',
      coach: '整体三步：准备 Key → 装工具 → 填进去开路由。',
      button: '看明白了，开始'
    },
    {
      phase: 0,
      kind: 'inputs',
      short: '填我的 Key',
      title: '第 1 步：把 DeepSeek 的 Key 先填进来',
      intro: '还没创建也没关系：先看下一步怎么创建，拿到 Key 之后回来填。',
      coach: 'Key 只填在你自己电脑上，不要发给任何人。',
      button: '保存，继续'
    },
    {
      phase: 0,
      kind: 'task',
      short: '安装 Claude 客户端',
      title: '第 2 步：安装并登录 Claude 桌面端',
      intro: '和上一篇一样：官网下载桌面端，正常安装、正常登录。',
      links: [{ label: '打开 Claude 官网下载页', url: 'https://claude.ai/download' }],
      bullets: [
        '按系统下载对应版本安装。',
        '打开软件，用你的账号登录，确认能正常打开对话界面。',
        '已经装过的可以跳过这一步。'
      ],
      coach: '这步没有特殊配置，装好登录就行。',
      button: '客户端装好了'
    },
    {
      phase: 0,
      kind: 'task',
      short: '准备 DeepSeek Key',
      title: '第 3 步：注册实名、充点钱、创建 API Key',
      intro: '到 DeepSeek 开放平台，把 API Key 拿到手。没有余额的话调用会直接失败。',
      links: [{ label: '打开 DeepSeek 开放平台', url: 'https://platform.deepseek.com/' }],
      bullets: [
        '注册账号，按提示完成实名认证。',
        '充值：按自己的用量来，先充少量即可。',
        '进入密钥管理，创建一个 API Key，复制下来（一般只显示一次，马上存好）。',
        '回到这一步，把 Key 填进上面「填写参数」那里，后面的配置会自动替换。'
      ],
      warn: 'Key 等于你的预付款余额：不要贴在群里、不要提交到 GitHub；发现泄漏立刻去平台删掉重发。',
      coach: '实名 + 充值 + 建 Key，三件事在同一平台上完成。',
      button: 'Key 拿到并填好了'
    },
    {
      phase: 1,
      kind: 'task',
      short: '安装 cc-switch',
      title: '第 4 步：下载安装 cc-switch',
      intro: 'cc-switch 是一个跨平台的桌面工具，用来管理多个 AI 编程工具的供应商配置。',
      links: [
        { label: '打开 cc-switch 项目页（GitHub）', url: 'https://github.com/farion1231/cc-switch' },
        { label: 'cc-switch 官方站点', url: 'https://ccswitch.io/' }
      ],
      bullets: [
        '打开项目页，进 Releases 页面，下载对应你系统的安装包（Windows / macOS）。',
        '安装并打开软件；第一次打开它会提示导入已有的配置，按提示处理即可。',
        '如果下载慢，可以换一个网络环境再试。'
      ],
      coach: '这是一个开源小工具，下载安装和普通软件一样。',
      button: 'cc-switch 装好了'
    },
    {
      phase: 2,
      kind: 'task',
      short: '添加供应商',
      title: '第 5 步：在 cc-switch 里添加 DeepSeek 供应商',
      intro: '把上一步拿到的 Key 填进 cc-switch，它会负责把配置写到正确的位置。',
      bullets: [
        '打开 cc-switch，右上角点「+」添加供应商。',
        '供应商类型选 DeepSeek（预设里就有，不用手写地址）。',
        '把第 3 步拿到的 API Key 填进去并保存。',
        '保存后先别急着切，下一步还要开路由。'
      ],
      note: '确认你填的是 API Key，不是账号密码——两者完全不同，账号密码填进去不会工作。',
      coach: '有预设就选预设：地址和格式工具都帮你填好了，你只需要贴 Key。',
      button: '供应商已添加'
    },
    {
      phase: 2,
      kind: 'task',
      short: '开启路由',
      title: '第 6 步：开启路由，然后退出重登 Claude',
      intro: '路由是 cc-switch 在本机开的一个转发入口：Claude 桌面端的请求先到它，再由它带着你的 Key 转发给 DeepSeek。',
      bullets: [
        '进 cc-switch 的设置 → 路由（Proxy / Routing）。',
        '打开两个路由开关（启动本地路由服务，并让 Claude 走这条路由）。',
        '然后退出 Claude 桌面端并重新登录——这一步会让 Claude 的地址和密钥自动指向本机回程（127.0.0.1）。',
        '重登后发一句话测试，能正常回复就成功了。'
      ],
      warn: '顺序很重要：先在 cc-switch 里开好路由，再退出重登 Claude。反过来做，Claude 会拿着旧配置去连，表现为报错或没反应。',
      coach: '理解一句话就行：cc-switch 在你电脑上开了个「中转窗口」，Claude 连它、它连 DeepSeek。',
      seeAlso: [
        { title: '08 Claude Desktop 接入 CPA 三方 API', url: './08-claude-cpa.html', why: '想用一个地址调 Claude、GPT、DeepSeek 多个模型，走 CPA 方案', icon: 'chip' }
      ],
      button: '路由已开，测试通过'
    },
    {
      phase: 3,
      kind: 'task',
      short: '排错',
      title: '第 7 步：常见问题处理',
      intro: '和上一篇一样的两个坑，外加一个用量相关的提醒。',
      bullets: [
        '配完仍然连不上、报错：先确认 cc-switch 的路由服务在运行，再退出重登 Claude 一次。',
        '断连、而你在国外：打开代理的 TUN 模式再试，保证本地路由和上游的连接都稳定。',
        '想确认在花谁的钱：在 DeepSeek 平台的用量页面看调用记录——有记录就说明走的是你的 Key。',
        '突然报余额不足：去 DeepSeek 平台充值；本地配置不用改。'
      ],
      note: '任何一步改完都要让 Claude 重新加载配置：彻底退出再打开比重启电脑快得多。',
      coach: '记住排查顺序：路由服务在不在跑 → Claude 有没有重登 → 余额够不够。',
      button: '处理完了，完成'
    },
    {
      phase: 3,
      kind: 'done',
      short: '完成与问答',
      title: '搞定，Claude 桌面端已经用上了 DeepSeek',
      intro: 'Key 准备好了、cc-switch 配好了、路由开着，桌面端可以直接对话。以后想切回官方，用 cc-switch 切一下供应商、再重登一次即可。',
      seeAlso: [
        { title: '01 搭建个人 AI 中转网关（CLIProxyAPI）', url: './01-cli-proxy-api.html', why: '想让 Codex、Claude Code 也用上同一批额度', icon: 'key' }
      ],
      doneGroups: [
        {
          title: '收尾：这几件事只有你能做',
          items: [
            '把 DeepSeek API Key 存进密码管理器（平台一般只显示一次）',
            '确认 cc-switch 的路由服务设置为随系统启动，重启电脑后不用手动开',
            '在 DeepSeek 平台设一个余额提醒，避免断了才发现'
          ]
        }
      ],
      faqGroups: [
        {
          label: '配置',
          items: [
            { q: 'cc-switch 和上一篇的 CPA 方案怎么选？', a: '有自建中转站、或者想用一个地址接很多模型，用 CPA 方案；只想花少量钱用上 DeepSeek，用 cc-switch 方案，不用管服务器。' },
            { q: '为什么一定要重登 Claude？', a: 'cc-switch 是通过改写 Claude 的配置文件来生效的，Claude 只在启动时读配置。退出重登就是让它读一遍新配置。' },
            { q: '路由开关是什么意思？', a: '打开后 cc-switch 在本机开一个转发入口，Claude 的请求先到它、再转发给上游。好处是切换供应商不用改客户端，也不用重启工具。' }
          ]
        },
        {
          label: '费用与排错',
          items: [
            { q: '费用怎么算？', a: '按 DeepSeek 平台的接口价格、按实际用量计费，钱从你充值的余额里扣。具体单价以官方页面为准，自己平台里能看到每次调用记录。' },
            { q: '报「余额不足 / 欠费」？', a: '去 DeepSeek 平台充值即可，本地配置不用动。也可以顺便设一个低余额提醒。' },
            { q: '开启路由后原来的官方登录还能用吗？', a: '可以在 cc-switch 里切回官方供应商，然后重登一次；想两边都能用，就把两种供应商都留在列表里，需要时切换。' },
            { q: 'Key 填错了怎么改？', a: '在 cc-switch 里编辑那个供应商，把 Key 换成正确的并保存，然后重登 Claude。旧 Key 建议在平台上删掉。' }
          ]
        }
      ]
    }
  ]
};

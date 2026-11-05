window.AI_GUIDE = {
  index: '26',
  slug: 'chatgpt-account-switch',
  title: 'ChatGPT / Codex 账号切换',
  subtitle: '用 CockpitTools 切换 Codex 登录',
  phases: [
    { title: '下载安装', copy: '准备 CockpitTools' },
    { title: '添加账号', copy: '分别完成 OpenAI 授权' },
    { title: '切换使用', copy: '核对账号与额度' }
  ],
  inputs: [],
  steps: [
    {
      phase: 0,
      kind: 'task',
      short: '下载安装',
      title: 'CockpitTools · 下载安装',
      intro: '用 Codex 时需要从一个 ChatGPT 账号切到另一个，可以用 CockpitTools 管理登录。这篇讲的是 Codex 客户端使用的 OpenAI 账号；ChatGPT 网页的登录状态仍由浏览器管理。',
      links: [{ label: '打开 CockpitTools 项目页（GitHub）', url: 'https://github.com/jlcodes99/cockpit-tools' }],
      bullets: [
        '打开上面的 GitHub 项目页，进入 Releases，下载适合自己系统的安装包。',
        '安装并启动 CockpitTools；也可以把项目链接发给自己的编码助手，让它协助安装到指定文件夹。'
      ],
      coach: '先装好工具，下一步再添加需要切换的账号。',
      button: '安装完成'
    },
    {
      phase: 1,
      kind: 'task',
      short: '添加账号',
      title: 'CockpitTools · 添加并授权账号',
      intro: '把自己需要使用的 ChatGPT / OpenAI 账号分别加入账号池，每个账号完成一次 OAuth 授权。',
      bullets: [
        '打开软件，左侧栏点「Codex」，点右上角「+」添加账号。',
        '在弹窗中点「在浏览器中打开」，核对浏览器当前账号，再完成 OpenAI OAuth 授权。',
        '回到工具中确认新增账号的邮箱和状态。',
        '重复上述步骤，把其他需要切换的本人账号加进账号池。'
      ],
      note: '如果授权页打不开或登录超时，先检查网络连通性；账号显示错误时，先退出浏览器里的错误账号，再重新授权。',
      coach: '每次授权都核对邮箱，避免把同一个账号重复添加。',
      button: '账号都加好了'
    },
    {
      phase: 2,
      kind: 'task',
      short: '一键切换',
      title: 'CockpitTools · 一键切换账号',
      intro: '切换前保存 Codex 里正在做的工作，再选择目标账号。工具会更新登录配置并重启 Codex。',
      bullets: [
        '在账号池核对目标账号的邮箱、订阅状态和可用额度。',
        '点目标账号卡片下的「切换」。',
        '在启动预览里点「切换并启动」，等待 Codex 重新打开。',
        '在 Codex 中确认当前账号，再开一个新会话发送简单请求，检查是否能正常使用。'
      ],
      note: '切换账号不会把一个账号的订阅或额度转给另一个账号；可用模型与额度以当前登录账号为准。',
      coach: '先保存工作，再切换；最后在 Codex 里核对实际登录的账号。',
      button: '切换已验证'
    },
    {
      phase: 2,
      kind: 'done',
      short: '完成',
      title: 'ChatGPT / Codex 账号切换完成',
      intro: '以后需要换号时，打开 CockpitTools，核对目标账号，再切换并启动 Codex。',
      seeAlso: [
        { title: 'Gemini 账号管理与反代', url: './27-gemini-proxy.html', why: '独立学习谷歌账号授权与 Antigravity Manager 反代配置。', icon: 'server' },
        { title: 'Plus Guide 全部教程', url: '../', why: '回到导航，挑下一篇。', icon: 'grid' }
      ],
      faqGroups: [
        { title: '账号与登录', items: [
          { q: '这会切换 ChatGPT 网页的账号吗？', a: '这篇操作切换的是 Codex 使用的 OpenAI 登录。ChatGPT 网页仍使用浏览器当前的登录状态，需要在网页中自行切换。' },
          { q: '切换后为什么还是原来的账号？', a: '先确认目标账号已授权成功，再检查 Codex 是否已重启。在 Codex 中核对邮箱；仍不一致时，回到工具重新授权目标账号后再试。' },
          { q: '另一个账号能用原账号的订阅吗？', a: '不能。每个账号的订阅、权限与用量分别计算，以当前账号显示的状态为准。' }
        ] }
      ]
    }
  ]
};

window.AI_GUIDE = {
  index: '27',
  slug: 'gemini-proxy',
  title: 'Gemini 账号管理与反代',
  subtitle: '用 Antigravity Manager 接入客户端',
  phases: [
    { title: '添加账号', copy: '安装与谷歌授权' },
    { title: '开启反代', copy: '启用账号并接入客户端' },
    { title: '检查结果', copy: '测试与常见问题' }
  ],
  inputs: [],
  steps: [
    {
      phase: 0,
      kind: 'task',
      short: '下载安装',
      title: '下载安装 Antigravity Manager',
      intro: '用 Antigravity Manager 管理自己的谷歌反重力（Antigravity）账号，再通过本地反代把可用模型接到客户端。这篇从安装开始，独立完成整个流程。',
      links: [{ label: '打开 AntigravityManager 项目页（GitHub）', url: 'https://github.com/Draculabo/AntigravityManager' }],
      bullets: [
        '打开项目页，进入 Releases，选择适合自己系统的最新安装包。',
        'Windows 下载页面提供的安装程序，完成安装后启动软件。'
      ],
      coach: '安装路径尽量使用英文，可以装在非 C 盘。',
      button: '安装完成'
    },
    {
      phase: 0,
      kind: 'task',
      short: '添加谷歌账号',
      title: '添加谷歌账号并完成授权',
      intro: '把需要使用的本人谷歌账号加入管理器，授权前确认浏览器当前登录的是目标账号。',
      bullets: [
        '打开软件，在仪表盘点「添加账号」。',
        '选择「开始 OAuth 授权」，在浏览器中登录目标谷歌账号并完成授权。',
        '看到 Authorization Successful 或软件提示授权完成后，回到管理器。',
        '核对账号邮箱和模型额度；需要管理其他账号时，再分别完成一次授权。'
      ],
      note: '授权超时或 fetch failed 时，先检查网络连通性和代理设置。出现账号验证要求时，按 Google 的官方提示完成验证，再重试授权。',
      coach: '先确认账号能正常登录，再检查授权是否成功。',
      button: '账号已添加'
    },
    {
      phase: 1,
      kind: 'task',
      short: '启用反代',
      title: '启用账号与反代服务',
      intro: '在账号池中启用需要参与反代的账号，然后开启本地 API 服务。客户端使用哪一个账号的额度，取决于管理器当前的账号和路由设置。',
      bullets: [
        '打开「账号管理」，确认账号状态和各模型额度正常。',
        '选中需要用于反代的账号，点「启用」；暂时不用的账号保持禁用。',
        '进入「API 反代」，点「启用服务」。',
        '看到「服务运行中」后，记录页面显示的 API 地址、密钥和可用模型 ID。'
      ],
      warn: 'API 密钥等同这项服务的使用权限，妥善保管。本教程按本机访问配置。',
      coach: '有 403 等账号错误时，先处理账号状态，再开启服务。',
      button: '服务已开启'
    },
    {
      phase: 1,
      kind: 'task',
      short: '接入客户端',
      title: '把 Gemini 接入客户端',
      intro: '以 Cherry Studio 为例，需要填写 API 地址、API Key 和模型 ID，使用管理器页面实际显示的值。',
      facts: [
        ['供应商类型', 'OpenAI（兼容）'],
        ['API 地址示例', 'http://127.0.0.1:8045/v1，端口以管理器页面为准'],
        ['API Key', '管理器「API 反代」页面生成的密钥'],
        ['模型 ID', '管理器当前显示的可用 Gemini 模型 ID']
      ],
      bullets: [
        '在 Cherry Studio 中依次点「设置」—「模型服务」—「添加」，选择 OpenAI 兼容供应商。',
        '填写管理器显示的 API 密钥和地址，并添加可用模型。',
        '点「检测」检查连通性。',
        '开一个新对话，选择配置好的 Gemini 模型，发送简单问题并确认能收到回复。'
      ],
      note: '127.0.0.1 指运行管理器的这台电脑；另一台设备不能直接使用这个本机地址。',
      coach: '先保证本地反代在运行，再检查客户端参数。',
      button: '测试通过'
    },
    {
      phase: 2,
      kind: 'task',
      short: '常见报错',
      title: '按报错检查网络、账号和参数',
      intro: '授权、账号和客户端连接分别检查，避免一遇到报错就反复重装。',
      facts: [
        ['授权超时或 fetch failed', '检查网络和代理设置，确认浏览器能够正常打开 Google 授权页。'],
        ['403 或要求验证', '在 Google 官方页面登录对应账号，完成提示的验证，并确认该账号可以使用目标服务。'],
        ['账号被停用或没有额度', '查看账号状态和平台通知；账号恢复可用后再重新授权，不要把更换出口当作恢复保证。'],
        ['客户端连接失败', '检查本地服务是否运行，以及 API 地址、端口、密钥和模型 ID 是否与管理器一致。']
      ],
      coach: '保留完整报错信息，先确定问题发生在授权、账号还是客户端连接。',
      button: '完成检查'
    },
    {
      phase: 2,
      kind: 'done',
      short: '完成',
      title: 'Gemini 账号管理与反代配置完成',
      intro: '日常使用时保持管理器和反代服务运行，在客户端选择已经验证过的模型。需要调整参与反代的账号时，回到账号管理页核对启用状态。',
      seeAlso: [
        { title: 'ChatGPT / Codex 账号切换', url: './26-chatgpt-account-switch.html', why: '独立学习 CockpitTools 添加账号与切换 Codex 登录。', icon: 'terminal' },
        { title: 'Antigravity 本地 API', url: './16-antigravity.html', why: '了解另一款工具 Antigravity Tools 的本地接口配置。', icon: 'server' },
        { title: 'Plus Guide 全部教程', url: '../', why: '回到导航，挑下一篇。', icon: 'grid' }
      ],
      faqGroups: [
        { title: '账号与客户端', items: [
          { q: '这会切换 Gemini 网页的登录吗？', a: '管理器里的账号池用于它管理的客户端或本地服务。Gemini 网页仍由浏览器管理登录，需要在网页中核对和切换账号。' },
          { q: '关闭管理器后，客户端为什么不能用了？', a: '本教程连接的是管理器提供的本地服务，服务停止后客户端就无法访问。重新打开管理器并启用反代，再检测连接。' },
          { q: '添加账号就一定有某个模型的额度吗？', a: '不能保证。可用模型、资格和额度由平台及对应账号决定，以管理器和官方页面实际显示的状态为准。' }
        ] }
      ]
    }
  ]
};

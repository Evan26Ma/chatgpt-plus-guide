window.AI_GUIDE = {
  slug: 'antigravity',
  category: 'tools',
  index: '16',
  title: 'Antigravity 本地 API',
  subtitle: '把 Antigravity Tools 接成本地 OpenAI 兼容接口',
  phases: [
    { title: '准备', copy: '弄清关系、装好软件' },
    { title: '账号与网络', copy: '原生登录、固定线路' },
    { title: '开反代', copy: 'OAuth 与 API 服务' },
    { title: '验证', copy: '三个参数与真实请求' }
  ],
  steps: [
    {
      phase: 0,
      short: '先弄清关系',
      title: 'Antigravity、Tools 和「反代」分别是什么',
      intro: '把三层关系分清，后面的端口、账号和报错就不容易混在一起。',
      facts: [
        ['Antigravity（反重力）', 'Google 面向开发者的 AI 编程工作台。账号登录、会员状态、模型额度和地区访问，首先由官方客户端决定。'],
        ['Antigravity Tools', '本地桌面管理与协议代理工具：负责账号管理、模型路由，在电脑上启动一个可供其他客户端使用的 API 入口。'],
        ['API 反代', '把客户端发来的标准 API 请求转给上游服务，再把回复转换回客户端能读的格式。它不是新的模型额度，也不会绕过账号规则。'],
        ['请求怎么走', 'API 客户端 → 127.0.0.1:8045 → Antigravity Tools → Google / Antigravity']
      ],
      note: '网页只提供操作说明，不会请求你的本机接口，也不会保存 API Key。',
      coach: '记住一句话：Tools 只是把请求转一手，账号能不能用由官方客户端说了算。',
      button: '明白了，开始安装'
    },
    {
      phase: 0,
      short: '下载安装',
      title: '下载最新版并打开软件',
      intro: '从官方发布页下载最新安装包，安装完成后打开 Antigravity Tools。',
      links: [{ label: '下载官方最新版（GitHub Releases）', url: 'https://github.com/lbjlaq/Antigravity-Manager/releases/latest' }],
      bullets: [
        '下载适合自己电脑的安装包并完成安装，然后打开 Antigravity Tools。',
        '看到仪表盘页面，就可以继续下一步。'
      ],
      images: [{ src: '@embed-image:assets/antigravity/dashboard-light.webp', alt: 'Antigravity Tools 仪表盘界面', caption: '打开软件后会进入仪表盘。界面参考，以当前最新版实际显示为准。' }],
      note: '资料综合 Antigravity-Manager 官方项目、官方 Issues 与社区使用经验。项目及所引用界面素材采用 CC BY-NC-SA 4.0，仅供个人学习研究使用；截图只作位置参考。',
      coach: '只从官方 Releases 下载，别用来路不明的打包版。',
      button: '软件已打开，显示仪表盘'
    },
    {
      phase: 1,
      short: '登录反重力',
      title: '先在 Antigravity 客户端登录',
      intro: '先确认 Google 账号能在官方 Antigravity 客户端正常登录和使用，再交给 Tools 做反代。',
      bullets: [
        '打开 Antigravity（反重力）客户端，用准备接入的 Google 账号完成登录。',
        '至少进入主界面并发送一次简单请求，确认账号、会员状态和网络都正常。',
        '官方客户端还登录不了或要求验证时，先解决这个问题，不要直接从反代接口开始排查。'
      ],
      warn: '先验证原生客户端：社区反馈普遍建议先在 Antigravity 里正常用一次；反代只会放大原有的登录、地区和额度问题。',
      tip: '首次登录后按 Google 页面开启二步验证、退出陌生设备；前 48–72 小时尽量固定设备和线路，避免频繁切换账号或大改安全信息。',
      coach: '原生客户端能用，后面九成的问题就不会出现。',
      button: '客户端已登录，能正常用'
    },
    {
      phase: 1,
      short: '固定线路',
      title: '固定网络路径：TUN 或进程规则',
      intro: '从登录到反代测试，始终用同一条稳定线路；优先开启 TUN，节点选稳定的美国线路。',
      links: [
        { label: 'Niva · 稳定、快（需要 Gmail 注册，先开梯子访问）', url: 'https://niva.page/register?invite_code=qxYarFgs' },
        { label: '低门槛机场 · 还没有梯子或 Gmail 可以先看', url: 'https://go.btcr.cc/i/roxy123' }
      ],
      bullets: [
        '推荐开启代理软件的 TUN 模式，让 Antigravity 和 Antigravity Tools 的流量都走同一条代理。',
        '不用 TUN 时，在代理软件里给 Antigravity 和 Antigravity Tools 添加进程规则，确保它们都通过代理转发；进程名和端口以本机查询结果为准。',
        '登录、OAuth 回调和第一次 API 测试之间，不要频繁切换国家或节点。'
      ],
      agentPrompt: {
        title: '让 Codex / Claude Code 帮你查端口、加规则',
        intro: '不确定进程名和端口时，把下面这段交给本地的 AI 助手。它会先只读汇报，再征求你同意。',
        text: '帮我查询本地 Antigravity 和 Antigravity Tools 的监听端口与进程路径，并在本地代理软件中增加规则，使这两个程序的全部流量都通过代理软件转发。先只读取并汇报结果，修改规则前告诉我将要改动的程序、端口和规则内容。'
      },
      warn: '网络稳定比反复重试重要：国内出口、共享节点、频繁切换线路都可能触发地区限制或账号风控。TUN / 进程规则是网络建议，不是官方保证。',
      coach: '一条线路从头用到尾，中途别换。',
      button: '代理路径已固定'
    },
    {
      phase: 2,
      short: '添加账号',
      title: '添加账号并完成 OAuth',
      intro: '在账号管理页添加 Google 账号，浏览器授权成功后回到软件。',
      bullets: [
        '打开「账号管理」，点击右上角「添加账号」。',
        '选择 OAuth，打开软件生成的授权链接并登录 Google 账号。',
        '浏览器显示授权成功后返回软件，确认账号出现在列表里。'
      ],
      images: [{ src: '@embed-image:assets/antigravity/accounts-light.webp', alt: 'Antigravity Tools 账号管理界面', caption: '从账号管理页右上角添加账号。界面参考，以当前最新版实际显示为准。' }],
      note: '授权页面打不开？保持软件和授权弹窗打开，重新生成一次 OAuth 链接，不要继续用旧链接。',
      coach: '授权全程别关软件，回调要靠它接住。',
      button: '账号已出现在列表里'
    },
    {
      phase: 2,
      short: '开启反代',
      title: '开启 API 反代服务',
      intro: '进入 API 反代页面启动服务，记住页面显示的端口。',
      bullets: [
        '打开顶部或侧边栏里的「API 反代」。',
        '点击启动服务，等页面显示「服务运行中」。',
        '记下监听端口。默认通常是 8045，以你的页面为准。'
      ],
      images: [{ src: '@embed-image:assets/antigravity/proxy-settings.webp', alt: 'Antigravity Tools API 反代服务界面', caption: '确认服务状态、监听端口和 API 密钥的位置。界面参考，以当前最新版实际显示为准。' }],
      warn: '不要公开 API 密钥：它等同于本地接口的访问权限，不要发到群聊、截图或公开仓库。',
      coach: '端口记下来，下一步要用。',
      button: '显示「服务运行中」了'
    },
    {
      phase: 3,
      short: '三个参数',
      title: '找到三个接入参数',
      intro: '接入任何兼容 OpenAI 的客户端，都只要这三样：Base URL、API Key 和模型 ID。',
      facts: [
        ['BASE URL', 'http://127.0.0.1:8045/v1（端口以你的页面为准）'],
        ['API KEY', 'API 反代页面里的密钥，自己妥善保存，不要粘贴到本网页'],
        ['MODEL ID', '下一步从 /v1/models 读取当前真实列表，不要照截图猜名称']
      ],
      images: [{ src: '@embed-image:assets/antigravity/proxy-settings.webp', alt: 'Antigravity Tools API 配置位置', caption: '端口和 API Key 都在 API 反代页面。' }],
      coach: '模型 ID 不用手抄，下一步的脚本会帮你列出来。',
      button: '找到 Base URL 和 API Key 了'
    },
    {
      phase: 3,
      short: '验证请求',
      title: '用 PowerShell 验证连接',
      intro: '复制下面的脚本，选一个有额度的模型。返回正常回复，就说明本地 API 已经可用。',
      bullets: [
        '保持 Antigravity Tools 和 API 反代服务运行。',
        '把整段脚本粘进 PowerShell，按提示输入 API Key（只保存在当前 PowerShell 会话里）。',
        '从输出的列表里选一个当前有额度的文本模型。',
        '看到模型 ID 和正常回复，就完成了全部配置。'
      ],
      code: [{
        lang: 'powershell',
        caption: '获取模型列表并测试一次聊天',
        text: [
          "$agBaseUrl = 'http://127.0.0.1:8045/v1'",
          "$agKey = Read-Host '粘贴 API Key（仅保存在当前 PowerShell 会话）'",
          '$agHeaders = @{ Authorization = "Bearer $agKey" }',
          '',
          '# 获取当前真实模型列表',
          '$agModels = Invoke-RestMethod -Method Get -Uri "$agBaseUrl/models" -Headers $agHeaders -TimeoutSec 30',
          '$agModels.data.id | Sort-Object',
          "$agModelId = Read-Host '粘贴上方一个当前有额度的模型 ID'",
          "if ($agModels.data.id -notcontains $agModelId) { throw '输入的模型 ID 不在当前列表中' }",
          '',
          '# 发起一次非流式聊天请求',
          '$agBody = @{',
          '  model = $agModelId',
          '  messages = @(',
          "    @{ role = 'user'; content = '只回复：连接成功' }",
          '  )',
          '  stream = $false',
          '} | ConvertTo-Json -Depth 5',
          '',
          "$agReply = Invoke-RestMethod -Method Post -Uri \"$agBaseUrl/chat/completions\" -Headers $agHeaders -ContentType 'application/json; charset=utf-8' -Body $agBody -TimeoutSec 120",
          '',
          '"模型：$agModelId"',
          '"回复：$($agReply.choices[0].message.content)"'
        ]
      }],
      tip: '本机实测的成功输出长这样 —— 模型：claude-sonnet-4-6　回复：连接成功',
      note: '不要默认选第一项：模型列表第一项可能已经没有额度，请选账号页显示有余额的文本模型。',
      coach: '有回复就成功了。客户端里填同样的三个参数即可。',
      button: 'PowerShell 返回了真实回复'
    },
    {
      kind: 'done',
      short: '完成',
      title: '本地 API 跑通了',
      intro: '现在任何兼容 OpenAI 的客户端、编辑器，都能用 Base URL + API Key + 模型 ID 接上这个本地接口。',
      doneGroups: [
        { title: '你已经完成', items: ['装好 Antigravity Tools 并在官方客户端登录', '固定代理路径，添加账号完成 OAuth', '启动反代，用 PowerShell 拿到真实回复'] },
        { title: '以后记得', items: ['密钥不外传、不截图', '报错先回官方客户端确认账号状态', '模型名每次以 /v1/models 返回为准'] }
      ],
      seeAlso: [
        { title: 'Magpie 安装与模型切换', url: './12-magpie.html', why: '把这个本地接口当成一个模型来源，接给 Claude Code、Codex 等工具。', icon: 'chip' },
        { title: '官方 Issues 列表', url: 'https://github.com/lbjlaq/Antigravity-Manager/issues', why: '问题持续出现时，带日志去搜最新讨论。', icon: 'book' }
      ],
      faqGroups: [
        {
          label: '登录与账号',
          items: [
            { q: '登录不上 / 无法验证此设备', a: '先在官方 Antigravity 客户端完成一次登录或简单请求；保持同一条稳定线路，检查 Google 安全中心的设备与二步验证。不要在多个账号之间快速切换，必要时暂停一段时间再重新 OAuth。' },
            { q: '提示手机号验证 / 年龄验证', a: '这是 Google 账号侧的验证，不是反代端口故障。回到官方 Antigravity 客户端按页面完成验证；完成前不要反复从 Tools 发起 OAuth。' },
            { q: 'OAuth 回调失败', a: '保持 Tools 和授权弹窗打开，取消旧流程后重新生成 OAuth 链接，始终用弹窗里生成的最新链接。软件已退出或弹窗关闭时，localhost 回调可能无法完成。（官方 README：OAuth 流程）' },
            { q: '账号出现 401 / 403', a: '回到官方客户端确认账号仍可用，再在 Tools 刷新或重新授权；检查代理出口、账号地区和 Google 安全状态。持续失败时停止高频重试，带日志搜索最新讨论（Issue #3425）。' },
            { q: '登录成功但没有 Pro / 额度显示异常', a: '先在 Antigravity 客户端验证账号，再回 Tools 刷新账号列表；工具显示有额度不代表每个模型都可用。切换账号后仍显示限额，就等上游恢复并查看相关 Issue（#3436、#3447）。' }
          ]
        },
        {
          label: '请求报错',
          items: [
            { q: '400：User location is not supported', a: '先确认代理出口地区被支持，并让 Antigravity 与 Tools 用同一条美国线路；优先开启 TUN，或改用进程规则后重新登录（Issue #3419）。' },
            { q: '429 / 503 / Claude 或 Gemini 反复失败', a: '先重新请求 /v1/models，选当前有额度的模型；429、503 可能来自上游限流、额度或单个模型故障，不要连续重试。旧 Codex 身份历史也可能触发 Gemini 429，可以新建会话、换模型、更新最新版后再试（Issue #3442）。' },
            { q: '其他模型 400 / 502，或没有流量日志', a: '先用 Gemini 或简单的 OpenAI chat 请求验证链路，再确认模型和协议是否匹配；刷新模型列表、更新最新版，按 Issue 的最新回复处理（Issue #3429）。' },
            { q: 'Function call 缺少 thought_signature', a: '通常是协议转换或模型兼容问题，不是密钥错误。先更新最新版、换用支持工具调用的模型，或改走模型原生协议（Issue #3243）。' },
            { q: '请求超时 / agent terminated', a: '先确认官方客户端、代理线路和模型都可用，再看 Tools 日志判断请求有没有到本地服务；只重试一次，随后换一个有额度的模型对比。' }
          ]
        },
        {
          label: '本地服务',
          items: [
            { q: '连接被拒绝', a: '确认反代服务仍在运行，Base URL 里的端口和页面一致；代理软件或安全软件拦截本机回环连接时，先暂时停用对应规则验证。' },
            { q: 'API Key 错误', a: '重新复制 API 反代页中的密钥，注意不要带前后空格；密钥只在 PowerShell 提示时输入，不要粘贴到本网页或截图。' },
            { q: '模型不存在', a: '重新运行 /v1/models 查询，不要沿用旧教程或截图里的模型名；不同账号、额度和版本返回的列表可能不同。' },
            { q: '端口被占用', a: '在反代设置里换一个未占用端口，重启服务，并同步修改 Base URL；不确定是谁占用时，用第 4 步的指令让本地助手先读取。' },
            { q: '黑屏 / 一键打开经典版异常', a: '有用户报告登录成功后打开经典版黑屏（Issue #3435）。先关闭已运行的客户端，直接打开 Antigravity 确认原生登录；不要把黑屏误判为 API Key 或端口问题。' }
          ]
        }
      ]
    }
  ]
};

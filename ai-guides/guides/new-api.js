window.AI_GUIDE = {
  index: '02',
  slug: 'new-api',
  title: '搭建商业化 AI 中转站（New-API）',
  subtitle: '一个地址带所有模型',
  phases: [
    { title: '选部署方案', copy: '简化版还是标准版' },
    { title: '部署服务', copy: '起容器、建管理员' },
    { title: '配置渠道令牌', copy: '接 Key、发令牌' },
    { title: '对外使用', copy: '验证链路与 HTTPS' }
  ],
  inputs: [
    { key: 'vpsIp', label: 'VPS 公网 IP', short: 'VPS IP', placeholder: '123.45.67.89', hint: '在 VPS 商家面板的实例详情里能看到。', example: '123.45.67.89' },
    { key: 'adminPassword', label: '管理员密码（自己设）', short: '管理员密码', placeholder: '自己设一个强密码', hint: '中转站的最高权限密码，第一次进面板时用。设长一点，别和别的网站重复。', example: 'NewApi-Admin-2026-k9' },
    { key: 'dbPassword', label: '数据库 / Redis 密码（标准版用）', short: '数据库密码', placeholder: '自己设一个强密码', optional: true, hint: '只有选「PG + Redis 标准版」才需要。数据库和 Redis 各有一处密码要填，两处必须一致。', example: 'Db-Pass-2026-7f2c' },
    { key: 'domain', label: '站点域名', short: '域名', optional: true, placeholder: 'ai.你的域名.com', hint: '准备做 HTTPS（进阶步骤）才需要，没有就留空。' }
  ],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '这篇在做什么',
      title: '这篇教程，是把多家 AI 的 Key 收进一个门',
      intro: 'New-API 是一个自建的 AI 网关：你把各家平台的 Key 填进去，它对外只暴露一个地址和一个令牌。你自己的客户端、别人的客户端都连这一个门，用量、额度和模型都能在面板里看清。',
      facts: [
        ['简化版要什么', 'VPS 1 核 1G 可以跑（SQLite 单文件数据库）'],
        ['标准版要什么', 'VPS 建议 2G 内存以上（PostgreSQL + Redis）'],
        ['都要什么', '服务器装好 Docker；你要接入的各家 API Key'],
        ['可选', '一个域名：做 HTTPS 用'],
        ['大概要多久', '简化版 20 分钟能跑通；标准版 40 分钟']
      ],
      bullets: [
        '整篇只要一台 VPS，加一个能敲命令的窗口（SSH）。',
        '第一次玩建议先走「简化版」，把链路跑通；以后要正经对外用，再换标准版。',
        '下面凡是让你填的（IP、密码、域名），填一次，后面的命令和地址会自动替换。'
      ],
      note: '中转站只服务你自己的 Key 和额度；如果对外提供接口，请自行确认符合上游服务商条款与当地法规。',
      coach: '先想清楚用途：自己用选简化版就够了，要多人用、要稳定再上标准版。',
      button: '看明白了，开始'
    },
    {
      phase: 0,
      kind: 'inputs',
      short: '填我的参数',
      title: '先把你自己要用的信息填进来',
      intro: '填一次就行，后面所有命令、地址、面板入口都会自动变成你填的内容。暂时用不到的项目留空也可以。',
      coach: '数据库密码只有标准版才用得上；不确定就留空，以后选了标准版再回来填。',
      button: '保存，继续'
    },
    {
      phase: 0,
      kind: 'choice',
      short: '选部署方案',
      title: '第 1 步：选部署方案',
      intro: '两种部署方式的功能一样，差别在数据库和内存占用。按你现在的用途选一个，以后随时可以迁。',
      coach: '第一次玩选简化版；已经有别人在用、或者你要对外发令牌，就选标准版。',
      choices: [
        { title: 'SQLite 简化版（新手推荐）', copy: '单文件数据库，开箱即用，1 核 1G 也能跑', value: 'sqlite', icon: 'server', next: 3 },
        { title: 'PG + Redis 标准版', copy: '性能更好，适合多人使用，建议 2G 内存以上', value: 'standard', icon: 'chip', next: 4 }
      ],
      hint: '选好会自动进对应的步骤'
    },
    {
      phase: 1,
      kind: 'task',
      short: '简化版启动',
      title: '简化版：一条命令把服务跑起来',
      intro: 'SQLite 版不需要外部数据库，一条 docker 命令就能起。数据都留在服务器的 data 目录里，换容器也不丢。',
      code: [
        {
          lang: 'bash',
          caption: '在服务器上执行（SQLite 版）',
          text: [
            'mkdir -p ~/new-api && cd ~/new-api',
            'docker run --name new-api -d --restart always \\',
            '  -p 3000:3000 \\',
            '  -e TZ=Asia/Shanghai \\',
            '  -v "$(pwd)/data:/data" \\',
            '  calciumion/new-api:latest',
            '',
            '# 看一眼有没有跑起来',
            'docker ps --filter name=new-api'
          ]
        }
      ],
      bullets: [
        '第一条命令建目录：所有数据都会留在 ~/new-api/data 里，以后备份直接打包这个目录。',
        '端口映射 3000，面板就是 http://你的IP:3000。',
        'docker ps 里能看到 new-api 且状态是 Up，就说明起来了。'
      ],
      tip: '第一次玩选简化版，跑起来再说；以后要升级，把 data 目录拷过去就行。',
      coach: '一条命令 + 一个数据目录，简化版就这两件事。',
      button: '简化版跑起来了'
    },
    {
      phase: 1,
      kind: 'task',
      short: '标准版启动',
      title: '标准版：用官方 compose 起 PG + Redis',
      intro: '标准版用官方仓库里的 docker-compose.yml，它默认就是把 New-API、PostgreSQL、Redis 一起起来。重点是进去改三处密码，再启动。',
      code: [
        {
          lang: 'bash',
          caption: '拉仓库、改密码、启动',
          text: [
            'git clone https://github.com/QuantumNous/new-api.git',
            'cd new-api',
            'nano docker-compose.yml   # 按下面的要点改，Ctrl+O 回车保存、Ctrl+X 退出',
            'docker compose up -d',
            'docker compose logs -f new-api   # 看到正常启动后按 Ctrl+C 退出'
          ]
        }
      ],
      bullets: [
        '改数据库密码：compose 里服务的密码和连接字符串里的密码两处必须一致，改漏一处就连不上数据库。',
        '改 Redis 密码：同样要两边一致。',
        '设置 SESSION_SECRET：登录态用的密钥，随便生成一串十六进制，例如 openssl rand -hex 32 的输出。',
        '数据库和 Redis 都建议只监听本机（compose 默认就是这样），不要把 5432 / 6379 端口暴露到公网。'
      ],
      note: '密码和密钥都填你自己的（数据库那两处填同一串），不要把示例值留在配置里。',
      coach: '标准版唯一的坑就是「两处密码不一致」，改完逐行对一遍再启动。',
      button: '标准版跑起来了'
    },
    {
      phase: 1,
      kind: 'task',
      short: '建管理员账号',
      title: '第 2 步：打开面板，建好管理员',
      intro: '服务起来之后，第一次打开面板会引导你创建管理员账号。这个账号是整个中转站的总开关。',
      links: [{ label: '打开中转站面板（你的 VPS）', url: 'http://{{ vpsIp }}:3000' }],
      bullets: [
        '打开上面的地址，按页面提示初始化管理员账号，密码用你刚才填的那个。',
        '如果页面给的是默认账号（形如 root / 123456），登录后第一件事就是改密码。',
        '打不开先检查 VPS 安全组/防火墙有没有放行 3000 端口。'
      ],
      warn: '默认密码等于把门开着：无论走哪种方式，确认你已经把管理员密码改成自己的。',
      coach: '管理员账号建好，后面的渠道和令牌都在这个面板里加。',
      button: '管理员建好了，继续'
    },
    {
      phase: 2,
      kind: 'task',
      short: '添加渠道',
      title: '第 3 步：把各家的 Key 加成「渠道」',
      intro: '在 New-API 里，一个上游平台的 Key 叫做一个「渠道」。先加一个能用的渠道，把链路跑通。',
      bullets: [
        '进入「渠道」→「添加渠道」。',
        '渠道类型选你要用的平台（例如 DeepSeek）。',
        '把那个平台的 API Key 填进去。',
        '勾选你要启用的模型——只勾你会用到的，列表干净好选。',
        '点「测试」，返回成功再保存；测试不过就别急着往下走。'
      ],
      links: [
        { label: 'DeepSeek 开放平台（注册、实名、创建 Key）', url: 'https://platform.deepseek.com/' },
        { label: 'New-API 官方文档', url: 'https://docs.newapi.ai/' }
      ],
      note: '一个渠道对应一个 Key；同一个平台有多个 Key，就多加几个渠道，面板里可以看每个渠道的用量。',
      coach: '渠道加完先点「测试」：这一步过了，说明上游 Key 没问题。',
      seeAlso: [
        { title: '01 搭建个人 AI 中转网关（CLIProxyAPI）', url: './01-cli-proxy-api.html', why: '如果上游是「自己的订阅额度」，先把额度变成 Key，再当渠道接进来', icon: 'key' }
      ],
      button: '渠道测试通过'
    },
    {
      phase: 2,
      kind: 'task',
      short: '创建令牌',
      title: '第 4 步：给自己发一个令牌',
      intro: '令牌（sk-xxx 开头）就是客户端连你中转站要带的钥匙。它决定谁能用、用多少。',
      bullets: [
        '进入「令牌」→「添加令牌」。',
        '自己用的话，可以设成无限额度、永不过期，省得隔一段时间换一次。',
        '给别人的令牌建议设额度上限和过期时间。',
        '生成后复制那串 sk-xxx，客户端里要填。'
      ],
      warn: '令牌等于你钱包的钥匙，尤其是无限额度的：别贴在群里、别提交到 GitHub。泄漏了就回来把它删掉，重新发一个。',
      coach: '一个令牌可以给一台设备用；分开发放，出问题的时候好定位、好撤销。',
      button: '令牌已创建并保存'
    },
    {
      phase: 2,
      kind: 'task',
      short: '验证链路',
      title: '第 5 步：用一条命令验证整个链路',
      intro: '把地址和令牌拼起来调用一次，能返回内容就说明「客户端 → 你的中转站 → 上游 Key」整条路通了。',
      code: [
        {
          lang: 'bash',
          caption: '在服务器或你自己的电脑上执行',
          text: [
            'curl http://{{ vpsIp }}:3000/v1/chat/completions \\',
            '  -H "Authorization: Bearer <你的令牌>" \\',
            '  -H "Content-Type: application/json" \\',
            '  -d \'{"model":"deepseek-chat","messages":[{"role":"user","content":"你好"}]}\''
          ]
        }
      ],
      bullets: [
        '把 <你的令牌> 换成你刚复制的 sk-xxx，注意别丢掉 Bearer 后面那个空格。',
        '返回一段 JSON（里面有 content 字段）就是通了；报 401 说明令牌不对，报 404 说明地址多写或少写了 /v1。'
      ],
      warn: '客户端里填地址时填到 IP:3000 即可，客户端会自动补 /v1；自己重复加就会 404。',
      coach: '这条命令是你以后排查问题的基准：它通，客户端就不该不通。',
      button: '验证通过，继续'
    },
    {
      phase: 3,
      kind: 'choice',
      short: '要不要配域名',
      title: '第 6 步：现在要做域名和 HTTPS 吗？',
      intro: '自己机器上测试可以先不做。要给别人发令牌、要在外部网络使用，建议配上 HTTPS。',
      coach: '先跳过也能用，以后随时回来补。',
      choices: [
        { title: '现在就配', copy: '我要对外使用，想用 https 域名', value: 'yes', icon: 'globe', next: 10 },
        { title: '先跳过', copy: '先自己用，直接用 IP 访问', value: 'skip', icon: 'arrow', next: 11 }
      ],
      hint: '跳过也不影响前面的成果'
    },
    {
      phase: 3,
      kind: 'task',
      short: '域名 + HTTPS',
      title: '进阶：域名解析 + 反向代理 + 证书',
      intro: '让中转站通过 https://你的域名 访问，客户端填起来更好记，也不怕在公共网络里被看到内容。',
      bullets: [
        '把 {{ domain }} 解析到你的 VPS 公网 IP（{{ vpsIp }}）。',
        '在 VPS 上装 Nginx Proxy Manager（或你熟悉的其它反向代理）。',
        '新建一个代理：域名填 {{ domain }}，转发到这个容器的 3000 端口（填本机 IP:3000）。',
        '在代理面板里为这个域名申请证书，开启 HTTPS，再打开强制跳转。',
        '配好后，把客户端地址从 http://{{ vpsIp }}:3000 换成 https://{{ domain }}。'
      ],
      note: '反向代理要允许长连接和大响应体，否则流式输出会中断；NPM 默认配置一般可以直接用。',
      coach: '域名 → 反向代理 → 3000 端口，三步走完就有一个能对外发的 https 地址。',
      button: 'HTTPS 配好了，完成'
    },
    {
      phase: 3,
      kind: 'done',
      short: '完成与问答',
      title: '恭喜，你的中转站已经能对外提供一个地址了',
      intro: '渠道、令牌、链路都验证过，现在你手里有一个统一的 API 入口，接哪些平台、给谁用多少，都在面板里管。',
      seeAlso: [
        { title: '10 自托管 AI 对话面板（OpenWebUI）', url: './10-openwebui.html', why: '用自己的令牌接一个网页聊天面板', icon: 'grid' },
        { title: '07 VPS 增大内存（SWAP）', url: './07-swap-memory.html', why: '标准版再加面板，内存吃紧时先垫一层', icon: 'server' }
      ],
      doneGroups: [
        {
          title: '收尾：这几件事只有你能做',
          items: [
            '确认管理员密码是自己设的强密码（不是默认的 root / 123456）',
            '把重要令牌记在自己的密码管理器里，不用了就回面板删掉',
            '定一个备份习惯：简化版备份 data 目录；标准版备份数据库和 .env',
            '要接给更多设备，就按需再多发几个令牌，别共用一个'
          ]
        }
      ],
      faqGroups: [
        {
          label: '部署与数据',
          items: [
            { q: '简化版和标准版怎么选？', a: '就看用途：一个人自己用、或者只是先跑通流程，SQLite 简化版完全够，1 核 1G 也能跑。要多人同时用、要更稳的性能和更强的并发，就上 PostgreSQL + Redis 标准版，内存给到 2G 以上。' },
            { q: '升级或换机器时什么最重要？', a: '数据。简化版是 ~/new-api/data 目录，标准版是数据库里的数据加配置里的密钥。升级前先备份，再看官方 releases 的升级说明，别直接拉最新镜像往生产上换。' },
            { q: '面板打不开 / 端口不通？', a: '先确认容器在跑（docker ps），再检查 VPS 安全组和系统防火墙是否放行 3000；如果套了域名，还要确认反向代理指向的是本机 3000。' }
          ]
        },
        {
          label: '渠道与令牌',
          items: [
            { q: '渠道「测试」不过怎么办？', a: '逐项看：Key 是否复制完整（有无多余空格）；平台里余额是否够；勾选的模型该 Key 是否真的有权限；有没有被上游限流。换一个时间再试，或者换一个渠道测试。' },
            { q: '调用返回 404？', a: '几乎都是地址问题：客户端里填 http(s)://你的地址（到端口为止）就好，客户端会自己补 /v1；重复加会变成 /v1/v1。' },
            { q: '令牌设成无限额度安全吗？', a: '自己用方便，但泄漏后果是没有上限的。更稳妥的做法：给每台设备一个令牌，设一个够用但有限的上限，不用了就删。' },
            { q: '报 401 / 无效令牌？', a: '检查三件事：令牌有没有复制全、有没有被删掉、请求头里是不是 Bearer 加一个空格再加令牌。' }
          ]
        },
        {
          label: '安全与合规',
          items: [
            { q: '数据库端口需要暴露到公网吗？', a: '不需要。数据库和 Redis 只给中转站自己用，保持只监听本机，不要映射到公网；密码也设复杂一点。' },
            { q: '对外发令牌要注意什么？', a: '先确认你接入的上游平台允许这种使用方式，再确认当地法规；商业使用尤其要看清上游条款。另外给每个使用者单独发令牌，方便限量和追溯。' }
          ]
        }
      ]
    }
  ]
};

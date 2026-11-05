window.AI_GUIDE = {
  index: '03',
  slug: 'poste-io',
  title: 'Docker 自建邮局（Poste.io）',
  subtitle: '用自己的域名收发信',
  phases: [
    { title: '前置检查', copy: '三项硬条件先核一遍' },
    { title: 'DNS 与 PTR', copy: '解析和反向解析' },
    { title: '部署邮局', copy: 'host 网络起容器' },
    { title: '邮件认证', copy: 'MX / SPF / DKIM / DMARC' },
    { title: '收发测试', copy: '双向实测与垃圾箱' }
  ],
  inputs: [
    { key: 'domain', label: '你的域名', short: '域名', placeholder: 'example.com', hint: '只填主域名，不要带 mail. 前缀——后面的配置会自动加上。', example: 'example.com' },
    { key: 'mailHost', label: '邮局主机名', short: '邮局主机名', placeholder: 'mail.example.com', hint: '习惯上用 mail. 加你的域名。DNS 记录、PTR、面板入口都用这个名字。', example: 'mail.example.com' },
    { key: 'vpsIp', label: 'VPS 公网 IP', short: 'VPS IP', placeholder: '123.45.67.89', hint: '邮局必须用独立公网 IPv4，不能是多人共享的 NAT 地址。', example: '123.45.67.89' },
    { key: 'adminPassword', label: '管理员密码（自己设）', short: '管理员密码', placeholder: '16 位以上的强密码', hint: '邮局后台的最高权限密码，在网页上创建管理员时用。建议 16 位以上、含大小写字母和符号。', example: 'Mail-Admin-2026-8kz!' }
  ],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '这篇在做什么',
      title: '这篇教程，是让你用自己的域名收发邮件',
      intro: 'Poste.io 是一套完整的邮件服务器，跑在 Docker 里：SMTP、IMAP、反垃圾、Webmail 和管理后台都自带。你只需要一台服务器、一个域名，加几个 DNS 记录。',
      facts: [
        ['服务器', '海外 VPS · 独立公网 IPv4 · Ubuntu 22.04 / 24.04 · 内存 2G 起'],
        ['必须开放', '25 端口（先问商家客服确认没封）'],
        ['域名', '可管理 DNS 的域名；mail 记录必须设为 DNS only（关掉 Cloudflare 代理）'],
        ['反向解析', 'VPS 商家面板里能把 IP 的 PTR 设成 mail.你的域名'],
        ['大概要多久', '配置半小时，等 DNS 生效和测试收发要预留 1 小时']
      ],
      warn: '前置条件是硬要求：25 端口被封、没有独立 IPv4、不能改 PTR 的 VPS 做不了邮局。下一步会带你逐条核对，确认不了就先别往下走。',
      coach: '邮局和别的服务不一样，它依赖 IP 的「名声」，所以前置条件必须是真的满足，不是可以绕过的。',
      button: '看明白了，先做检查'
    },
    {
      phase: 0,
      kind: 'checks',
      short: '前置条件核对',
      title: '第 1 步：三项硬条件，逐条核对',
      intro: '这三条每一条都能决定成败，请对着你的商家面板和客服确认，不要凭感觉勾。',
      checks: [
        '我的 VPS 有独立公网 IPv4（不是多人共享的 NAT 地址）',
        '商家确认 25 端口是开放的（没被封禁、可以对外发信）',
        '我能在商家面板里把 IP 的 PTR 反向解析改成 mail.我的域名',
        '服务器内存 2G 以上，系统是 Ubuntu 22.04 / 24.04',
        '我准备好了域名，并且能自己添加 DNS 记录'
      ],
      note: '哪一条打不了勾，就先解决那一条：换一台满足条件的 VPS，或者先找商家问清楚。硬着头皮往下做，多半卡在收信这一步。',
      coach: '这一页是整篇的分水岭：条件都满足，后面就是照着做；不满足，先换机器。',
      button: '五条都确认了，继续'
    },
    {
      phase: 0,
      kind: 'inputs',
      short: '填我的参数',
      title: '第 2 步：填入你的域名和服务器信息',
      intro: '后面所有 DNS 记录、配置文件、面板地址都会自动替换成你填的内容，不用再手改。',
      coach: '域名填主域名，邮局主机名填 mail. 加主域名，两个别填反了。',
      button: '保存，继续'
    },
    {
      phase: 1,
      kind: 'task',
      short: 'DNS 解析',
      title: '第 3 步：给 mail 主机加一条 A 记录',
      intro: '在域名服务商或 Cloudflare 里，为邮局主机名添加一条指向服务器 IP 的 A 记录。',
      facts: [
        ['记录类型', 'A'],
        ['主机名 / 名称', '{{ mailHost }}'],
        ['指向 / 内容', '{{ vpsIp }}'],
        ['代理状态', '必须关闭（Cloudflare 里是灰色云朵 DNS only）']
      ],
      bullets: [
        '如果域名托管在 Cloudflare：这条记录必须关代理（灰色云朵、DNS only）。开着橙云，邮件协议根本走不通。',
        '保存后等 DNS 生效，一般几分钟内就能查到；用 nslookup {{ mailHost }} 或在线工具确认。',
        '这条记录只建一次，后面申请证书、配置认证都用它。'
      ],
      warn: 'mail 记录开了 Cloudflare 代理，是自建邮局最常见的失败原因：解析看着没问题，收信全挂。',
      coach: '记住这一条：邮局相关的记录一律 DNS only，不经过 CDN。',
      seeAlso: [
        { title: '06 Cloudflare 加速 Halo 博客', url: './06-cloudflare-halo.html', why: '域名托管在 Cloudflare 上时，哪些开关会影响解析、哪些必须关掉', icon: 'cloud' }
      ],
      button: 'A 记录已生效'
    },
    {
      phase: 1,
      kind: 'task',
      short: '设置 PTR',
      title: '第 4 步：去商家面板把 PTR 设成邮局主机名',
      intro: 'PTR 是 IP 的反向解析：别人收到你的信，会反查「这个 IP 自称是谁」。不设 PTR，大厂邮箱多半直接判垃圾或拒收。',
      bullets: [
        '登录你的 VPS 商家面板（云服务商控制台），找到这台机器的 IP 管理或反向解析设置。',
        '把 IP 的 PTR 值设置为 {{ mailHost }}。',
        '有些商家需要在工单里申请，或者限制只能填默认格式，按商家说明来。',
        '设置后等生效（几分钟到几小时），可以用在线 PTR 查询工具复查一下。'
      ],
      note: 'PTR 记录和 A 记录要对应上：IP 反查出来是 mail.你的域名，mail.你的域名 又解析回这个 IP，这封信才「名正言顺」。',
      coach: '这条记录不在你的域名后台，而在 VPS 商家的面板里——很多人卡在这里找不到入口。',
      button: 'PTR 已设置'
    },
    {
      phase: 2,
      kind: 'task',
      short: '确认端口空着',
      title: '第 5 步：确认要用的端口没有别的程序占着',
      intro: '邮局要独占一批端口。用一条命令看一眼，如果有别的程序（比如之前装的 Nginx）占着 80 或 443，先处理掉。',
      code: [
        {
          lang: 'bash',
          caption: '查看这些端口是否已被占用（有输出就说明占用）',
          text: [
            'ss -tlnp | grep -E \':(25|80|110|143|443|465|587|993|995)\\s\' || echo "端口都空着，可以继续"'
          ]
        }
      ],
      bullets: [
        '邮局要用到的端口：25（收信）、80 / 443（网页与证书）、110 / 143 / 993 / 995（收信客户端）、465 / 587（发信）。',
        '有程序占用就先停掉它，或者换一台干净的服务器。',
        '还没装 Docker 的话，现在装上：curl -fsSL https://get.docker.com | sh'
      ],
      warn: '必须使用 host 网络模式，不能像普通网站那样只映射一个 8080 再反代——反垃圾和转发都需要看到真实来源 IP，靠端口映射会出问题。',
      coach: '这一步就是「腾地方」：邮局要占一整层楼，别的程序得先搬走。',
      button: '端口都空着'
    },
    {
      phase: 2,
      kind: 'task',
      short: '写 compose',
      title: '第 6 步：写 docker-compose.yml（host 网络）',
      intro: '邮局用 host 网络模式，直接使用服务器的网络栈。主机名必须填你的邮局域名。',
      code: [
        {
          lang: 'bash',
          caption: '建目录并写文件',
          text: ['mkdir -p ~/poste && cd ~/poste', 'nano docker-compose.yml   # 粘贴下面的内容，Ctrl+O 回车保存、Ctrl+X 退出']
        },
        {
          lang: 'yaml',
          caption: 'docker-compose.yml',
          text: [
            'services:',
            '  mailserver:',
            '    image: analogic/poste.io',
            '    container_name: mailserver',
            '    hostname: {{ mailHost }}',
            '    network_mode: host          # 官方推荐：必须用 host 网络',
            '    restart: unless-stopped',
            '    volumes:',
            '      - ./data:/data            # 邮件数据、账号、日志都在这里',
            '    environment:',
            '      - TZ=Asia/Shanghai'
          ],
          note: 'hostname 一定要是 mail.你的域名，写错了证书和邮件头都会出问题。'
        }
      ],
      bullets: [
        'hostname 填 {{ mailHost }}，这是邮局的「门牌号」。',
        'network_mode: host：host 网络下服务器防火墙才会正常工作，来源 IP 也不会被隐藏。',
        './data 是所有邮件数据的落点，备份它就等于备份整个邮局。',
        '证书不用自己配：启动后在面板里为域名申请 Let\'s Encrypt 证书即可。'
      ],
      note: '官方也提供 docker run 的等价写法（-h mail.域名 --net=host -v 目录/data:/data），两种任选其一。',
      coach: '这一份配置的核心就三行：镜像、hostname、host 网络。',
      button: '配置写好了'
    },
    {
      phase: 2,
      kind: 'task',
      short: '启动邮局',
      title: '第 7 步：DNS 和防火墙都就绪后，启动',
      intro: '启动前最后确认一遍：A 记录生效了、PTR 设好了、防火墙和安全组放行了要用的端口。然后再起容器。',
      code: [
        {
          lang: 'bash',
          caption: '启动并跟踪日志',
          text: ['docker compose up -d', 'docker logs -f mailserver   # 观察启动过程，没有反复报错即可 Ctrl+C 退出']
        }
      ],
      bullets: [
        '防火墙（如 ufw）和安全组都要放行：25、80、443、465、587、993、995。',
        '容器起来后不要马上做别的操作，先看日志里有没有证书申请失败、端口占用之类的报错。',
        '如果 25 端口根本起不来，回到第 1 步：找商家确认 25 端口状态。'
      ],
      warn: '顺序不能反：DNS 没生效就启动，申请证书会失败；端口没放行就启动，收发信会时好时坏。',
      coach: '启动这一步只是把服务点上，真正的验证在后面的收发测试。',
      button: '容器启动了'
    },
    {
      phase: 3,
      kind: 'task',
      short: '建管理员 + 证书',
      title: '第 8 步：创建管理员，申请证书',
      intro: '打开后台，创建管理员账号，然后为域名申请证书——之后 Webmail 和后台都是 https 访问。',
      links: [{ label: '打开邮局后台（你的域名）', url: 'https://{{ mailHost }}/admin/' }],
      bullets: [
        '打开上面的地址，按提示创建管理员账号，密码用你填的那个（16 位以上）。',
        '登录后台，在系统设置里为 {{ mailHost }} 申请 Let\'s Encrypt 证书，申请成功后开启强制 HTTPS。',
        '顺手在后台确认一下主机名显示的是 {{ mailHost }}（写错就回第 6 步改 compose）。',
        '证书申请失败通常是 80 端口没通或 DNS 还没生效，排查好再重试。'
      ],
      coach: '后台能打开、证书是绿的，说明网页这一面稳了；接下来才配邮件认证。',
      button: '后台和证书都好了'
    },
    {
      phase: 3,
      kind: 'task',
      short: '邮件认证',
      title: '第 9 步：配置 MX / SPF / DKIM / DMARC',
      intro: '这四条记录决定你的邮件是进收件箱还是进垃圾箱。前三条是「证明这封信真是你发的」，最后一条是「告诉对方怎么处理可疑邮件」。',
      bullets: [
        'MX 记录：在你的域名 DNS 里加一条 MX，指向 {{ mailHost }}，优先级填 10。这条决定别人发给你的信送到哪。',
        'SPF：加一条 TXT 记录，内容为 v=spf1 mx ~all，表示「只有我的 MX 主机能替我发信」。',
        'DKIM：在邮局后台生成 DKIM 密钥，把面板给出的 TXT 记录原样添加到域名 DNS。这条是签名，最影响进不进垃圾箱。',
        'DMARC：先加一条 TXT 记录 _dmarc，内容 v=DMARC1; p=none; rua=mailto:你的邮箱，用监控模式先跑一段时间，观察报告，稳定后再把 p=none 收紧成 quarantine。'
      ],
      note: '四条记录加完都要等生效（几分钟到几小时）。DKIM 的 TXT 记录很长，复制时注意别断行、别漏字符。',
      tip: '一开始不建议直接上严格策略：先用 p=none 收报告，确认自己的邮件都正常了再收紧，免得自己的正常邮件被拦。',
      coach: 'MX 管收、SPF 和 DKIM 管发、DMARC 管兜底——四条都到位，才算一个「正经」的邮局。',
      button: '四条记录都加好了'
    },
    {
      phase: 4,
      kind: 'task',
      short: '收发测试',
      title: '第 10 步：建邮箱，跟 Gmail / Outlook 双向实测',
      intro: '最后一步是把「理论上能用」变成「实际能用」。用自己的 Gmail 或 Outlook 各发一封、回一封。',
      bullets: [
        '在邮局后台新建一个普通邮箱（比如 hi@你的域名），设一个密码。',
        '用这个邮箱给 Gmail 发一封信，看看对方收件箱有没有；再让 Gmail 回一封，看看本地收不收得到。',
        '同样跟 Outlook / QQ 邮箱各测一轮——不同大厂的风控尺度不一样，多测几家才踏实。',
        '收信后在邮箱里点「显示原始邮件」，确认 SPF 和 DKIM 都显示通过（pass）。'
      ],
      note: '刚建好的新域名、新 IP 需要一点时间积累信誉。头几天少量正常收发，别一上来群发，容易被大厂拉黑。',
      tip: '检查收到的邮件是否进了垃圾箱；如果进了，按顺序回查：SPF 是否通过 → DKIM 是否通过 → PTR 是否设置正确 → 域名是否太新。',
      coach: '收发测试是邮局唯一真正的验收标准：双向都通、不进垃圾箱，这才算搭好。',
      button: '双向测试都通了，完成'
    },
    {
      phase: 4,
      kind: 'done',
      short: '完成与问答',
      title: '恭喜，你的邮局已经能收发邮件了',
      intro: '一套完整的邮件系统已经跑在你自己的域名下：后台、Webmail、SMTP/IMAP，以及防进垃圾箱的四条认证记录。',
      seeAlso: [
        { title: '07 VPS 增大内存（SWAP）', url: './07-swap-memory.html', why: '反垃圾服务加上去之后内存吃紧，可以先用 SWAP 顶', icon: 'server' }
      ],
      doneGroups: [
        {
          title: '收尾：这几件事只有你能做',
          items: [
            '把管理员密码和邮箱密码记进密码管理器',
            '确认 PTR、MX、SPF、DKIM、DMARC 都指向 {{ mailHost }}，没有多余或过期的记录',
            '定个备份习惯：定期打包服务器上的 data 目录（邮件全在里面）',
            '想用手机或电脑客户端收发信，在客户端里填 IMAP 与 SMTP 都用 {{ mailHost }}、端口 993 / 465、账号是你的完整邮箱地址'
          ]
        }
      ],
      faqGroups: [
        {
          label: '前置条件与端口',
          items: [
            { q: '25 端口被封了怎么办？', a: '只能换服务器或找商家解封。有些商家永久封 25 端口（防止滥发垃圾邮件），这种情况下这台机器做不了自建邮局，无论怎么配都发不出去信。' },
            { q: '为什么一定要 host 网络，映射端口不行吗？', a: '邮件协议需要看到真实来源 IP 才能反垃圾；端口映射会把来源 IP 藏掉，还可能让服务器被判成开放中继。所以官方也推荐 host 网络。' },
            { q: '域名托管在 Cloudflare，需要注意什么？', a: '邮件相关的记录（A、MX、SPF、DKIM、DMARC）都要设为 DNS only，不能开代理。另外 Cloudflare 免费版不支持 25 端口的代理转发，别指望用代理绕。' }
          ]
        },
        {
          label: '发信与垃圾箱',
          items: [
            { q: '发出的邮件全进垃圾箱？', a: '按顺序查：SPF 是否通过（v=spf1 mx ~all 是否生效）、DKIM 是否通过（TXT 记录有没有写错）、PTR 是否指向 mail 主机名、DMARC 是不是设得过于严格。四条都对了还进垃圾箱，多半是域名或 IP 太新，先少量正常收发养一段时间。' },
            { q: '微软邮箱（Outlook / Hotmail）拒收我的信？', a: '微软对新 IP 比较挑剔。确认 PTR 已设置、SPF/DKIM 通过后，可以在微软的发送者支持页面提交解封申请；如果只是测试，先换 Gmail 验证链路。' },
            { q: '能用来群发营销邮件吗？', a: '不建议。个人自建邮局在大厂眼里信誉很低，群发很容易被封 IP、拉黑域名，还会影响这个域名以后正常收发信。营销邮件应该用专业的邮件发送服务。' }
          ]
        },
        {
          label: '日常维护',
          items: [
            { q: '服务器 IP 换了怎么办？', a: 'IP 变了要同步改三处：DNS 的 A 记录、商家面板的 PTR、以及重新确认 SPF 指向。改完重新测试收发，别只改一处。' },
            { q: '证书过期或没申请成功？', a: '回后台重新申请。失败先确认 80 端口能从公网访问、DNS 已生效；证书续期一般由面板自动完成，偶尔失败手动点一次即可。' },
            { q: '邮件数据怎么备份？', a: '服务器上 poste 目录里的 data 目录就是全部数据（账号、邮件、日志）。备份就是打包这个目录；恢复时把它放回原位再启动容器即可。' }
          ]
        }
      ]
    }
  ]
};

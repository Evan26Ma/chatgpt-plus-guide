window.AI_GUIDE = {
  index: '06',
  slug: 'cloudflare-halo',
  title: 'Cloudflare 加速 Halo 博客',
  subtitle: '先解决国内能不能打开',
  phases: [
    { title: '托管域名', copy: '把域名交给 Cloudflare' },
    { title: '配置加速', copy: 'Worker 回源' },
    { title: '验证效果', copy: '前后对照测速' }
  ],
  inputs: [
    { key: 'domain', label: '你的域名', short: '域名', placeholder: 'blog.你的域名.com', hint: '已经在 Halo 上使用、准备交给 Cloudflare 加速的那个域名。', example: 'blog.example.com' }
  ],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '这篇在做什么',
      title: '这篇教程，是解决「网站国内打不开」这一层问题',
      intro: '海外 VPS 用普通线路建的站，国内测速常常全红：不挂代理要转几十秒，甚至根本进不去。即使换成 CN2 GIA 这类线路，偏远地区延迟也可能很高。用 Cloudflare 加速，是为了先把「能不能打开」解决掉。',
      facts: [
        ['前提', 'Halo 已经部署在海外 VPS 上，自己能正常访问'],
        ['要准备', '一个 Cloudflare 账号（免费注册）'],
        ['要准备', '你的域名，并且有权限修改 NS（域名服务器）'],
        ['大概要多久', '配置半小时，等 NS 生效几分钟到几小时']
      ],
      bullets: [
        '这是第一阶段方案：目标是国内访问稳定、能打开，不追求极致速度。',
        '「能打开」之后再谈精细优化：换线路、上 CDN 规则、做缓存策略，那时再来调。',
        '如果你还没装 Halo，先把博客跑起来再来做加速。'
      ],
      note: '域名交给 Cloudflare 后，DNS 解析都在它那边管理；加速用的是 Cloudflare 的免费能力，具体可用能力和限制以它的面板说明为准。',
      coach: '先摆正预期：这篇解决的是「打开」问题，不是「秒开」问题。',
      button: '看明白了，开始'
    },
    {
      phase: 0,
      kind: 'inputs',
      short: '填我的域名',
      title: '第 1 步：填入要加速的域名',
      intro: '后面核对 NS、绑定 Worker 都会用到它。',
      coach: '填你已经解析到 Halo 的那个域名。',
      button: '保存，继续'
    },
    {
      phase: 1,
      kind: 'task',
      short: '托管到 CF',
      title: '第 2 步：把域名托管到 Cloudflare',
      intro: 'Cloudflare 要接管你的 DNS，才能在你和访客之间做加速。做法是添加站点，然后把域名的 NS 换成它给的那两个。',
      links: [{ label: '打开 Cloudflare 控制台', url: 'https://dash.cloudflare.com/' }],
      bullets: [
        '登录 Cloudflare，点添加站点（Add a site），填入 {{ domain }}。',
        '按提示选择套餐（免费版就够这篇教程用）。',
        'Cloudflare 会给出两个 NS 地址，去你的域名注册商后台，把域名的 NS 改成这两个。',
        '等 NS 生效：一般几分钟到几小时，Cloudflare 面板上域名状态会从待处理变成已激活。'
      ],
      warn: '别在 NS 还没生效的时候去做下一步：解析没切换过来，Worker 绑定上去也不通。',
      coach: '这一步是「换管理员」：域名的解析权从注册商换到 Cloudflare。',
      button: 'NS 已生效'
    },
    {
      phase: 1,
      kind: 'task',
      short: '配置 Worker',
      title: '第 3 步：用 Worker 配置加速与回源',
      intro: '在 Cloudflare 面板里创建一个 Worker，让它作为访客的入口、回源到你的 VPS，再把你的域名绑到这个 Worker 上。',
      links: [{ label: 'Cloudflare Workers 文档', url: 'https://developers.cloudflare.com/workers/' }],
      bullets: [
        '在 Cloudflare 面板创建 Worker（免费套餐即可），跟着教程写好回源逻辑。',
        '回源地址指向你 VPS 上 Halo 的地址（IP 加端口，或你原来的解析域名）。',
        '把 {{ domain }} 绑定到这个 Worker，让访客请求先到 Worker、再到你的服务器。',
        '保存后等几分钟，让配置在全球节点生效。'
      ],
      note: 'Worker 的代码按你参考的教程来写即可；关键是回源地址要指向真实在跑的 Halo 服务，绑定关系不要漏掉。',
      coach: '这一步做完，访客的路线就变成「访客 → Cloudflare → 你的 VPS」，国内访问会稳很多。',
      seeAlso: [
        { title: '03 Docker 自建邮局（Poste.io）', url: './03-poste-io.html', why: '同一个域名如果还要收发邮件，Cloudflare 上哪些记录必须关掉代理', icon: 'mail' }
      ],
      button: 'Worker 配置完成'
    },
    {
      phase: 2,
      kind: 'task',
      short: '验证效果',
      title: '第 4 步：用国内测速工具对比前后',
      intro: '配完不算完，要拿数据说话：重新测速，对比加速前后的打开情况。',
      bullets: [
        '用国内的测速工具（各地 探测点）重新测 {{ domain }}。',
        '对比加速前：之前是超时、红色一片的区域，现在应该能连上、能打开。',
        '目标不是每个节点都极快，而是国内访问稳定、能正常秒开。',
        '如果还有大片超时，先确认 NS 是否真的生效、Worker 绑定是否漏了、回源地址是否可达。'
      ],
      note: '这是第一阶段方案：先解决「能打开」的问题；后续再做精细化线路优化。',
      tip: '测速时把「已打开」和「打开耗时」分开记录，这样后续优化才有对照。',
      coach: '记住这一步的意义：拿到「前后对比」，才知道加速到底有没有起作用。',
      button: '测速对比完成，完成'
    },
    {
      phase: 2,
      kind: 'done',
      short: '完成与问答',
      title: '搞定，国内打开的问题先解决了',
      intro: '域名已经托管到 Cloudflare，访问经过 Worker 回源，国内打开情况明显改善。接下来如果还想更快，再考虑线路和缓存的精细化优化。',
      seeAlso: [
        { title: '07 VPS 增大内存（SWAP）', url: './07-swap-memory.html', why: 'Halo 跑在低配机器上，内存不够时先垫一层', icon: 'server' }
      ],
      doneGroups: [
        {
          title: '收尾：这几件事只有你能做',
          items: [
            '确认 {{ domain }} 的 NS 已完全生效（注册商后台不再有两个旧 NS 记录）',
            '把加速前后的测速结果记下来，作为以后优化的对照',
            '检查 Halo 后台地址、证书是否仍然正常（换 NS 后偶尔需要重配）',
            '如果还需要更稳，再考虑升级线路或做缓存策略'
          ]
        }
      ],
      faqGroups: [
        {
          label: '托管与生效',
          items: [
            { q: 'NS 改了，多久生效？', a: '一般几分钟到几小时，最慢不超过 48 小时。生效前别急着配 Worker；Cloudflare 面板上域名状态变成已激活才算好。' },
            { q: '换 NS 之后原来的解析还在吗？', a: '不完全自动保留。Cloudflare 添加站点时通常会自动扫描出原有记录，添加完请逐条核对，缺的补上——尤其是指向 VPS 的 A 记录。' },
            { q: '域名在 Cloudflare 上的邮件记录会受影响吗？', a: '会。如果这个域名还用来收发邮件（MX、SPF、DKIM 等），迁移时要确认这些记录都被扫描进来；代理开关对邮件记录必须关闭（DNS only）。' }
          ]
        },
        {
          label: '加速与排错',
          items: [
            { q: '配完还是打不开？', a: '按顺序查：NS 是否生效 → Worker 是否绑定到域名 → 回源地址是否真的能访问（在 Cloudflare 面板里测试或用外部工具探）→ 源站防火墙是否放行了 Cloudflare 的请求。' },
            { q: '能用 Cloudflare 的免费套餐吗？', a: '这篇教程的做法用免费套餐就能完成。具体额度、可用功能和限制以 Cloudflare 面板与官方文档为准，不要照搬第三方教程里的旧说法。' },
            { q: '加速会不会影响 Halo 后台或登录？', a: '一般不影响前台访问；后台如果用同一域名，建议单独确认登录流程正常（必要时给后台另配一个不走加速的域名）。' }
          ]
        }
      ]
    }
  ]
};

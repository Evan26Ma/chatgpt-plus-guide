window.AI_GUIDE = {
  slug: 'roogoo-card',
  category: 'account',
  index: '15',
  title: 'Roogoo 虚拟卡开卡',
  subtitle: '注册实名 → 买 USDT → 链上充值 → 开乐享卡',
  phases: [
    { title: '注册实名', copy: '账户和 Sumsub 认证' },
    { title: '买 USDT', copy: '交易所 C2C 购买' },
    { title: '链上充值', copy: '三项一致再提交' },
    { title: '开乐享卡', copy: '保存卡信息' }
  ],
  steps: [
    {
      phase: 0,
      short: '先看全貌',
      title: '四步拿到一张能付海外订阅的卡',
      intro: '注册实名 → 买 USDT → 链上充值 → 开通乐享卡。全程约 30 分钟，开好的乐享卡是一张国际通行的 Visa 虚拟卡，可以付 ChatGPT、Claude 这类海外订阅。',
      promo: {
        badge: '免费领 1 美元',
        title: '专属邀请码',
        code: '9bj8r8',
        reward: '注册时填这个邀请码，可以免费获得 1 美元。',
        hint: '下一步的注册链接已经带上邀请码；手动打开注册页的话，把邀请码填进「邀请码」一栏即可。'
      },
      facts: [
        ['大概要多久', '约 30 分钟，其中实名和开卡审核各约 10 分钟'],
        ['要准备什么', '一个能收验证码的邮箱、身份证或护照、本人实名的支付宝或微信'],
        ['要花多少钱', '开卡首充 10 USDT（进卡内余额，可以正常消费）；开 Plus 建议一共准备 18–19 U'],
        ['网络', 'Roogoo 提示「频繁登录」就换香港节点；注册、实名、买 U、开卡都不需要菲律宾节点']
      ],
      coach: '先把四步看一遍，心里有数再动手。最容易出错的是第三步链上充值，到时候会有核对清单。',
      button: '明白了，开始注册'
    },
    {
      phase: 0,
      short: '注册并实名',
      title: '注册 Roogoo 并完成实名',
      intro: '先拿到一个 Roogoo 账户并完成实名。这一步免费，实名审核大约 10 分钟通过。',
      links: [{ label: '打开 Roogoo 注册页（已带邀请码）', url: 'https://wap.roogoo.shop/register?inviteCode=9bj8r8' }],
      bullets: [
        '用任意邮箱注册账户密码，能收验证码就行；从上面的链接打开会自动带上邀请码（图一）。',
        '登录后点右上角头像，在菜单里进入「设置」（图二）。',
        '在「实名认证」一栏点「待认证」进入 Sumsub 认证：身份证或护照都可以，如实填写、照片拍清楚，不要美颜或 AI 修图。同一页的「身份验证应用」可以不绑，实名必须完成（图三）。',
        '实名通过后先回首页，不要急着点「免费申请卡片」——账户里还没有余额，先去买 U 充值。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-register.webp', alt: 'Roogoo 注册页：填邮箱、验证码和登录密码，邀请码一栏已自动填入 9bj8r8', caption: '图一 · 注册页：填好邮箱、验证码和登录密码，「邀请码」会自动带上 9bj8r8' },
        { src: '@embed-image:assets/roogoo-card/roogoo-profile-settings.webp', alt: 'Roogoo 首页右上角头像菜单展开，「设置」被红圈标出', caption: '图二 · 点右上角头像，在菜单里选「设置」' },
        { src: '@embed-image:assets/roogoo-card/roogoo-kyc-settings.webp', alt: 'Roogoo 设置页：实名认证显示「待认证」，身份验证应用显示「未绑定」', caption: '图三 · 点「实名认证」的「待认证」进去做 Sumsub 认证；「身份验证应用」可以不绑' }
      ],
      warn: 'Roogoo 提示「频繁登录」就换香港节点。注册、实名、买 U、开卡都不需要菲律宾节点，准备打开 GPT 官网时再开。',
      note: '访问海外网站要先有能用的网络：有谷歌邮箱可以用 Niva（稳定、快，注册页要先开梯子访问；移动用户不要买）；没有谷歌邮箱或运营商是移动，可以用 btcr（有菲律宾节点，需要买套餐）。',
      tip: '身份证和人脸信息只提交给 Roogoo 官方平台；费用和资格以平台当前页面为准。',
      coach: '实名不过大多是照片模糊：四角拍全、不反光，重拍一张再传。',
      button: '实名通过了'
    },
    {
      phase: 1,
      short: '买 USDT',
      title: '在交易所买 USDT（10 U 起才能开卡）',
      intro: '交易所任选一家（欧易 / 币安 / Gate 都可以），跟着对应的官方教程操作。下面以币安为例。',
      facts: [
        ['按本站教程开 Plus', '充 18–19 U'],
        ['只开卡、做别的用途', '建议 10.5 U（开卡门槛 10 U，链上提币有手续费，别正好卡 10 U）'],
        ['邀请码奖励', '用邀请码注册再送 1 美元，到手约 11 U']
      ],
      links: [
        { label: '欧易 (OKX) 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/11761276-通过欧易-okx-数字货币交易所购买usdt稳定币指南' },
        { label: '币安 (Binance) 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/13213729' },
        { label: 'Gate 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/15237655-通过gate数字货币交易所购买usdt稳定币指南' }
      ],
      bullets: [
        '下载所选交易所的 App，邮箱注册并完成身份证 KYC（细节跟着上面对应的教程走）。',
        '进入「充值 → C2C 交易」：币种 USDT、法币 CNY，按实时汇率挑商家，确认订单限额覆盖你要付的金额（图一）。',
        '用本人实名的支付宝或微信付款，转账备注一律留空，等卖家放币（图二）。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/binance-c2c.webp', alt: '币安 C2C 界面：买入、USDT、CNY、订单限额与购买按钮', caption: '图一 · 币安 C2C：选「买入 USDT」、支付 CNY，挑订单限额覆盖支付金额的商家' },
        { src: '@embed-image:assets/roogoo-card/binance-buy.webp', alt: '币安购买 USDT 下单页：广告方条款、支付金额、购买按钮', caption: '图二 · 下单页：填金额点「购买 USDT」，按卖家二维码实名付款，备注留空' }
      ],
      warn: '只在正规大所买 U。私下交易容易收到黑 U、假 U，而且追不回来。',
      note: 'iPhone 下载交易所 App 需要海外 Apple ID。',
      coach: '金额按上面的表准备就行；多出来的 U 后面也能继续充进卡里用。',
      button: 'USDT 已到账交易所'
    },
    {
      phase: 1,
      short: '身份验证器（按需）',
      title: '平台要求时，再绑定身份验证器',
      intro: '「谷歌身份验证 / 安全认证」没有强制要求时可以先跳过。注册、登录或提币时必须绑定，再进「账户安全」显示绑定二维码。它和身份证实名是两回事，下面任选一种方法。',
      facts: [
        ['苹果手机', '用自带的「密码」App：相机扫描绑定二维码，按提示添加到对应账户'],
        ['安卓手机', '谷歌商店下载 Google Authenticator，登录谷歌账号后点「+ → 扫描二维码」'],
        ['任意手机', '微软 Microsoft Authenticator：点「+ → 其他账户」，扫描绑定二维码'],
        ['华为手机', '先装「出境易」，再按安卓手机的方法安装并扫码']
      ],
      bullets: ['扫码后，把身份验证器生成的验证码填回平台完成绑定；以后平台要求验证时，打开对应 App 看验证码。'],
      coach: '用不到就直接下一步，不影响开卡。',
      button: '已绑定，或者不需要'
    },
    {
      phase: 2,
      short: '链上充值',
      title: '把 USDT 提到 Roogoo（币种、网络、地址三项一致）',
      intro: '这是最容易丢钱的一步。核心只有一条：交易所提现页和 Roogoo 充币页的币种、网络、地址完全一致。',
      bullets: [
        'Roogoo「首页 → 充币收款 → 链上充币」：按平台内的充币教程选择币种和网络（当前是 USDT + BSC），复制生成的充值地址（图一）。',
        '回到交易所「提现」：币种、网络、地址填得和 Roogoo 充币页完全一样（图二）。',
        '数量按上一步的表填：开 Plus 提 18–19 U，只开卡提 10.5 U（链上手续费约 0.01 U），输入验证码提交。',
        '几分钟后订单显示「已完成」，Roogoo 网站余额到账（图三）。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-deposit-menu.webp', alt: 'Roogoo 首页：充币收款下拉菜单中的链上充币', caption: '图一 · Roogoo 首页：充币收款 → 链上充币，选币种网络后复制地址' },
        { src: '@embed-image:assets/roogoo-card/binance-withdraw.webp', alt: '币安提现页与 Roogoo 链上充币页对照：USDT、BSC 网络、地址一致', caption: '图二 · 币安提现（左）对 Roogoo 充币页（右）：币种 USDT、网络 BSC，两边必须一致' },
        { src: '@embed-image:assets/roogoo-card/roogoo-arrived.webp', alt: 'Roogoo 充值前后余额对比', caption: '图三 · 到账后余额变化，随后点「卡片」进入开卡申请' }
      ],
      note: '币种和网络以 Roogoo 平台内充币教程实时显示为准，平台有更新就跟平台走。',
      coach: '先别点提交，下一步有一张核对清单，逐项打勾再提。',
      button: '地址复制好了，去核对'
    },
    {
      phase: 2,
      kind: 'checks',
      short: '提交前核对',
      title: '提交提现前，逐项打勾',
      intro: '四项都对上再点交易所的「提现」。充错网络的链上资产基本找不回来。',
      checks: [
        '币种：两边都是 USDT',
        '网络：交易所选的网络和 Roogoo 充币页显示的一致（当前是 BSC）',
        '地址：从 Roogoo 复制粘贴，没有手打；首尾几位和 Roogoo 页面对过',
        '数量：开 Plus 18–19 U，只开卡 10.5 U'
      ],
      warn: '到账前不要进行下一步。超过半小时没到账，先在交易所查提币记录的链上状态和交易 ID，再联系交易所客服。',
      coach: '四个勾全打上，按钮才会亮。',
      button: '已提交，余额到账了'
    },
    {
      phase: 3,
      short: '开乐享卡',
      title: '开通乐享卡，保存卡信息',
      intro: 'Roogoo 有几款卡，只有美国发卡的乐享卡（Enjoy Card）能付 AI 订阅这类消费，其他卡付不了，千万别选错。',
      facts: [
        ['乐享卡 Enjoy Card ✓', '交易费 1% · 非美元区跨境费 1.6% · 首充 10 USDT · 支持 AI 订阅'],
        ['无境卡 Beyond Card', '交易费 0.5% · 跨境费 0% · 首充 50 USDT · 不支持 AI 订阅'],
        ['随行卡 Buddy Card', '交易费 2.5% · 跨境费 0% · 首充 20 USDT · 不支持 AI 订阅']
      ],
      bullets: [
        'Roogoo 首页点左侧「卡片」进入申请界面（图一）。',
        '在「申请卡片」页找到虚拟卡 - 消费分类下的乐享卡（图二）。',
        '点「申请卡片」，从网站余额扣 10 USDT 作为首充；审核约 10 分钟，卡内余额可能延迟几分钟显示，刷新等待（图三）。',
        '立刻保存卡号、有效期、安全码（CVV），付款时要填。',
        '按需从网站余额往卡里充值；卡内常留 3–5 U 防冻结，消费前确认余额够。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-card-entry.webp', alt: 'Roogoo 首页：左侧「卡片」入口', caption: '图一 · 首页左侧「卡片」进入申请界面' },
        { src: '@embed-image:assets/roogoo-card/roogoo-enjoy-select.webp', alt: '申请卡片页：乐享卡 (Enjoy Card) 被圈出', caption: '图二 · 申请卡片页：认准乐享卡 (Enjoy Card)' },
        { src: '@embed-image:assets/roogoo-card/roogoo-enjoy-card.webp', alt: '乐享卡开通后界面：持卡人信息创建中，点击刷新', caption: '图三 · 「持卡人信息创建中」属于正常，点「刷新」等余额显示' }
      ],
      warn: '余额不足时不要尝试扣款：会产生拒付费（20 美元的账单约收 0.9 美元，也有十几元的反馈），成功扣款的手续费很少。',
      note: '费率以平台当前页面为准。',
      coach: '开好之后先充 1 美元小额试一下，成功了再正常用。',
      button: '卡开好了，信息已保存'
    },
    {
      kind: 'done',
      short: '完成',
      title: '卡开好了',
      intro: '你现在有一张能付海外订阅的 Visa 虚拟卡。去开 Plus 的话，按路线继续下一篇。',
      doneGroups: [
        { title: '你已经完成', items: ['Roogoo 账户注册并实名', '买到 USDT 并链上充值到账', '开通乐享卡并保存卡号、有效期、CVV'] },
        { title: '以后记得', items: ['卡内常留 3–5 U 防冻结', '余额不足时不要发起扣款', '剩余 U 只能在平台内消费，按需充值'] }
      ],
      seeAlso: [
        { title: 'ChatGPT Plus 开通', url: './17-plus.html', why: '卡准备好了，切菲律宾节点去官网开通 Plus。', icon: 'spark' },
        { title: 'Plus Guide 全部教程', url: '../', why: '回到导航，挑下一篇。', icon: 'grid' }
      ],
      faqGroups: [
        {
          label: '实名与审核',
          items: [
            { q: 'Sumsub 实名认证，大陆身份证能过吗？', a: '能，身份证或护照都可以。认证不通过大多是照片模糊，重拍清晰件（四角完整、不反光）再传。' },
            { q: '实名和开卡审核要多久？', a: '实名几分钟到几小时；开卡审核约 10 分钟。' },
            { q: '注册 Roogoo 用什么邮箱？', a: '任意邮箱都行，能收验证码即可。注册时填邀请码可以免费获得 1 美元。' }
          ]
        },
        {
          label: '充值与余额',
          items: [
            { q: '到底要充多少 USDT？', a: '按本站教程开 Plus，充 18–19 U；只开卡的话够 10 U 开卡费就行，建议提 10.5 U（中间有手续费）。首充的钱进卡内余额，可以正常消费；用邀请码注册再送 1 美元。卡内常留 3–5 U 防冻结。' },
            { q: '提币时币种、地址、网络怎么选？', a: '以 Roogoo 平台内充币教程实时显示为准（当前是 USDT + BSC），交易所提币页三项必须和 Roogoo 充币页完全一致。充错网络的链上资产基本找不回。' },
            { q: 'USDT 多久到账？', a: '链上手续费约 0.01 U，一般几分钟到账。超过半小时没到，先在交易所查提币记录的链上状态，再联系交易所客服。' },
            { q: '剩下的 USDT 能卖回人民币吗？', a: 'Roogoo 平台内不行，余额只能消费，按需充值就好。' }
          ]
        },
        {
          label: '用卡',
          items: [
            { q: '开卡后卡内余额看不到？', a: '余额显示有几分钟延迟，刷新等待即可，不要重复申请开卡。' },
            { q: '新开的卡要「放几天再用」吗？', a: '不用，当天就能消费。稳妥的做法是先充 1 美元小额试卡，成功后再正常使用。' }
          ]
        }
      ]
    }
  ]
};

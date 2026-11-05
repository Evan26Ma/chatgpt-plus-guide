window.AI_GUIDE = {
  slug: 'plus',
  category: 'account',
  storageKey: 'aiGuideStateV2::plus',
  index: '17',
  title: 'ChatGPT Plus 开通',
  subtitle: '菲律宾区官方网页直充，约 102.55 元/月',
  gate: {
    key: 'pgPlusGuideConsentV1',
    title: 'ChatGPT Plus 开通向导使用声明',
    lead: '请把声明滑到底部，等待 6 秒后点「同意」进入教程。',
    wait: 6,
    sections: [
      ['用途限制', '本网站及本教程仅用于 ChatGPT Plus 开通流程的信息整理、学习与交流，不构成 OpenAI 或任何第三方的官方授权、承诺或代理服务。除 ChatGPT Plus 开通及相关学习交流外，其他使用目的均不在本网站服务范围内。'],
      ['免费声明', '本网站向访问者免费提供，不收取教程费、咨询费或代办费，也不提供任何有偿代开、代充、代认证或账号服务。第三方平台可能产生费用、资格要求、价格变化或平台奖励，均以第三方页面和规则为准。'],
      ['风险与责任', '本教程不构成法律、财务、税务、支付、网络服务或投资建议。用户应自行确认所在地区法律法规、OpenAI 及第三方平台条款，独立判断并承担因账户、网络、支付、身份核验、第三方服务变化或自行操作产生的风险和责任。'],
      ['信息安全', '本网站不要求用户向本网站提交 ChatGPT 账号密码、验证码、支付信息、身份证件、人脸信息或其他敏感凭证。请勿向任何第三方泄露上述信息。'],
      ['继续使用即表示', '你已阅读、理解并同意本声明，确认仅为 ChatGPT Plus 开通及相关学习交流使用，并接受自行判断、自行操作、自行承担责任；不同意或拟作其他用途，请立即停止访问。']
    ],
    footer: '点「同意」即表示你已阅读并同意上述全部声明。确认记录仅保存在当前浏览器本地，不会提交到本网站服务器；这不是法律意见，也不能替代专业法律审阅。'
  },
  // 按账户情况分支：已有账户先查订阅，已订阅的停在这里；新账户多一步注册
  route: function (answers) {
    const at = id => this.steps.findIndex(step => step.id === id);
    const account = answers[at('account')];
    const path = [at('principle'), at('account')];
    if (account !== 'new') {
      path.push(at('subscribed'));
      if (answers[at('subscribed')] === 'yes') return [...path, at('blocked')];
    }
    path.push(at('proxy'));
    if (account !== 'existing') path.push(at('chatgpt'));
    return [...path, at('roogoo'), at('usdt'), at('auth'), at('chain'), at('chain-check'), at('card'),
      at('ph-node'), at('pay-check'), at('subscribe'), at('renew'), at('done')];
  },
  phases: [
    { title: '了解你的账户', copy: '原理与账户状态' },
    { title: '准备网络', copy: '代理与注册' },
    { title: '准备支付', copy: '虚拟卡与 USDT' },
    { title: '开通与后续', copy: '官网订阅与续费' }
  ],
  steps: [
    {
      id: 'principle',
      phase: 0,
      short: '先看原理',
      title: '为什么只要 102.55 元，为什么稳定',
      intro: '在 ChatGPT 官网用自己的账号自己付款（网页直充），只是把网络切到菲律宾低价区。Plus 官方标价 ₱1100.00/月，账单地址填美国免税州免税后约 ₱982.14，折合人民币最低约 102.55 元/月，是目前最便宜的官方开通方式。',
      facts: [
        ['为什么稳定、不封号', '赚的是地区定价的汇率差：账号、付款全程走 OpenAI 官方渠道，不找代充、不提供账号密码、不改账号任何信息。按教程正常操作，没有出现过因这套方法本身导致的封号记录。'],
        ['红线：一卡一号', '一张乐享卡只能绑定一个 GPT 账号。一卡多绑是明确的风控特征，轻则扣款失败，重则封号；给第二个账号订阅要另开新卡。'],
        ['这张卡以后还能用', '乐享卡是国际通行的 Visa 虚拟卡，之后还能付 Claude、Gemini 等其他 AI 会员，长期留 3–5 美元余额防冻结即可。'],
        ['一定用电脑网页端', '手机网页、App 或其他方式可能也能充，但会不会出问题、会出什么问题，这里不能保证。']
      ],
      images: [
        { src: '@embed-image:assets/plus/ph-subscribe-982.webp', alt: 'ChatGPT Plus 付款页：税额 0%，今日应付金额 PHP 982.14', caption: '实付 ₱982.14 ≈ 102.55 元/月，价格以付款确认页为准' },
        { src: '@embed-image:assets/plus/ph-plus-welcome.webp', alt: '欢迎使用 ChatGPT Plus 开通成功弹窗', caption: '付款成功即到账，欢迎页出现即开通完成' },
        { src: '@embed-image:assets/plus/ph-settled.webp', alt: 'ChatGPT Plus 订阅结算示意（金额已作隐私处理）', caption: '订阅结算示意，具体金额和状态以官方页面为准' }
      ],
      coach: '先花一分钟看懂原理，后面每一步为什么这么做就清楚了。',
      button: '看懂了，开始'
    },
    {
      id: 'account',
      phase: 0,
      kind: 'choice',
      short: '有没有账户',
      title: '你有 ChatGPT 账户吗？',
      intro: '选最符合你现在情况的一项，向导会自动安排后面的步骤。',
      choices: [
        { title: '有账户', copy: '继续检查是否已经订阅 Plus', value: 'existing', icon: 'circleCheck' },
        { title: '没有账户', copy: '先准备网络，再注册新账户', value: 'new', icon: 'edit' }
      ],
      coach: '已有账户就检查订阅状态；没有账户就先确认网络环境。'
    },
    {
      id: 'subscribed',
      phase: 0,
      kind: 'choice',
      short: '订阅状态',
      title: '这个账户现在有有效的 Plus 订阅吗？',
      intro: '只需要选一个答案。',
      choices: [
        { title: '没有订阅', copy: '可以继续后面的准备流程', value: 'no', icon: 'arrow' },
        { title: '已经订阅', copy: '订阅还在有效期内（App Store、Google Play、网页或代充都算）', value: 'yes', icon: 'lock' }
      ],
      coach: '没有订阅就继续准备；已订阅的账户暂时走不了这个流程。'
    },
    {
      id: 'blocked',
      phase: 0,
      stop: true,
      short: '等订阅到期',
      title: '当前账户已有有效订阅，先等它到期',
      intro: '已有有效订阅的账户不能再走网页直充。等当前订阅周期结束，再用没有有效订阅的账户进入本流程。',
      bullets: [
        'App Store / Google Play 订阅：在手机的订阅管理里关闭自动续费，等到期。',
        '网页订阅：在 ChatGPT「设置 → 订阅」里取消续订，等到期。',
        '第三方代充或来源不确定：先弄清楚订阅来源，再按对应渠道处理。'
      ],
      hint: '订阅到期后，点「上一步」改选「没有订阅」继续',
      coach: '不用着急，到期后回来从这里接着走，进度会保留。'
    },
    {
      id: 'proxy',
      phase: 1,
      kind: 'checks',
      short: '确认网络',
      title: '先确认：你已经能访问海外网站',
      intro: '接下来的步骤都要在海外网络环境下操作。本篇只讲 Plus 开通，不讲代理怎么买、怎么配；请先确认网络可用再继续。菲律宾节点等开卡完成、准备进官网付款时再切换。',
      checks: ['我已经有能用的代理，可以正常打开海外网站'],
      coach: '代理准备好了就打勾继续。',
      button: '网络没问题，继续'
    },
    {
      id: 'chatgpt',
      phase: 1,
      short: '注册 ChatGPT',
      title: '注册或登录 ChatGPT',
      intro: '进入 ChatGPT 官方网站，按页面提示完成注册或登录。',
      links: [{ label: '打开 ChatGPT 官方网站', url: 'https://chatgpt.com/' }],
      bullets: ['新账户：点 Sign up，完成邮箱验证和安全设置。', '注册或登录完成后，点下面的按钮继续。'],
      coach: '用自己的邮箱和官方支持的登录方式。完成后先准备虚拟卡，开卡后再切菲律宾节点。',
      button: '已注册或登录'
    },
    {
      id: 'roogoo',
      phase: 2,
      short: '注册 Roogoo',
      title: '注册 Roogoo 并完成实名',
      intro: '开始准备付款用的虚拟卡。通过官方注册链接注册，以平台当前页面为准。',
      links: [{ label: '注册 Roogoo（官方注册链接，已带邀请码）', url: 'https://wap.roogoo.shop/register?inviteCode=9bj8r8' }],
      promo: {
        badge: '免费领 1 美元',
        title: '专属邀请码',
        code: '9bj8r8',
        reward: '填写邀请码可以免费获得 1 美元。',
        hint: '通过上面的链接注册会自动带上邀请码；手动打开注册页的话，把邀请码填进「邀请码」一栏即可。'
      },
      bullets: [
        '用任意邮箱注册账户密码，邀请码会自动带上（图一）。',
        '登录后点右上角头像，在菜单里进入「设置」（图二）。',
        '在「实名认证」一栏点「待认证」进入 Sumsub 认证：身份证或护照都可以，如实填写、照片拍清楚，不要美颜或 AI 修图；「身份验证应用」可以不绑，实名必须完成（图三）。',
        '认证通过后先回首页，不要急着点「免费申请卡片」——网站还没有余额，下一步先买 U。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-register.webp', alt: 'Roogoo 注册页：邀请码一栏已自动填入 9bj8r8', caption: '图一 · 注册页：填好邮箱、验证码和登录密码，「邀请码」会自动带上 9bj8r8' },
        { src: '@embed-image:assets/roogoo-card/roogoo-profile-settings.webp', alt: 'Roogoo 首页右上角头像菜单，「设置」被红圈标出', caption: '图二 · 点右上角头像，在菜单里选「设置」' },
        { src: '@embed-image:assets/roogoo-card/roogoo-kyc-settings.webp', alt: 'Roogoo 设置页：实名认证「待认证」，身份验证应用「未绑定」', caption: '图三 · 点「实名认证」的「待认证」进去做 Sumsub 认证' }
      ],
      warn: 'Roogoo 提示「频繁登录」就换香港节点再试。菲律宾节点留到打开 GPT 官网时再开，注册、实名、开卡都不需要。',
      note: '身份证和人脸信息只提交给 Roogoo 官方平台；费用和资格以平台当前页面为准。',
      coach: '实名用身份证或护照都可以，如实填写，大约 10 分钟通过。',
      button: '实名已通过'
    },
    {
      id: 'usdt',
      phase: 2,
      short: '买 USDT',
      title: '购买 18–19 USDT（约 121 元）',
      intro: '交易所任选一家（币安 / 欧易 / Gate 都可以），跟着对应的 Roogoo 官方教程操作，下面以币安为例。预算：约 16 U 付一个月 Plus，3 U 留在卡里。',
      links: [
        { label: '币安 (Binance) 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/13213729' },
        { label: '欧易 (OKX) 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/11761276-通过欧易-okx-数字货币交易所购买usdt稳定币指南' },
        { label: 'Gate 购买 USDT 教程', url: 'https://help.roogoo.com/zh-CN/articles/15237655-通过gate数字货币交易所购买usdt稳定币指南' }
      ],
      bullets: [
        '下载所选交易所的 App，邮箱注册并完成身份证 KYC（细节跟着上面对应的教程走）。',
        '进入「充值 → C2C 交易」：币种 USDT、法币 CNY，按实时汇率选商家，确认订单限额覆盖支付金额（图一）。',
        '用本人实名的支付宝或微信付款，转账备注一律留空，等卖家放币（图二）。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/binance-c2c.webp', alt: '币安 C2C 界面：买入、USDT、CNY、订单限额与购买按钮', caption: '图一 · 币安 C2C：选「买入 USDT」、支付 CNY，挑订单限额覆盖支付金额的商家' },
        { src: '@embed-image:assets/roogoo-card/binance-buy.webp', alt: '币安购买 USDT 下单页', caption: '图二 · 下单页：填金额点「购买 USDT」，按卖家二维码实名付款，备注留空' }
      ],
      warn: '买币安、提币时不要挂美国节点（币安限制美区 IP，可能连提币都用不了），用香港或台湾节点。',
      note: 'iPhone 下载交易所 App 需要海外 Apple ID；买 U 只走正规大所，私下交易容易收到黑 U、假 U 且追不回来。',
      coach: '三家教程选一个跟着走就行。',
      button: 'USDT 已到交易所'
    },
    {
      id: 'auth',
      phase: 2,
      short: '身份验证器（按需）',
      title: '平台要求时，再绑定身份验证器',
      intro: '「谷歌身份验证 / 安全认证」没有强制要求就先跳过。注册、登录或提币时必须绑定，再进「账户安全」显示绑定二维码。它和身份证实名是两回事，下面任选一种方法。',
      facts: [
        ['苹果手机', '用自带的「密码」App：相机扫描绑定二维码，按提示添加到对应账户'],
        ['安卓手机', '谷歌商店下载 Google Authenticator，登录谷歌账号后点「+ → 扫描二维码」'],
        ['任意手机', '微软 Microsoft Authenticator：点「+ → 其他账户」，扫描同一个绑定二维码'],
        ['华为手机', '先装「出境易」，再按安卓手机的方法安装并扫码']
      ],
      bullets: ['扫码后，把身份验证器生成的验证码填回平台完成绑定；以后平台要求验证时，打开对应 App 看验证码。'],
      coach: '用不到就直接下一步。',
      button: '已绑定，或者不需要'
    },
    {
      id: 'chain',
      phase: 2,
      short: '链上充值',
      title: '链上充值到 Roogoo（币种、网络、地址三项一致）',
      intro: '把 USDT 从交易所提到 Roogoo 账户。这一步最容易丢钱，核心是三项一致。',
      bullets: [
        'Roogoo「首页 → 充币收款 → 链上充币」：按平台内充币教程选择币种和网络（当前是 USDT + BSC），复制生成的充值地址（图一）。',
        '回到交易所「提现」：币种、地址、网络与 Roogoo 充币页显示的完全一致（图二）。',
        '提现数量填 18–19 USDT，输入验证码提交；链上手续费约 0.01 USDT。',
        '几分钟后订单显示「已完成」，Roogoo 网站余额到账（图三）。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-deposit-menu.webp', alt: 'Roogoo 首页：充币收款下拉菜单中的链上充币', caption: '图一 · Roogoo 首页：充币收款 → 链上充币，选币种网络后复制地址' },
        { src: '@embed-image:assets/roogoo-card/binance-withdraw.webp', alt: '币安提现页与 Roogoo 链上充币页对照', caption: '图二 · 币安提现（左）对 Roogoo 充币页（右）：币种 USDT、网络 BSC，两边必须一致' },
        { src: '@embed-image:assets/roogoo-card/roogoo-arrived.webp', alt: 'Roogoo 充值前后余额对比', caption: '图三 · 到账后余额变化，随后点「卡片」进入开卡申请' }
      ],
      note: '币种和网络以 Roogoo 平台内充币教程实时显示为准，平台有更新就跟平台走。',
      coach: '先别提交，下一步有核对清单。',
      button: '地址复制好了，去核对'
    },
    {
      id: 'chain-check',
      phase: 2,
      kind: 'checks',
      short: '提交前核对',
      title: '点「提现」之前，逐项打勾',
      intro: '四项都对上再提交。充错网络的链上资产基本找不回来。',
      checks: [
        '币种：两边都是 USDT',
        '网络：交易所选的网络和 Roogoo 充币页一致（当前是 BSC）',
        '地址：从 Roogoo 复制粘贴，没有手打；首尾几位对过',
        '数量：18–19 USDT'
      ],
      warn: '到账前不要进行下一步。长时间没到账，先核对交易 ID，再联系交易所客服。',
      coach: '四个勾都打上，按钮才会亮。',
      button: '已提交，Roogoo 到账了'
    },
    {
      id: 'card',
      phase: 2,
      short: '开乐享卡',
      title: '开通乐享卡并保存卡信息',
      intro: 'Roogoo 的几款卡里只有乐享卡（美国发卡）支持 AI 订阅，其他卡付不了 GPT，不要选错。',
      bullets: [
        'Roogoo 首页点左侧「卡片」进入申请界面（图一）。',
        '「申请卡片」页有多款卡：认准美国发卡的乐享卡 (Enjoy Card)，无境卡不支持 AI 订阅（图二）。',
        '点「申请卡片」，从网站余额扣 10 USDT 作为首充；审核约 10 分钟，卡内余额可能延迟几分钟显示，刷新等待（图三）。',
        '立刻保存卡号、有效期、安全码（CVV），付款时要填。',
        '从网站余额再往卡里充值，把卡内凑到约 19 U：约 16 U 付 Plus，3 U 余量。'
      ],
      images: [
        { src: '@embed-image:assets/roogoo-card/roogoo-card-entry.webp', alt: 'Roogoo 首页：左侧「卡片」入口', caption: '图一 · 首页左侧「卡片」进入申请界面' },
        { src: '@embed-image:assets/roogoo-card/roogoo-enjoy-select.webp', alt: '申请卡片页：乐享卡 (Enjoy Card) 被圈出', caption: '图二 · 认准「乐享卡 (Enjoy Card)」（美国发卡，1% 交易费）' },
        { src: '@embed-image:assets/roogoo-card/roogoo-enjoy-card.webp', alt: '乐享卡开通后界面：持卡人信息创建中', caption: '图三 · 「持卡人信息创建中」属于正常，点「刷新」等余额显示' }
      ],
      warn: '余额不足时不要尝试扣款：会产生拒付费（20 美元账单约收 0.9 美元，也有十几元的反馈），成功扣款的手续费很少。新卡常留 3–5 U 防冻结。',
      coach: '开卡首充 10 U 只是门槛，钱进卡内余额；目标是卡内约 19 U。',
      button: '卡信息已保存，卡内约 19 U'
    },
    {
      id: 'ph-node',
      phase: 3,
      short: '切菲律宾节点',
      title: '切到菲律宾节点并检查网络',
      intro: '卡开好了，下一步进 GPT 官网充值 Plus。现在切到你自己的菲律宾节点，再用 IPPure 确认 IP 归属地是菲律宾。',
      links: [{ label: '打开 IPPure', url: 'https://ippure.com/' }],
      images: [
        { src: '@embed-image:assets/plus/ippure-reference.webp', alt: 'IPPure 参考截图：只需确认 IP 属地为菲律宾', caption: 'IPPure 参考：图里的原生、住宅标签和分数都不是通过条件，只看属地是不是菲律宾' },
        { src: '@embed-image:assets/plus/ph-node-reference.webp', alt: '付款前节点状态参考：菲律宾节点、全局模式、系统代理已开启', caption: '付款前节点状态参考：菲律宾节点 + 全局模式 + 系统代理开启' }
      ],
      warn: '现在切到菲律宾节点，再进入 GPT 官网付款。这次开通完成后换回常用节点，以后使用、续费都不需要菲律宾节点。',
      note: '检测条件：IP 归属地是菲律宾即可，不要求特别纯净、原生或住宅；节点连接稳定再继续。开全局代理 + 虚拟网卡（TUN），只开全局不开 TUN 有小概率支付失败。',
      coach: '延迟 200ms 也正常，只要付款那一刻稳定就行。',
      button: '已切到菲律宾，属地确认'
    },
    {
      id: 'pay-check',
      phase: 3,
      kind: 'checks',
      short: '付款前核对',
      title: '付款之前，五项都打勾',
      intro: '这五项是大家最常踩的坑。都满足再去官网点「订阅」。',
      checks: [
        '已切到菲律宾节点（全局代理 + 虚拟网卡），IPPure 显示菲律宾',
        '用电脑浏览器打开 chatgpt.com 付款，不用手机网页或 App',
        '乐享卡内余额 16 美元以上',
        '这张乐享卡没有绑过别的 GPT 账号（一卡一号）',
        '知道账单地址要填美国免税州，免税后应付 982.14 PHP'
      ],
      coach: '一项不满足就先回去补上，别带着问题去付款。',
      button: '都确认了，去付款'
    },
    {
      id: 'subscribe',
      phase: 3,
      short: '官网订阅',
      title: '在官网订阅 ChatGPT Plus（菲律宾区）',
      intro: '用电脑浏览器进入 ChatGPT 官网，保持菲律宾节点稳定。付款前核对：页面必须显示菲律宾货币（PHP），认准 ₱1100.00/月 的 Plus 档位。',
      links: [{ label: '打开 ChatGPT 官方网站', url: 'https://chatgpt.com/' }],
      alert: [
        '一定要确认自己余额足够 16 刀以上、支付价格是 982.14 PHP 才能付款；如果不符合，就重走前面的流程或者问我。',
        '免费试用看的是 Plus 套餐显示 0 元，不是最左边的「免费」套餐！Plus 显示 0 元时，先买 ChatGPT Go，再从 Go 升级到 Plus。',
        '订阅后会转一段时间的圈，不要刷新！',
        '支付失败了带着截图私聊我；禁止多次支付，禁止多次支付，禁止多次支付。'
      ],
      bullets: [
        '认准 ₱1100.00/月 的 ChatGPT Plus 档位（图一），核对套餐名称、币种与月费。',
        '付款方式选银行卡（VISA），填写乐享卡的卡号、有效期、安全码（图二）。填免税州之前页面显示 12% VAT、合计 ₱1100.00，属于正常。',
        '账单地址用 DeepSeek 生成：打开 deepseek.com，让它「随机生成一个美国免税州（如俄勒冈 Oregon）的真实格式地址，包含街道、城市、州、缩写和邮编」；全名填任意英文名，国家选美国，粘贴进去后税额变 0%（图三），应付约 982.14 PHP ≈ 102.55 元（图四）。',
        '一卡一号红线：这张乐享卡只能绑定当前这一个 GPT 账号；以后给别的账号订阅，必须另开新卡。',
        '最后核对套餐、币种、税费、金额，点「订阅」完成支付；付款成功后记下会员到期日期（图五）。'
      ],
      images: [
        { src: '@embed-image:assets/plus/ph-plus-pricing.webp', alt: 'ChatGPT Plus 菲律宾定价：₱1100.00/月', caption: '图一 · 认准 ₱1100.00/月 的 ChatGPT Plus 档位' },
        { src: '@embed-image:assets/plus/ph-pay-vat.webp', alt: '付款页：选银行卡填写卡信息，显示 12% VAT 合计 PHP 1100.00', caption: '图二 · 付款页：选「银行卡」填卡信息，未免税前含 12% VAT、合计 ₱1100.00' },
        { src: '@embed-image:assets/plus/ph-billing-taxfree.webp', alt: '账单地址填写示例：国家选美国并填写免税州地址', caption: '图三 · 账单地址：国家选美国，填写美国免税州地址' },
        { src: '@embed-image:assets/plus/ph-subscribe-982.webp', alt: '税额 0%，今日应付 PHP 982.14', caption: '图四 · 免税后应付 ₱982.14 ≈ 102.55 元，核对无误点「订阅」' },
        { src: '@embed-image:assets/plus/ph-settled.webp', alt: 'ChatGPT Plus 订阅结算示意', caption: '图五 · 订阅成功与结算示意，金额已作隐私处理' }
      ],
      coach: '菲律宾区 Plus 标价 1100.00 PHP/月；填美国免税州账单地址后税额为 0，约 982.14 PHP ≈ 102.55 元。',
      button: '订阅成功，已记下到期日'
    },
    {
      id: 'renew',
      phase: 3,
      short: '续费与保卡',
      title: '续费与保卡',
      intro: '充值完成就可以正常使用了。下面是续费和保卡要注意的事。',
      bullets: [
        '正常续费约 102.55 元/月，以实际汇率和账单为准。提前按前面的流程把钱充进乐享卡，到续费日会自动扣费。',
        '不想继续续费时，进入 ChatGPT 官方订阅设置取消续订，并核对到期日期。',
        '现在不用、以后还要这张卡，就按平台要求留余额（建议 3–5 美元），留意卡片状态，避免长期冻结后被销卡。',
      ],
      coach: '记好到期日期，续费前保证卡内余额充足。',
      button: '已了解，完成向导'
    },
    {
      id: 'done',
      kind: 'done',
      short: '完成',
      title: '恭喜，Plus 开通了！',
      intro: '准备工作全部完成，打开 ChatGPT 开始用吧。下面是大家真实踩过的坑，遇到状况先对号入座。',
      doneGroups: [
        { title: '你已经完成', items: ['开好乐享卡并充好余额', '菲律宾区网页直充 Plus（约 102.55 元/月）', '记下会员到期日期'] },
        { title: '以后记得', items: ['付款后换回常用节点，续费不需要菲律宾节点', '一卡一号，不给别的账号绑', '卡内常留 3–5 U 防冻结'] }
      ],
      seeAlso: [
        { title: '打开 ChatGPT', url: 'https://chatgpt.com/', why: '开始使用 Plus。', icon: 'external' },
        { title: '进阶玩法：Codex 秒切账号 / Gemini 反代', url: './18-more-ai.html', why: '主流程之外的两个可选教程，互相独立。', icon: 'spark' },
        { title: '稳定用 Claude', url: '../#route=claude', why: '同一张卡也能付 Claude，先把账号环境理顺。', icon: 'lock' }
      ],
      faqGroups: [
        {
          label: '付款与订阅',
          items: [
            { q: '为什么只要 102.55 元？什么是低价区？', a: 'OpenAI 按订阅地区定价，菲律宾区属于官方定价里的低价区：Plus 标价 ₱1100.00/月，账单地址填美国免税州免税后约 ₱982.14，折合人民币约 102.55 元/月。方法是「网页直充」：用自己账号在官网自己付款，只是网络出口在菲律宾，没有中间商。' },
            { q: '低价区的方法稳定吗？会封号吗？', a: '按教程正常操作，没有出现过因方法本身导致的封号记录。账号与付款全程走 OpenAI 官方渠道：不找代充、不提供账号密码、不改账号信息。注意：这次开通付款用菲律宾节点，后续使用、续费不需要；一卡一号。' },
            { q: '点「订阅」显示「支付未获批准」怎么办？', a: '按顺序排查：① Plus 套餐是否显示 0 元「免费试用」——指的是 Plus，不是最左边的「免费」套餐，这种情况先买 ChatGPT Go，再补差价升级 Plus；② 卡内余额是否够 16 U；③ 是否开了全局代理 + 虚拟网卡，IPPure 显示菲律宾；④ 最近换过节点或 IP 的话等 24 小时再试，期间不要发起任何消费；⑤ 换无痕窗口重试，还不行就过几小时再试，别连续重试扣款。' },
            { q: 'Plus 显示 0 元「免费试用」，买不了正价 Plus？', a: '这里指 Plus 套餐显示 0 元，不是最左边那个「免费」套餐。先买 ChatGPT Go，再从 Go 补差价升级 Plus；不要因为免费套餐显示 0 元就去买 Go。' },
            { q: '交易失败了，为什么还被扣了手续费？', a: '那是拒付费：余额不足时发起扣款就会产生（20 美元账单约收 0.9 美元）。卡内余额不够时千万别试扣，平时常留 3–5 U。' },
            { q: '页面显示 ₱1100.00，怎么不是 982？', a: '1100.00 PHP 是含 12% VAT 的标价。填完美国免税州账单地址后税额归零，应付约 982.14 PHP ≈ 102.55 元，以最终确认页为准。' },
            { q: '填了美国地址，怎么还有税？', a: '逐项检查：全名填了吗？州是免税州吗（如俄勒冈 Oregon）？街道、城市、邮编完整吗？哪一项空着税都不会消失。' },
            { q: '可以用菲律宾本地地址免税吗？', a: '不行。免税看的是账单地址所在的州，必须是美国免税州，填菲律宾地址会照收 VAT。' },
            { q: '可以用手机网页、App 或 Google Play 充值吗？', a: '按本教程一定在电脑网页端付款。手机网页、App 可能也能充，但不保证不出问题；Google Play 路线不免税。' }
          ]
        },
        {
          label: '网络与节点',
          items: [
            { q: '这次开通付款时网络要怎么设置？', a: '开全局代理 + 虚拟网卡（TUN 模式），再打开 ippure.com 确认 IP 归属地是菲律宾即可，不要求原生、住宅或特定纯净度分数。只开全局不开 TUN 有小概率支付失败。' },
            { q: '菲律宾节点延迟 200ms 正常吗？', a: '正常。只要付款那一刻连接稳定就行；节点频繁掉线就先换一个再操作。' },
            { q: '买币安 / 提币时挂什么节点？', a: '不要挂美国节点，币安限制美区 IP，受限 IP 下甚至无法提币。用香港或台湾节点，到付 ChatGPT 那一步再切菲律宾。' },
            { q: '付完款能马上换节点吗？以后续费还要菲律宾节点吗？', a: '可以换回平常的节点。菲律宾节点只用于这次进官网开通付款，以后使用、续费都不需要。' }
          ]
        },
        {
          label: '开卡与实名',
          items: [
            { q: 'Sumsub 实名认证，大陆身份证能过吗？', a: '能，身份证或护照都可以。认证不通过大多是照片模糊，重拍清晰件（四角完整、不反光）再传。' },
            { q: '实名和开卡审核要多久？', a: '实名几分钟到几小时；开卡审核约 10 分钟。' },
            { q: '开卡后卡内余额看不到？', a: '余额显示有几分钟延迟，刷新等待即可，不要重复申请开卡。' },
            { q: '新开的卡要「放几天再用」吗？', a: '不用，当天就能付款。稳妥的做法是先充 1 美元小额试卡，成功后再付 Plus。' }
          ]
        },
        {
          label: '买 U 与充值',
          items: [
            { q: '到底要充多少 USDT？', a: '18–19 U（约 121 元）：10 U 开卡首充，再把卡内补到约 19 U（16 U 付一个月 Plus，3 U 余量）。旧版教程写的 10.05 U 是不够的。' },
            { q: '提币时币种、地址、网络怎么选？', a: '以 Roogoo 平台内充币教程实时显示为准（当前是 USDT + BSC），交易所提币页三项必须和 Roogoo 充币页完全一致。充错网络的链上资产基本找不回。' },
            { q: '币安提币按钮用不了？', a: '大概率当前 IP 是美国或受限地区，切到香港 / 台湾节点再操作。' },
            { q: 'C2C 买 U 时转账备注写什么？', a: '一律留空。备注出现「买U」「币安」等字样可能被商家退款投诉，而且必须用本人实名的支付宝 / 微信付款。' },
            { q: 'USDT 充值多久到账？', a: '链上手续费约 0.01 U，一般几分钟到账。超过半小时没到，先在交易所查提币记录的链上状态，再联系交易所客服。' },
            { q: '剩下的 USDT 能卖回人民币吗？', a: 'Roogoo 平台内不行，余额只能消费。按 18–19 U 充值、花掉约 16 U，剩下 3 U 正好留作卡内余量。' }
          ]
        },
        {
          label: '封号与风控',
          items: [
            { q: '一张卡可以绑多个 GPT 账号吗？', a: '不可以，红线是一卡一号。一卡多绑是明确的风控特征，轻则扣款失败，重则账号与卡片都被封。要给第二个账号订阅，另开一张新卡。' },
            { q: '这张卡以后还能用来订阅别的 AI 吗？', a: '可以。乐享卡是国际通行的 Visa 虚拟卡，之后可以充值 Claude、Gemini 等其他 AI 会员。同样建议一个平台固定一张卡，卡内常留 3–5 美元防冻结。' },
            { q: '怎么降低封号风险？', a: '这次开通付款时保持菲律宾节点稳定，付款后用自己常用的节点；用没有封号历史的卡，不参与代充和资金盘，一卡一号不多绑。' },
            { q: '和别人合租 / 拼车账号有什么风险？', a: '多人并发使用会被判定，出现降智（模型被换成低配版本），严重时封号。自己订阅 + 固定环境最稳。' }
          ]
        }
      ]
    }
  ]
};

window.AI_GUIDE = {
  index: '30',
  slug: 'ip-guide',
  title: '美国住宅 IP 向导',
  subtitle: '给代理套个稳定、静态、纯净的马甲。住宅 IP 从购买到检测，配置和自查各一段 AI 提示词。',
  homeHref: 'https://map.plus-guide.fun/',
  category: { title: '账号与订阅', href: 'https://map.plus-guide.fun/#account' },
  legacyStorageKeys: ['ipFlowStateV2'],
  migrateProgress(value, key) {
    if (key !== 'ipFlowStateV2') return value;
    const migrated = { current: 0, history: [], answers: {}, done: {}, checks: {} };
    if (!value || typeof value !== 'object' || Array.isArray(value)) return migrated;
    for (let index = 0; index < 15; index += 1) {
      if (index === 3) {
        if (value[index] === 'private' || value[index] === 'dedicated') {
          migrated.answers[index] = value[index];
          migrated.done[index] = true;
        }
      } else if (value[index] === true) migrated.done[index] = true;
    }
    if (Number.isInteger(value.current) && value.current >= 0 && value.current < 15) migrated.current = value.current;
    if (Array.isArray(value.history)) {
      migrated.history = [...new Set(value.history.filter(index => Number.isInteger(index) && index >= 0 && index < migrated.current))];
    }
    if (Array.isArray(value.checks)) migrated.checks[13] = Array.from({ length: 4 }, (_, index) => value.checks[index] === true);
    return migrated;
  },
  // 与 ip-ui.js 的路线一致：未选套餐时也以 Private 估算，两个配置页在地区选择前汇合。
  route(answers = {}) {
    return [0, 1, 2, 3, answers[3] === 'dedicated' ? 5 : 4, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  },
  consent: {
    version: 1,
    storageKey: 'ipGuideAccessConsentV1',
    deniedStorageKey: 'ipGuideAccessDeniedV1',
    purpose: 'ip-learning',
    phrase: '本人已阅读并同意本声明，仅将本教程用于家庭静态 IP 配置及相关学习交流，不用于任何其他用途，并自行承担相关使用责任。',
    kicker: '访问前确认',
    title: '家庭静态 IP 向导使用声明',
    intro: '请先阅读并确认用途。未完成确认前，无法进入教程。',
    html: `<div role="document">
      <p><strong>用途限制：</strong>本网站及本教程仅用于家庭静态 IP 配置的技术整理、学习与交流，不构成 Webshare、Clash 或任何第三方的官方授权、承诺或代理服务。除家庭静态 IP 配置及相关学习交流外，其他使用目的均不在本网站服务范围内。</p>
      <p><strong>免费声明：</strong>本网站向访问者免费提供，不收取教程费、咨询费或代办费，也不提供任何有偿代购、代配或账号服务。第三方平台可能产生费用、资格要求或价格变化，均以第三方页面和规则为准。</p>
      <p><strong>风险与责任：</strong>本教程不构成法律、财务、税务、支付或网络服务建议。用户应自行确认所在地区法律法规及第三方平台条款，独立判断并承担因账户、网络、支付、第三方服务变化或自行操作产生的风险和责任。</p>
      <p><strong>信息安全：</strong>本网站不要求用户提交账号密码、验证码、支付信息、身份证件或其他敏感凭证。代理参数请妥善保存在本机，切勿公开。使用能读取本机文件的 AI 助手前，请确认所用工具和模型服务商如何处理读取内容；提示词中的保密要求不能替代其数据处理规则。</p>
      <p><strong>继续使用即表示：</strong>你已阅读、理解并同意本声明，确认仅为家庭静态 IP 配置及相关学习交流使用，并接受自行判断、自行操作、自行承担责任；不同意或拟作其他用途，请立即停止访问。</p>
    </div>`,
    purposeTitle: '请选择本次访问用途',
    purposes: [
      { value: 'ip-learning', icon: 'IP', title: '仅用于家庭静态 IP 配置学习', copy: '我确认只将本教程用于家庭静态 IP 配置及相关学习交流。' },
      { value: 'other', icon: '!', title: '其他用途', copy: '不属于本网站服务范围，选择后将拒绝继续访问。', deny: true }
    ],
    checkboxLabel: '本人确认只使用本教程进行家庭静态 IP 配置及相关学习交流，不作任何其他用途，并同意上述全部声明。',
    inputLabel: '请完整输入以下确认文字：',
    inputPlaceholder: '请完整输入上面的文字',
    button: '本人确认，仅进入家庭静态 IP 向导',
    note: '确认记录仅保存在当前浏览器本地，不会提交到本网站服务器；这不是法律意见，也不能替代专业法律审阅。',
    denied: {
      title: '访问已拒绝',
      text: '你选择的用途不属于本网站服务范围。页面不会继续加载教程，请关闭当前页面。',
      documentTitle: '访问已拒绝 · 美国住宅 IP 向导'
    }
  },
  phases: [
    { title: '确认准备', copy: '已有可用代理', icon: 'globe' },
    { title: '购买住宅 IP', copy: '注册、选档、保存参数', icon: 'card' },
    { title: 'AI 提示词', copy: '配置一段，自查一段', icon: 'grid' },
    { title: '检测与收尾', copy: '核对质量、参数与续费', icon: 'circleCheck' }
  ],
  inputs: [],
  steps: [
    {
      id: 'ready',
      phase: 0,
      kind: 'info',
      short: '确认已有代理',
      title: '给已有代理套一个固定的住宅“马甲”',
      intro: '你已经有可用的代理，这篇再加一个美国静态住宅 IP，让对外出口尽量固定、稳定、纯净。先购买并保存参数，再把配置和自查交给 AI 助手。',
      coach: '从已有可用代理出发，接下来只准备住宅出口。配置与自查各有一段提示词，可以整段复制。',
      bullets: [
        '准备一台已经在用 Clash Verge Rev、现有代理能正常工作的电脑。',
        '住宅 IP 是给现有代理增加的固定出口，静态表示地址保持固定，不代表网络永不波动。',
        '“纯净”需要实际检测；住宅标签、ASN 和检测分数都不能保证平台接受或账号不触发风控。'
      ],
      html: `<div class="block faqs"><details>
        <summary>开始前先看一眼：住宅“马甲”解决什么<span class="sticker">固定出口 · 质量需实测</span></summary>
        <p>已有代理正常可用，再增加一个固定的住宅出口</p>
        <div class="facts">
          <div class="fact"><strong>用途：给已有代理套个住宅“马甲”</strong><span>现有代理照常工作，再加一个<strong>固定的美国住宅出口</strong>。目标是让出口更稳定、地址保持静态、IP 质量更纯净；实际表现取决于分配到的 IP 和连接状况。</span></div>
          <div class="fact"><strong>流程：购买参数，配置与自查交给 AI</strong><span>前半段保留 Webshare 的购买与参数保存。后半段只有<strong>配置、自查两段 AI 提示词</strong>，分别用于接入住宅出口，以及核对配置生效与实际出口。</span></div>
          <div class="fact"><strong>效果：每条 IP 都要实际检测</strong><span>下图是历史检测示例。不同 IP、时间和检测库的结果可能不同，<strong>住宅标签和纯净度分数不等于平台资格或账号安全保证</strong>。套餐价格、库存和替换次数也以官方页面为准。</span></div>
          <div class="fact"><strong>红线：凭据保密、用途正当</strong><span>Webshare 的 IP、端口、用户名、密码等同密码，泄露等于把节点送人。本教程只用于正常的家庭静态 IP 配置和学习测试，<strong>不用于任何违反平台规则的操作</strong>。</span></div>
        </div>
        <div class="gallery"><figure class="shot"><button type="button" data-img="` + '@embed-image:assets/ip-guide/ip-before-after.png' + `" data-cap="使用前后 IP 质量对比：机房 IP 风险 38% → 住宅 IP 纯净度 100 分" aria-label="放大查看：使用前后 IP 查询结果对比"><img src="` + '@embed-image:assets/ip-guide/ip-before-after.png' + `" alt="使用前后 IP 查询结果对比：使用前为日本机房 IP，风险度 38%；使用后为美国住宅 IP，风险度约 2%、纯净度 100 分" width="1091" height="940" loading="lazy" decoding="async"><span class="zoom">点击放大</span></button><figcaption>配置家宽 IP 前后纯净度差异：左侧机房 IP、右侧住宅 IP，以检测结果为准</figcaption></figure></div>
      </details></div>`,
      button: '已有可用代理，开始准备住宅 IP'
    },
    {
      id: 'register',
      phase: 1,
      kind: 'task',
      short: '注册 Webshare',
      title: '注册 Webshare 账号',
      intro: '打开 Webshare 官网注册。有谷歌账号就用谷歌一键登录，没有就用自己的邮箱 Sign up。',
      coach: '认准官网 webshare.io；注册本身免费，购买 IP 才会产生费用。',
      links: [{ label: '打开 Webshare 官网', url: 'https://www.webshare.io/' }],
      images: [
        { src: '@embed-image:assets/ip-guide/ip-signin.png', alt: 'Webshare 登录页：Sign in with Google 一键登录，或 Need an account? Sign up 邮箱注册', caption: '图一 · 有谷歌账号用一键登录，没有就点 Sign up 用邮箱注册', width: 1091, height: 1050 }
      ],
      bullets: [
        '打开官网，用「Sign in with Google」一键登录（图一）。',
        '没有谷歌账号就点「Need an account? Sign up」，用自己的邮箱注册。',
        '进入 Dashboard 后，按页面提示完成邮箱验证。'
      ],
      note: '后续付款需要可支付美元的银行卡；价格、库存和付款要求以官方当前页面为准。',
      button: '注册完成，继续'
    },
    {
      id: 'static-residential',
      phase: 1,
      kind: 'task',
      short: '进入静态住宅购买页',
      title: '进入 Static Residential 购买页',
      intro: '认准「静态住宅」产品线。普通 Proxy Server 和 Rotating Residential 都不是本教程选择的产品。',
      coach: '左侧菜单 Static Residential → 右侧 Buy Now。先核对产品线，再看套餐。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-dashboard.png', alt: 'Webshare Dashboard：左侧菜单 Static Residential 被红框圈出', caption: '图一 · 左侧菜单点「Static Residential」', width: 1091, height: 600 },
        { src: '@embed-image:assets/ip-guide/ip-pricing.png', alt: 'Proxy Pricing 页：Static Residential 右侧 Buy Now 按钮，下方为三档共享方案', caption: '图二 · Proxy Pricing 页点右侧「Buy Now」，进入配置页', width: 1091, height: 800 }
      ],
      bullets: [
        '登录后左侧菜单点「Static Residential」（图一）。',
        '在 Proxy Pricing 页点右侧绿色「Buy Now」按钮（图二），进入配置页。',
        'Static Residential 提供固定的 ISP 出口；具体 IP 类型与归属仍以分配结果和实际检测为准。'
      ],
      button: '已进入配置页，继续'
    },
    {
      id: 'plan',
      phase: 1,
      kind: 'choice',
      short: '选择 Private 或 Dedicated',
      title: '两种方案，按预算选一个',
      intro: '截图中的 Private 约 $1.50/月，Dedicated 约 $3.50/月。主要区别是共享程度；请以自己结账页显示的价格和套餐说明为准。',
      coach: '先看共享程度和预算。独享程度更高，也不等于速度、稳定性或检测分数一定更好。',
      choices: [
        { title: 'Private · 约 $1.50/月', copy: '截图标注 Shared with 1–2 users，预算优先', value: 'private', icon: 'card', next: 4 },
        { title: 'Dedicated · 约 $3.50/月', copy: '截图标注 Fully owned by you，独享优先', value: 'dedicated', icon: 'grid', next: 5 }
      ],
      hint: '你的选择会决定后续步骤，随时可以返回修改。',
      note: '本教程截图使用 1 个 IP、250GB 月流量的起步配置；实际套餐与可选项以当前页面为准。'
    },
    {
      id: 'private',
      phase: 1,
      kind: 'task',
      short: 'Private 配置',
      title: 'Private 档位：这样选配置',
      intro: '按红框指示选三处：共享级别选 Private、数量用 Custom 填 1、带宽选 250GB。',
      coach: '先按实际用量选，一个固定出口就从 1 个 IP 开始。提交前核对 Summary。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-plan-private.png', alt: 'Static Residential 配置页：Private 档被红框圈出，Custom 数量填 1，带宽 250GB，Summary 显示 $1.50', caption: '图一 · Private + Custom 1 个 + 250GB，截图价格 $1.50/月', width: 1091, height: 650 }
      ],
      bullets: [
        'EXCLUSIVITY 选「Private」（图一），核对当前页面的共享说明。',
        'PROXY NUMBER 选「Custom」，输入 1，点 Save。',
        'BANDWIDTH 选「250 GB」，或按自己的用量选择。',
        '核对右侧 Summary 的产品线、数量、流量和实际金额。'
      ],
      next: 6,
      button: '选好了，继续'
    },
    {
      id: 'dedicated',
      phase: 1,
      kind: 'task',
      short: 'Dedicated 配置',
      title: 'Dedicated 档位：这样选配置',
      intro: '按红框指示选三处：独享级别选 Dedicated、数量用 Custom 填 1、带宽选 250GB。',
      coach: 'Dedicated 的截图说明为 Fully owned by you；当前共享规则与费用仍看官方页面。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-plan-dedicated.png', alt: 'Static Residential 配置页：Dedicated 档被红框圈出，Custom 数量填 1，带宽 250GB，Summary 显示 $3.50', caption: '图一 · Dedicated + Custom 1 个 + 250GB，截图价格 $3.50/月', width: 1091, height: 695 }
      ],
      bullets: [
        'EXCLUSIVITY 选「Dedicated」（图一）。',
        'PROXY NUMBER 选「Custom」，输入 1，点 Save。',
        'BANDWIDTH 选「250 GB」，或按自己的用量选择。',
        '核对右侧 Summary 的产品线、数量、流量和实际金额。'
      ],
      next: 6,
      button: '选好了，继续'
    },
    {
      id: 'location',
      phase: 1,
      kind: 'task',
      short: '选择美国地区',
      title: '选择美国地区',
      intro: '在 Choose Location of Proxies 里把地区选成美国，然后点右侧 Continue 进入结算。',
      coach: '选完核对 Selected 一栏显示 United States 1，避免买错地区或数量。',
      images(answers = {}) {
        return answers[3] === 'dedicated'
          ? [{ src: '@embed-image:assets/ip-guide/ip-location-dedicated.png', alt: 'Choose Location of Proxies：US United States 被红框圈出，Summary 为 Dedicated $3.50', caption: '图一 · 地区选「US United States」，随后点右侧 Continue 进入结算', width: 1091, height: 665 }]
          : [{ src: '@embed-image:assets/ip-guide/ip-location-private.png', alt: 'Choose Location of Proxies：US United States 被红框圈出，Summary 为 Private $1.50', caption: '图一 · 地区选「US United States」，选完点右侧 Continue（示意图为 Private 档）', width: 1091, height: 700 }];
      },
      bullets: [
        '地区列表里选「US United States」（图一）；Selected 一栏应显示 United States 1。',
        '选完点右侧 Summary 下方的绿色「Continue」按钮，进入订阅结算界面。'
      ],
      button: '已进入结算，继续'
    },
    {
      id: 'checkout',
      phase: 1,
      kind: 'task',
      short: '付款与自动续费',
      title: '付款订阅（绑卡自动扣费）',
      intro: 'Checkout 页填卡付款。绑卡订阅后按套餐周期自动扣费，不需要时要在后台取消续费。',
      coach: '确认金额和续费周期后再付款。没有合适的支付方式，可以先看下面的虚拟卡教程。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-checkout.png', alt: 'Webshare Checkout 页：卡号、有效期、安全码、全名、国家地区、邮编等付款字段示意', caption: '图一 · 在 Webshare 官方 Checkout 页填写付款信息', width: 1091, height: 800 }
      ],
      html: `<section class="block"><h2 class="block-title">没有能付美元的卡？</h2>
        <p>本站配套的虚拟卡开通教程会带你开一张可在线支付的 Visa 虚拟卡——Webshare 订阅实测可用，之后订阅其他 AI 服务也用得上。</p>
        <p><span class="sticker">已上线</span></p>
        <div class="links"><a class="link" href="https://map.plus-guide.fun/guides/15-roogoo-card.html" target="_blank" rel="noopener noreferrer"><span><b>查看虚拟卡开通教程</b><small>新标签页打开教程</small></span></a></div>
      </section>`,
      bullets: [
        'Payment Method 按页面要求填入本人真实的付款资料（图一）。',
        '核对当前 Pay Today 金额、套餐周期和后续自动续费规则。',
        '确认后提交；以官方页面的付款结果和账单为准，不要重复点击支付。'
      ],
      note: '付款资料只填写在官方结账页，不要发给本站、群聊或 AI 助手。',
      button: '付款成功，继续'
    },
    {
      id: 'credentials',
      phase: 1,
      kind: 'task',
      short: '保存住宅 IP 参数',
      title: '保存住宅 IP 参数',
      intro: '购买后在左侧「Proxy List」里查看 IP、端口、用户名和密码，把它们保存在自己的电脑上，供下一步 AI 配置时读取。',
      coach: '下一步提示词使用本机文件路径。把参数留在本机，可以减少把完整凭据直接贴进聊天的情况。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-proxy-list.png', alt: 'Webshare Proxy List：Proxy Address、Port、Username、Password 四列被红框圈出，截图已脱敏', caption: '图一 · 保存 IP、端口、用户名、密码与所用协议，示例已脱敏', width: 1091, height: 725 }
      ],
      bullets: [
        '左侧菜单 Static Residential → Proxy List（图一）。',
        '保存 Proxy Address（IP）、Port（端口）、Username（用户名）、Password（密码），并记下所选协议。',
        '核对 Authentication Method 为 Username/Password；连接方式按你实际购买的产品说明选择。',
        '文件只保存在自己能访问的位置，不放公开仓库或共享目录；使用结束后按需删除。'
      ],
      note: '本站不收集这些参数。能读取本机配置的 AI 助手仍可能将读取内容发送给其模型服务商，请先确认所用工具的数据处理方式。',
      button: '参数已保存在本机，继续'
    },
    {
      id: 'configure',
      phase: 2,
      kind: 'task',
      short: 'AI 配置提示词',
      title: '配置提示词：让 AI 接好住宅出口',
      intro: '把下面整段提示词复制给能读写本机文件的 AI 助手，将其中的文件路径换成你保存参数的位置。',
      coach: '这里只接入住宅出口；已有代理、订阅和规则尽量保留，修改前先备份。',
      html: '<p class="block"><span class="sticker">01 · 配置</span> Codex · Claude Code · WorkBuddy · ZCode</p><p>提示词 · 整段复制发给 AI</p>',
      agentPrompt: {
        title: '配置提示词',
        intro: '读取当前配置，备份后接入住宅出口，并核对加载与连通结果',
        text: `你是能读写本机文件的 AI 助手。我的电脑已有能正常工作的代理，请在这个基础上接入我购买的 Webshare 静态住宅 IP，给已有代理套一个稳定、静态、纯净的“马甲”，以固定住宅出口为目标。只处理这个增量任务。

【现有条件】
- 系统：Windows。
- 客户端：已安装并在用的 Clash Verge Rev，以本机实际版本为准。
- 已有代理可以正常工作，不需要购买新服务、安装客户端或导入新订阅。
- 住宅 IP 的协议、地址、端口、用户名和密码：从我指定的本机凭据文件读取。
- 凭据文件路径：<填写保存住宅 IP 凭据的本机文件路径>。

【配置要求】
1. 先确认实际安装版本、当前生效的配置和已有代理选择，查看该版本支持的配置方式，不猜文件位置或配置字段。
2. 修改前备份将要改动的文件，简要说明修改范围。保留现有订阅、规则、系统代理和 TUN 设置。
3. 住宅出口复用我现有的可用代理作为上游。按本机内核支持的方式建立引用关系，避免引用循环或意外直连；如使用 dialer-proxy，核对它指向的节点或代理组确实存在。
4. 优先使用持久生效的扩展配置或 Merge，不直接覆盖订阅本体，避免订阅更新后丢失。协议和端口按我提供的信息填写，不擅自换协议或猜端口。
5. 先验证配置能解析，再重载。加载失败就恢复备份，保留脱敏报错，不带着错误配置继续运行。
6. 在不改变其他应用访问方式的前提下，通过这条出口执行小范围连通性测试，核对实际出口是否与购买的住宅 IP 一致。无法测试就明确写“未验证”。

【凭据与边界】
只读取完成任务所需的配置文件。不要在回答、日志、命令历史、截图或 diff 中回显完整凭据；不要上传配置文件或把用户名、密码发给检测网站。出口查询服务会看到请求的出口 IP，只发送检测所需的普通请求。
不要关闭安全软件，也不要为试错批量修改 DNS、IPv6、MTU 或其他全局网络设置。检测分数不等于账号安全保证，不承诺永久稳定、纯净度或平台资格。
若路径还是占位符、缺少参数、当前客户端不支持，或你没有本机文件权限，先说明缺什么并停下，不要声称已配置成功，也不要另写一套手动安装教学。

【交付】
说明改了哪些文件、备份在哪里、配置是否成功加载、出口是否核对一致，以及尚未验证的事项。报告中的敏感内容全部脱敏。`,
        hint: '把本机凭据文件路径补全后再发送。提示词没有包含真实账号密码，但 AI 读取本机文件后的数据处理方式取决于你使用的工具和模型服务商。'
      },
      button: '配置完成，继续自查'
    },
    {
      id: 'self-check',
      phase: 2,
      kind: 'task',
      short: 'AI 自查提示词',
      title: '自查提示词：核对配置与实际出口',
      intro: '配置完成后，把这段提示词发给 AI 助手再核对一遍；有问题或结果不完整时也可以直接使用。',
      coach: '自查默认只读，每个结论都要有证据。没有测到的项目，必须写“未验证”。',
      html: '<p class="block"><span class="sticker">02 · 自查</span> Codex · Claude Code · WorkBuddy · ZCode</p><p>提示词 · 整段复制发给 AI</p>',
      agentPrompt: {
        title: '自查提示词',
        intro: '检查配置是否生效、引用是否正确、实际出口是否一致',
        text: `请对我已经配置好的“已有代理 + Webshare 静态住宅出口”做一次自查。默认只读检查，不修改配置、不切换代理、不关闭系统代理或 TUN，也不重启客户端。

【检查范围】
1. 确认本机实际客户端、内核版本与当前生效配置，区分“文件已保存”和“配置已加载”。只读取相关文件，不遍历无关目录。
2. 检查住宅出口的协议、地址、端口和认证字段是否齐全，是否与我在本机保存的信息一致；不要在报告中回显完整值。
3. 检查住宅出口是否正确引用现有代理或代理组，引用目标是否存在，是否有循环、失效引用或意外回落为直连。
4. 检查增量配置是否能在订阅更新后保留，原订阅与规则有没有被覆盖；使用客户端或内核实际支持的校验方式核对配置能否解析。
5. 在不改变现有网络设置的条件下，通过已配置的住宅出口发起少量普通请求，核对出口 IP、地区和 ASN。不能指定该出口测试、测试受限或结果不一致，都要明确说明，不用推断代替实测。
6. 根据已有日志或上述请求结果区分认证失败、上游连接失败、住宅出口失败和目标网站返回错误；没有证据的原因写“尚不能确定”。不要用关闭安全软件、修改全局网络设置或反复更换 IP 来试错。

【信息保护】
不要上传配置、订阅链接、用户名或密码。出口查询服务会看到请求的出口 IP；报告中的 IP、路径和其他敏感内容按需脱敏，认证信息完全隐藏。
不主动断开现有连接做故障模拟。只读证据不足时，列出需要另行确认的测试；修复操作等我明确要求后再做。

【结果格式】
按“检查项 / 通过、未通过或未验证 / 脱敏证据”逐项给出结果，再说明是否需要处理以及最小处理范围。纯净度分数只作为参考，不代表不会触发平台风控。没有执行的检查必须标为“未验证”，不能写“应该没问题”。`,
        hint: '这段提示词不要求直接填写凭据。AI 检查本机配置时仍可能读到账号密码；报告要脱敏，修复操作另行确认。'
      },
      button: '自查完成，继续检测'
    },
    {
      id: 'quality',
      phase: 3,
      kind: 'task',
      short: '检测住宅 IP 质量',
      title: '检测住宅 IP 质量',
      intro: '核对实际出口的地区、ASN 和 IP 类型，再参考检测网站的风险评分。下面是历史检测示例，每条 IP 的结果都可能不同。',
      coach: '先确认出口是否一致，再看评分。某个网站显示“住宅”或“推荐”，不代表其他平台一定认可。',
      links: [
        { label: '打开 IPPure 检测', url: 'https://ippure.com/' },
        { label: '打开 IPSuper 检测', url: 'https://ipsuper.com/' }
      ],
      images: [
        { src: '@embed-image:assets/ip-guide/ip-purity.png', alt: '历史 IP 质量检测示例：页面显示纯净度 100 分、风险项通过，截图已脱敏', caption: '图一 · 单次检测示例，分数不代表你会获得相同结果', width: 1091, height: 930 },
        { src: '@embed-image:assets/ip-guide/ip-before-after.png', alt: '历史 IP 检测对比：左侧机房 IP，右侧静态住宅 IP', caption: '图二 · 不同出口的检测对比，仅作参考', width: 1091, height: 940 }
      ],
      bullets: [
        '确认检测请求实际经过刚配置的住宅出口；出口不一致时，先用上一页的自查提示词核对。',
        '记录地区、ASN、IP 类型和检测时间；不同检测库可能给出不同标签。',
        '检测结果只用于了解出口质量，不用于判断平台资格，也不保证账号不会触发风控。'
      ],
      button: '已核对检测结果，继续'
    },
    {
      id: 'replace',
      phase: 3,
      kind: 'task',
      short: '按需更换 IP 与 ASN 参考',
      title: '质量不满意？按需更换 IP',
      intro: '先确认是出口 IP 本身的检测结果不合预期，再考虑 Replace。截图套餐包含 10 次替换；你能用几次、是否收费，以自己的后台为准。',
      coach: '可以按 ASN 挑选候选池，也可以按 Country 选美国。ASN 表只供参考，没有哪个编号能保证分数或可用性。',
      images: [
        { src: '@embed-image:assets/ip-guide/ip-replace-actions.png', alt: 'Webshare Proxy List：每行 Actions 列的三个点菜单被红圈圈出，截图已脱敏', caption: '图一 · Proxy List 行尾点「⋮」打开操作菜单', width: 1888, height: 931 },
        { src: '@embed-image:assets/ip-guide/ip-replace-menu.png', alt: '操作菜单：Replace Proxy 被红圈圈出', caption: '图二 · 菜单里点「Replace Proxy」', width: 1887, height: 917 },
        { src: '@embed-image:assets/ip-guide/ip-replace-asn.png', alt: 'Replace a single proxy 页：Replace with 勾选 ASN、Select ASN 填 20115，下拉显示运营商和可用数量，截图已脱敏', caption: '图三 · 按 ASN 选择：输入编号后核对运营商和 available 数量', width: 1409, height: 769 },
        { src: '@embed-image:assets/ip-guide/ip-replace-country.png', alt: 'Replace a single proxy 页：Replace with 选 Country 并填 United States', caption: '图四 · 备选：按 Country 选择 United States', width: 1887, height: 937 }
      ],
      bullets: [
        'Proxy List 每行行尾点「⋮」（图一），菜单里选「Replace Proxy」（图二）。',
        '按 ASN 选择时，勾「ASN」并填编号（图三）；以官方下拉中能搜到且有 available 数量的候选为准。',
        '也可以按 Country 选择 United States（图四），再核对将要替换的地区和数量。',
        '核对 Removing、Adding、剩余替换次数及可能产生的费用，再决定是否点 Replace。',
        '替换后更新本机参数文件，重新使用“配置提示词”和“自查提示词”，然后复测；新 IP 的检测结果仍可能不合预期。'
      ],
      html: `<div class="block faqs"><details>
        <summary>美国 ASN 参考（点开查看）<span class="sticker">12 个 ASN</span></summary>
        <p>用来理解候选池归属，实际可用数量与标签以官方下拉和检测结果为准。</p>
        <h3>大型宽带运营商</h3>
        <div class="facts">
          <div class="fact"><strong>AS7015 · Comcast（Xfinity）</strong><span>Comcast / Xfinity 相关网络。</span></div>
          <div class="fact"><strong>AS7922 · Comcast（Xfinity）</strong><span>Comcast 相关宽带网络。</span></div>
          <div class="fact"><strong>AS7018 · AT&T</strong><span>AT&T 相关网络。</span></div>
          <div class="fact"><strong>AS10796 · Charter / Spectrum</strong><span>Charter / Spectrum 相关网络。</span></div>
          <div class="fact"><strong>AS11427 · Charter / Spectrum</strong><span>Charter / Spectrum 相关网络。</span></div>
          <div class="fact"><strong>AS20001 · Charter / Spectrum</strong><span>原 Time Warner Cable 相关网络。</span></div>
          <div class="fact"><strong>AS20115 · Charter / Spectrum</strong><span>图三下拉中的示例 ASN。</span></div>
          <div class="fact"><strong>AS22773 · Cox Communications</strong><span>Cox 相关网络。</span></div>
        </div>
        <h3>区域性或其他 ISP</h3>
        <div class="facts">
          <div class="fact"><strong>AS6079 · RCN / Astound Broadband</strong><span>区域性宽带相关网络。</span></div>
          <div class="fact"><strong>AS11404 · Wave Broadband / Astound</strong><span>区域性宽带相关网络。</span></div>
          <div class="fact"><strong>AS20012 · Interworks Networking Services</strong><span>ISP 网络；具体 IP 属性仍需检测。</span></div>
          <div class="fact"><strong>AS20112 · T3 Communications</strong><span>固定线路 ISP 相关网络。</span></div>
        </div>
        <p>清单不保证当前归属、库存或检测结果；不要为了追求某个分数反复付费替换。</p>
      </details></div>`,
      note: '连不上或不稳定时先自查配置与连接证据，不能仅凭症状认定要更换 IP。',
      button: '已了解更换方式，继续'
    },
    {
      id: 'checks',
      phase: 3,
      kind: 'checks',
      gate: true,
      short: '完成前四项核对',
      title: '完成前，再核对一下',
      intro: '确认参数保管、配置结果与续费规则，之后需要复查时可以返回前面的提示词页。',
      coach: '只确认自己实际核对过的项目，不把 AI 的一句“好了”当成测试结果。',
      checks: [
        '我已妥善保存住宅 IP 凭据，没有公开分享账号密码。',
        '我已查看配置与自查结果，知道哪些项目通过、哪些仍未验证。',
        '我理解静态住宅出口和检测分数不能保证平台资格或账号安全。',
        '我清楚套餐可能自动续费，不需要时会在 Webshare 后台取消。'
      ],
      button: '确认完成'
    },
    {
      id: 'done',
      phase: 3,
      kind: 'done',
      short: '住宅出口准备完成',
      title: '住宅出口准备完成',
      intro: '住宅 IP 参数、AI 配置与自查提示词、质量检测和续费事项已经整理好。实际生效情况以你自己的自查结果为准。',
      coach: '保留好备份与自查结果。以后更换参数，仍然先配置、再自查。',
      doneGroups: [{ title: '', items: ['稳定、静态、纯净是这个“马甲”的目标；连接表现、IP 标签和目标平台规则都会变化。'] }],
      seeAlso: [{ title: '返回免费教程导航', url: 'https://map.plus-guide.fun/' }]
    }
  ]
};

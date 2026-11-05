window.AI_GUIDE = {
  index: '28',
  slug: 'google-account',
  title: '谷歌账号注册',
  subtitle: '选电脑网页或手机 Gmail，一步一步注册',
  progressVersion: 2,
  legacyStepMap: [0, 2, 7, 8, 9, 10, 11, 12],
  legacyAnswers: { 1: 'web' },
  phases: [
    { title: '开始注册', copy: '选择电脑网页或手机 Gmail 入口' },
    { title: '填写资料', copy: '姓名、基本信息、邮箱与密码' },
    { title: '验证与检查', copy: '按提示验证，再核对账号' }
  ],
  inputs: [],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '开始前准备',
      title: '先准备好，再选一种注册方式',
      intro: '这篇只讲创建自己的 Google 个人账号。你可以用电脑网页，也可以从手机 Gmail App 进入注册。已有可正常登录的个人账号，通常不必重新注册。',
      facts: [
        ['需要准备', '能正常打开 Google 页面的设备、可接收验证提示的手机，以及安全保存密码的位置'],
        ['手机注册', '可以从 Gmail App 进入，但不保证免手机号或免验证；界面会随系统和版本变化'],
        ['账号地区', '注册完成不等于账号关联到某个国家，也不等于获得学生优惠资格'],
        ['资料与密码', '只在 Google 官方页面填写；本教程不收集姓名、密码、手机号或验证码']
      ],
      note: 'Google 官方说明：为防止滥用，创建或登录账号时有时需要电话验证。截图是操作参考，不是免验证承诺。',
      links: [{ label: 'Google 官方：账号验证说明', url: 'https://support.google.com/accounts/answer/114129?hl=zh-Hans' }],
      coach: '先选方便操作的设备。遇到验证时，按自己的页面提示完成。',
      button: '准备好了，选择注册方式'
    },
    {
      phase: 0,
      kind: 'choice',
      short: '选择注册方式',
      title: '你准备从哪里开始注册？',
      intro: '两条路线都会回到 Google 的账号创建流程。选你手边方便使用的设备，不需要把两种方式都做一遍。',
      choices: [
        { value: 'web', title: '电脑网页注册', copy: '打开 Google 官方注册页，填写资料；出现扫码提示时，再用手机确认。', icon: 'globe', next: 2 },
        { value: 'gmail', title: '手机 Gmail App 注册', copy: '安装官方 Gmail，依次找到添加账号和创建账号；配图按原帖拆成小步骤。', icon: 'mail', next: 3 }
      ],
      coach: '手机路线也可能要求短信验证，按当前提示继续。'
    },
    {
      phase: 0,
      kind: 'task',
      short: '网页创建账号',
      title: '打开 Google 官方入口，选择个人用途',
      intro: '打开 Google 账号页面。需要创建新账号时，选择“创建账号”，再选“个人用途”；已经进入注册表单的，按表单继续。',
      links: [{ label: 'Google 账号官方注册入口', url: 'https://accounts.google.com/signup' }],
      images: [{ src: '@embed-image:assets/gemini-student/02-create-account.webp', alt: 'Google 登录页面中的创建账号和个人用途选项', caption: '电脑网页路线：创建账号，选择“个人用途”。' }],
      coach: '核对地址栏属于 accounts.google.com，再填写资料。',
      button: '已进入个人账号注册',
      next: 7
    },
    {
      phase: 0,
      kind: 'task',
      short: '准备 Gmail App',
      title: '先打开手机上的官方 Gmail App',
      intro: '手机已经装好 Gmail，就直接打开。还没有安装的，从对应应用商店下载，核对开发者为 Google；不需要为了这个步骤购买新的 Google 账号。',
      links: [
        { label: 'Android：Gmail 官方应用', url: 'https://play.google.com/store/apps/details?id=com.google.android.gm' },
        { label: 'iPhone / iPad：Gmail 官方应用', url: 'https://apps.apple.com/app/gmail-email-by-google/id422689480' }
      ],
      bullets: [
        '打开 Gmail，找到右上角的账号头像。',
        '第一次打开、还没有账号时，先找“登录”或“添加账号”入口。',
        '商店或设备不支持安装时，可以返回上一步，选择电脑网页路线。'
      ],
      note: '这条手机路线参考雪踏乌云 @Pluvio9yte 的帖子，配图为原帖四联图裁剪。原图展示 iPhone 界面；Android 的入口位置与按钮文字可能略有不同。',
      seeAlso: [{ title: '原帖与配图来源', url: 'https://x.com/Pluvio9yte/status/2116382365404852227', why: '本文按操作顺序重新整理，并将原图拆成步骤参考；不沿用原帖“无需手机验证码”的保证。', icon: 'book' }],
      coach: '先打开官方 Gmail。已经停在“设置电子邮件”页面的，后面选择 Google 即可。',
      button: 'Gmail 已打开'
    },
    {
      phase: 0,
      kind: 'task',
      short: '添加其他账号',
      title: '点右上角头像，再点“添加其他账号”',
      intro: '在 Gmail 里点右上角的账号头像，展开账号面板，找到带加号的“添加其他账号”。已经有账号登录也可以添加，不用先退出原账号。',
      bullets: [
        '点 Gmail 右上角的头像，打开账号面板。',
        '找到“添加其他账号”，点一下。',
        '如果第一次打开就显示“添加账号”或“登录”，从这个入口继续即可。'
      ],
      images: [{ src: '@embed-image:assets/google-account/01-gmail-add-account.webp', alt: 'Gmail 账号面板中的添加其他账号按钮', caption: '原帖图 1 局部：点“添加其他账号”；已裁去原账号列表。' }],
      coach: '这里添加的是新账号入口，不是管理或删除已有账号。',
      button: '已打开添加账号'
    },
    {
      phase: 0,
      kind: 'task',
      short: '选择 Google',
      title: '在“设置电子邮件”里选择 Google',
      intro: '看到 Google、iCloud、Outlook 等邮件服务列表后，点 Google，进入 Google 自己的登录和创建账号页面。',
      images: [{ src: '@embed-image:assets/google-account/02-gmail-google.webp', layout: 'phone', alt: 'Gmail 设置电子邮件页面中的 Google 选项', caption: '原帖图 2 裁剪：选列表第一项 Google。' }],
      links: [{ label: 'Gmail 官方：添加其他邮件账号', url: 'https://support.google.com/mail/answer/6078445?hl=zh-Hans' }],
      coach: '要创建 Google 账号，就选 Google，不选“其他（IMAP）”。',
      button: '已进入 Google 页面'
    },
    {
      phase: 0,
      kind: 'task',
      short: '手机创建账号',
      title: '在登录页点“创建账号”',
      intro: '确认页面属于 accounts.google.com，在登录表单下方找到“创建账号”。如果接着要求选择账号用途，选“个人用途”或“为我自己创建”。',
      bullets: [
        '在 Google 登录页找到“创建账号”，原图中位于左下方。',
        '出现用途选项时，选择个人使用。',
        '进入填写姓名的页面后，再点本教程的下一步。'
      ],
      images: [{ src: '@embed-image:assets/google-account/03-gmail-create-account.webp', layout: 'phone', alt: 'Gmail 内的 Google 登录页面左下方创建账号按钮', caption: '原帖图 3 裁剪：点“创建账号”，进入新账号表单。' }],
      coach: '这里创建自己的个人账号；不要在登录输入框里随意填写别人的邮箱。',
      button: '已看到姓名表单'
    },
    {
      phase: 1,
      kind: 'task',
      short: '填写姓名',
      title: '按页面填写姓名',
      intro: '电脑和手机路线到这里开始填写同一类账号资料。按 Google 当前表单填写自己的姓名，核对后点“下一步”；标为选填的字段按实际情况处理。',
      images: [
        { src: '@embed-image:assets/google-account/04-gmail-name.webp', layout: 'phone', alt: '手机 Gmail 注册中的 Google 姓名输入表单', caption: '手机参考：原帖图 4 裁剪，填写姓名后点“下一步”。' },
        { src: '@embed-image:assets/gemini-student/03-name.webp', alt: '电脑网页注册中的 Google 姓名输入表单', caption: '电脑参考：界面布局不同，填写的仍是姓名。' }
      ],
      coach: '只需参考自己设备对应的截图，不必把两张图都操作一遍。',
      button: '姓名已填写'
    },
    {
      phase: 1,
      kind: 'task',
      short: '填写基本信息',
      title: '填写生日和性别',
      intro: '按自己的情况填写生日和性别，再点“下一步”。账号年龄会影响部分服务和功能的使用资格。',
      images: [{ src: '@embed-image:assets/gemini-student/04-birthday.webp', alt: 'Google 注册页面的生日和性别字段', caption: '填写自己的生日和性别；手机与电脑的字段布局可能不同。' }],
      coach: '注册账号本身不会赋予学生等服务资格，后续仍要按对应服务要求核对。',
      button: '基本信息已填写'
    },
    {
      phase: 1,
      kind: 'task',
      short: '设置邮箱与密码',
      title: '选择 Gmail 地址，再设置密码',
      intro: '选择系统推荐的 Gmail 地址，或者点“创建您自己的 Gmail 邮箱”设置用户名。接着按页面要求创建密码，并安全保存。',
      images: [{ src: '@embed-image:assets/gemini-student/05-gmail.webp', alt: '选择或创建自己的 Gmail 邮箱地址', caption: '选择邮箱地址，也可以自己设置 Gmail 用户名。' }],
      bullets: [
        '用户名不可用时，按页面提示换一个，不要误把提示当成注册已经完成。',
        '为这个账号设置独立密码，保存在自己的密码管理器等安全位置。',
        '记下完整邮箱地址；后续登录 Gemini 或其他 Google 服务时，核对使用的是同一个账号。'
      ],
      coach: '密码和验证码只填在 Google 官方页面，不要发给他人。',
      button: '邮箱与密码已设置'
    },
    {
      phase: 2,
      kind: 'task',
      short: '按提示完成验证',
      title: '看自己的页面：按要求验证，再确认条款',
      intro: '手机 Gmail 路线和电脑路线都可能要求验证。按你当前看到的提示操作；没有出现某种验证，就不必为了对齐截图额外触发。',
      facts: [
        ['手机没有要求验证', '继续核对账号资料、条款和账号创建结果，不代表以后登录都免验证'],
        ['要求短信或电话', '用自己能正常接收验证的号码，核对国家代码，再按官方提示完成'],
        ['电脑出现二维码', '扫描自己电脑当前显示的二维码，在手机核对是本人操作后确认']
      ],
      bullets: [
        '先看当前页面属于哪种情况，不要照着截图寻找本来没有出现的按钮。',
        '电脑扫码时，核对设备、位置和时间，确认是本人发起，再点“Yes, continue”。',
        '出现号码限制或收不到验证码时，按 Google 帮助处理；需要时稍后再试。',
        '完成当前要求的验证后，阅读剩余提示与条款，直到账号创建完成。'
      ],
      images: [
        { src: '@embed-image:assets/gemini-student/06-desktop-qr.webp', alt: '电脑上要求用手机扫描二维码完成 Google 注册验证', caption: '仅电脑扫码流程参考：扫描自己电脑当前显示的二维码。手机没有此提示时，无需另外找电脑扫码。' },
        { src: '@embed-image:assets/gemini-student/07-phone-confirm.webp', alt: '手机上的 Google 验证确认页面和 Yes continue 按钮', caption: '仅扫码后的手机确认参考：核对是本人操作，再继续。' }
      ],
      note: '原电脑案例使用 +86 联通号码验证通过，但不代表所有号码都能通过。Gmail App 也不能保证跳过手机验证；是否要求验证、是否接受号码，以 Google 实际提示为准。',
      links: [{ label: 'Google 官方：验证问题与号码提示', url: 'https://support.google.com/accounts/answer/114129?hl=zh-Hans' }],
      coach: '不要扫描别人发来的注册二维码，也不要把自己的验证码转交给别人。',
      button: '要求的验证和条款已完成'
    },
    {
      phase: 2,
      kind: 'checks',
      short: '确认注册结果',
      title: '确认账号已经创建完成',
      intro: 'Google 页面显示账号创建完成后，检查登录和找回方式。这张清单记录的是你自己核对的结果。',
      checks: [
        '我能在 Google 官方页面登录，并确认完整邮箱地址',
        '密码已经安全保存，不需要依靠聊天记录找回',
        '注册要求的验证和条款确认已经完成',
        '我知道账号注册、账号关联地区和学生优惠资格是不同的事情'
      ],
      seeAlso: [{ title: 'Google 账号管理', url: 'https://myaccount.google.com/', why: '按自己的情况添加恢复邮箱、恢复手机号和两步验证。', icon: 'lock' }],
      tip: '进入账号安全设置，按自己的情况添加恢复邮箱、恢复手机号和两步验证，方便日后找回账号。',
      coach: '只有自己能正常登录，才算注册结果确认完成。',
      button: '已全部确认'
    },
    {
      phase: 2,
      kind: 'done',
      short: '完成与问答',
      title: '谷歌账号注册完成',
      intro: '后续使用 Google 服务时，先核对当前登录邮箱。需要改区或了解 Gemini 学生优惠，再打开对应的独立教程。',
      seeAlso: [
        { title: '谷歌账号改区', url: './21-google-region.html', why: '需要更正账号关联地区时，查看单独的表单与结果核对流程。', icon: 'globe' },
        { title: 'Gemini 学生优惠领取', url: './20-gemini-student.html#account-ready', why: '已有账号后，从账号准备继续检查优惠资格。', icon: 'spark' },
        { title: '全部免费教程', url: '../', why: '回到目录，选择下一篇。', icon: 'grid' }
      ],
      faqGroups: [
        { label: '注册与验证', items: [
          { q: '已有 Google 账号，还需要重新注册吗？', a: '通常不需要。先确认原账号能正常登录，并满足你要使用的服务要求。不要把重新注册当成取得优惠资格的保证。' },
          { q: '从 Gmail App 注册，一定不用手机号吗？', a: '不能保证。原帖分享的是一条手机注册入口，不代表所有设备和账号都免验证。Google 官方说明，创建或登录账号时有时需要电话验证；即使注册时没要求，之后也可能再次核验。' },
          { q: '没有“添加其他账号”，或界面和配图不同，怎么办？', a: '第一次打开 Gmail 时，入口可能是“登录”或“添加账号”；已有账号时通常在右上角头像菜单。选 Google，再找“创建账号”。截图是 iPhone 界面，Android、不同语言和版本的按钮可能不同。' },
          { q: '+86 手机号一定能验证吗？', a: '不能保证。原案例有 +86 联通号码验证通过的记录，但 Google 会根据当前流程决定是否接受号码或要求其他验证，以页面提示为准。' },
          { q: '没有出现扫码页面，流程错了吗？', a: '不一定。手机路线可能直接进入后续表单，电脑也可能显示短信或其他验证方式。按自己的官方页面提示继续，不需要强行找到与截图相同的页面。' },
          { q: '注册完成就有 Gemini 学生优惠吗？', a: '没有。账号创建、关联地区和优惠资格需要分别确认。学生优惠还需符合当期活动要求，并完成相应身份验证。' }
        ] }
      ]
    }
  ]
};

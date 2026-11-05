window.AI_GUIDE = {
  index: '11',
  slug: 'grok-orca',
  title: 'Grok Bot 云电脑运行 Claude Code',
  subtitle: '电脑和手机接着用同一个会话',
  phases: [
    { title: '准备', copy: '确认使用条件与云电脑设置' },
    { title: '连通设备', copy: 'Tailscale 与访问控制' },
    { title: '准备 Claude', copy: '安装、账号与授权' },
    { title: '安装 Orca', copy: '服务、防火墙与恢复' },
    { title: '配对使用', copy: '电脑、手机与任务验收' },
    { title: '维护', copy: '更新恢复与常见问题' }
  ],
  inputs: [],
  steps: [
    {
      phase: 0,
      kind: 'info',
      short: '先看搭好是什么样',
      title: '合上电脑以后，让任务继续在云端跑',
      intro: 'Claude Code 安装在 Grok Bot 的云电脑上。你的电脑和手机通过 Tailscale 接入 Orca，查看和操作云端的项目与会话。Grok Bot 也可以通过 Orca 命令查看任务进度。',
      facts: [
        ['需要准备', '能使用云电脑功能的 Grok Bot 账号、Tailscale 账号、Orca 客户端，以及符合服务使用条件的 Claude Code 账号'],
        ['先讲清楚', 'Grok 订阅与 Claude Code 的使用资格分别计算；套餐和可用功能以各自平台为准'],
        ['稳定性', 'Orca Remote Server 仍属实验功能。Grok Bot 更新可能中断后台任务，自动恢复不能保证任务继续执行'],
        ['内容来源', '根据 Asa（@app_sail）2026 年 10 月 9 日的文章重新整理，命令参考官方文档；本教材未在你的 Grok 云电脑上实机部署']
      ],
      images: [{ src: '@embed-image:assets/grok-orca-architecture.svg', alt: '电脑、手机、Tailscale 与云端 Orca 的连接关系', caption: '连接示意图。Claude Code 和项目留在云端，设备通过 Tailscale 访问 Orca。' }],
      links: [{ label: '查看原作者文章', url: 'https://x.com/app_sail/status/2108523630900748335' }, { label: 'Orca 官方远程服务器说明', url: 'https://www.onorca.dev/docs/remote-servers' }],
      warn: '云电脑所在地不能代替用户的地区资格；先确认 Anthropic 的支持地区与服务条款。此教程不承诺防封号，也不承诺全天候不中断。',
      coach: '每一页先看自己要做什么，再把提示词交给 Grok Bot。账号、付款与设备配对由你本人完成。',
      button: '开始准备'
    },
    {
      phase: 0,
      kind: 'checks',
      short: '准备清单',
      title: '先确认这些条件',
      intro: '这篇按 Grok Bot 的 Linux 云电脑来写。已有 VPS 的读者可以参考连接思路，但不要直接照搬这里的沙箱恢复脚本。',
      checks: [
        '我能打开 Grok Bot 的云电脑，允许在里面安装开发工具',
        '我已确认自己满足 Anthropic 的地区与服务使用要求',
        '我准备好了可用的 Claude Code 账号或准备自行开通相应方案',
        '我能在自己的电脑安装 Tailscale 和 Orca，并管理 Tailscale 访问策略',
        '我知道 Grok Bot 更新可能打断任务，重要项目需要另行备份'
      ],
      coach: '准备清单全部确认后再往下走，避免安装到一半才发现没有云电脑或账号资格。',
      button: '都已确认'
    },
    {
      phase: 0,
      kind: 'task',
      short: '检查云电脑设置',
      title: '在 Grok Bot 里检查时区与网络设置',
      intro: '先让 Bot 报告当前环境，再打开设置。原作者使用美国东部时区，这只是其机器的情况，你应按自己的云电脑位置设置。',
      links: [
        { label: 'Niva · 稳定、快（有谷歌邮箱用这家）', url: 'https://niva.page/register?invite_code=qxYarFgs' },
        { label: 'btcr · 没有谷歌邮箱 / 移动用户可用', url: 'https://go.btcr.cc/i/roxy123' },
        { label: '低门槛机场 · 备用选择', url: 'https://go.btcr.cc/i/roxy123' }
      ],
      bullets: [
        '自己的设备访问 Grok、下载客户端或完成授权时，如果需要机场，可以选上面三家。有谷歌邮箱用 Niva，稳定、快——注册页要先开梯子访问；移动的用户不要买 Niva！没有谷歌邮箱、或者运营商是移动的，用 btcr：它有菲律宾的节点，需要买套餐。另一家门槛低，稳定性可能比 Niva 稍差。这里只准备本机网络，云电脑仍按直接出网配置。',
        '打开 Grok Bot 设置中的 General → Timezone，选择符合这台云电脑实际位置的时区。',
        '如果设置里有让云电脑经本机转发网络的开关，确认是否启用。本教程按云电脑直接出网来写。',
        '已经运行的程序可能需要重新启动才使用新时区；不要为此直接结束正在执行的任务。'
      ],
      agentPrompt: { title: '复制给 Grok Bot：只检查环境', text: '先只读检查这台云电脑：系统与架构、当前用户和 home、date 输出、是否有免密 sudo、是否有 systemd、是否有 tailscale0、6768 是否占用。只汇报检查结论，不安装、不改设置、不重启进程。不要输出密钥、登录状态文件或配对链接。发现环境不是 Linux 或用户不是 box 时说明差异。', hint: '当前用户或目录与原文不同，后面安装前先确认。' },
      note: '原文关于 8 核、16 GB、更新方式和 home 保留的描述来自作者当时的环境，不能当成所有账号的配置承诺。',
      coach: '时区用实际值，示例中的 America/New_York 不需要照抄。',
      button: '设置已核对'
    },
    {
      phase: 1,
      kind: 'task',
      short: '添加 Tailscale Bot',
      title: '添加 Tailscale Bot，并亲自完成授权',
      intro: '原作者提供了一个负责安装与恢复 Tailscale 的共享 Bot。添加后先阅读它申请的权限，确认安装计划，再在自己的浏览器完成 Tailscale 授权。',
      links: [{ label: '原作者的 SSH to Grok via Tailscale Bot', url: 'https://x.ai/bot/BrViAOWzDSiAjBLqUnBgA' }, { label: 'Tailscale 官方下载', url: 'https://tailscale.com/download' }, { label: 'Tailscale SSH 官方说明', url: 'https://tailscale.com/kb/1193/tailscale-ssh' }],
      bullets: [
        '打开共享 Bot 链接，选择 Add to Grok Bot。它属于第三方共享内容，先检查说明与权限。',
        '让它检查已有安装和节点，再给出安装计划。授权链接由你本人打开并确认。',
        '电脑安装 Tailscale，登录同一个 tailnet；手机需要接入时也这样做。',
        '记下后台显示的真实机器名，可能是 grok-bot，也可能带后缀。旧节点先确认归属与用途，不要为了去掉后缀直接删除。'
      ],
      agentPrompt: { title: '复制给 Tailscale Bot', text: '先检查这台云电脑是否已有 Tailscale、现有节点名和访问策略。向我说明你会修改哪些位置，以及更新后的恢复方式；改开机脚本前保存备份。安装后给我授权入口和最小权限策略的建议，由我本人确认。不要读取或贴出 tailscaled.state、SSH 私钥、其他 Bot 的凭据。完成后只汇报连接、SSH 与恢复任务是否就绪。', hint: '共享 Bot 的实现可能变化，不能假设添加后恢复任务必然已建好。' },
      coach: '把真实节点名记下来，后面的 Orca 配对地址要与它一致。',
      button: '授权完成，继续设置访问规则'
    },
    {
      phase: 1,
      kind: 'task',
      short: '限制访问并测试',
      title: '只让你的设备访问这台云电脑',
      intro: '加入同一个 tailnet 后，还要检查访问策略。Tailscale 的网络规则和 SSH 规则分别控制网络访问与系统用户登录。',
      links: [{ label: '打开 Tailscale 管理后台', url: 'https://login.tailscale.com/admin/machines' }, { label: '访问控制说明', url: 'https://tailscale.com/kb/1018/acls' }, { label: 'MagicDNS 说明', url: 'https://tailscale.com/kb/1081/magicdns' }],
      bullets: [
        '先备份后台现有策略，再按自己的设备或身份限定目标主机的 TCP 6768 和需要的 SSH 访问。保留其他设备原有用途。',
        'Tailscale SSH 只允许需要的系统用户，例如 box。不要默认开放 root，也不要让云端 agent 任意访问家里或公司的其他设备。',
        '电脑和手机开启 Tailscale 的 DNS 设置，确认能解析真实机器名。',
        '在自己的电脑执行下面的测试；节点名不同时替换 grok-bot。SSH 提示不一致时，先检查登录方式和策略。'
      ],
      code: [{ lang: 'bash', caption: '在你的电脑执行，使用真实节点名', text: 'tailscale ping grok-bot\nssh box@grok-bot' }],
      warn: 'Tailscale 策略只控制 tailnet 内的访问，不能阻止公网绕过 Tailscale 访问 Orca。公网端口保护会在安装 Orca 时另行检查。',
      coach: 'ping 和 SSH 都通了再装 Orca，后面连接问题会容易定位。',
      button: '连通性与访问规则已确认'
    },
    {
      phase: 2,
      kind: 'task',
      short: '安装 Claude Code',
      title: '让 Grok Bot 在云电脑安装 Claude Code',
      intro: '使用官方原生安装方式。先检查是否已经安装，避免覆盖现有环境。此时只装程序，登录另做一步。',
      links: [{ label: 'Claude Code 官方安装说明', url: 'https://code.claude.com/docs/en/setup' }],
      code: [{ lang: 'bash', caption: '官方安装命令，在云电脑执行', text: 'curl -fsSL https://claude.ai/install.sh | bash\nexport PATH="$HOME/.local/bin:$PATH"\nclaude --version' }],
      agentPrompt: { title: '复制给 Grok Bot', text: '先检查 command -v claude 和 claude --version。未安装时，阅读 https://code.claude.com/docs/en/setup 后用官方原生安装方式安装。确认 ~/.local/bin 在当前终端和登录终端 PATH 中，修改 profile 或 bashrc 前先备份且不要重复添加。完成后只告诉我安装路径和版本，不替我登录。', hint: '不要把自己电脑上的安装结果当成云电脑已安装。' },
      coach: '能打印版本号，说明程序已安装；它还需要云电脑自己的授权。',
      button: '版本号已确认'
    },
    {
      phase: 2,
      kind: 'task',
      short: '本人完成账号授权',
      title: '接管云电脑，完成 Claude 账号与 CLI 登录',
      intro: '本篇走 claude.ai 订阅登录。已有可用账号可以直接登录；新账号、订阅和付款都由你自己操作。Console/API 是另一种计费路径，不要混用。',
      links: [{ label: 'Claude 登录入口', url: 'https://claude.ai/' }, { label: 'Claude Code 认证说明', url: 'https://code.claude.com/docs/en/authentication' }, { label: 'Anthropic 支持地区', url: 'https://www.anthropic.com/supported-countries' }],
      bullets: [
        '让 Grok Bot 在云电脑浏览器打开 Claude，接管电脑后自己填邮箱、验证码和必要的账号资料。',
        '如果需要订阅，确认方案支持 Claude Code，价格和额度以付款页为准。姓名、地址与支付资料填写真实有效的信息。',
        '在云电脑运行 claude auth login；如果当前版本提示不同，参考 claude auth --help 或首次运行 claude 的指引。',
        '本人打开授权页并完成授权；需要粘贴登录码时只粘回云电脑的终端。',
        '最后运行 claude auth status，在云电脑本地核对已登录及所用方案。'
      ],
      agentPrompt: { title: '复制给 Grok Bot', text: '在这台云电脑打开 Claude 官方登录页面并把控制权交给我。注册、验证码、订阅和付款都等我本人完成。然后在云电脑终端运行 claude auth login，把授权页面在云电脑浏览器打开，再交给我完成。不要要求我把密码、验证码、登录码或银行卡发到聊天中。完成后检查 auth status，只汇报是否登录及登录类型，不贴令牌或凭据。', hint: '原帖建议先“养号”没有可靠保证，本教程不把它作为步骤。' },
      note: '不要把“接管电脑”理解为平台或 agent 绝对看不到敏感输入。只在可信环境操作，并自行评估把登录凭据留在第三方云电脑的风险。',
      coach: '账号能用和程序装好是两件事，这一页把云电脑的登录也做完。',
      button: '云电脑上的 Claude 已登录'
    },
    {
      phase: 3,
      kind: 'task',
      short: '下载 Orca',
      title: '下载与你的云电脑架构对应的 Orca',
      intro: '把官方 AppImage 放在 ~/.orca 下，再解包运行。这样不依赖 FUSE 挂载；数据保留情况仍以 Grok 平台为准。',
      links: [{ label: 'Orca 官方 Release', url: 'https://github.com/stablyai/orca/releases/latest' }],
      code: [{ lang: 'bash', caption: '在云电脑执行；已有文件先备份', text: 'mkdir -p "$HOME/.orca" "$HOME/orca-setup"\ncase "$(uname -m)" in\n  x86_64|amd64) asset=orca-linux.AppImage ;;\n  aarch64|arm64) asset=orca-linux-arm64.AppImage ;;\n  *) printf "不支持的架构\\n" >&2; exit 1 ;;\nesac\nif [ -f "$HOME/.orca/orca-linux.AppImage" ]; then\n  cp -p "$HOME/.orca/orca-linux.AppImage" "$HOME/.orca/orca-linux.AppImage.bak-$(date +%Y%m%d%H%M%S)"\nfi\ntmp=$(mktemp "$HOME/.orca/download.XXXXXX") || exit 1\nif curl -fL --proto "=https" --proto-redir "=https" -o "$tmp" "https://github.com/stablyai/orca/releases/latest/download/$asset"; then\n  chmod 700 "$tmp" && mv -f "$tmp" "$HOME/.orca/orca-linux.AppImage"\nelse\n  rm -f "$tmp"\n  printf "下载失败，原安装包未替换\\n" >&2\n  exit 1\nfi' }],
      warn: '先下载，不要直接运行 orca serve。下一页确认防火墙，避免把 6768 暴露到公网。',
      coach: 'x86 和 ARM 的文件不同，下载命令会根据 uname -m 选择。',
      button: 'AppImage 已下载'
    },
    {
      phase: 3,
      kind: 'task',
      short: '先保护端口',
      title: '确认防火墙可用，再准备启动服务',
      intro: 'Orca 的 --pairing-address 只改变配对地址，服务仍可能监听所有网卡。本教材的启动脚本要求免密 sudo、内核 tailscale0，以及可检查的 IPv4/IPv6 防火墙。',
      bullets: [
        '让 Bot 只读检查 sudo -n true、ip link show tailscale0、iptables 与 ip6tables。',
        '缺少 iptables 时，由 Bot 先说明安装依赖的计划，再安装；不要因此清空已有防火墙。',
        '下一页的脚本建立专用 ORCA_TAILNET 链，只放行 lo 和 tailscale0，其他进入 6768 的连接丢弃。',
        '如果不具备这些条件，停在这里。不要关掉检查继续启动；VPS 应单独按其防火墙和 systemd 方案部署。'
      ],
      agentPrompt: { title: '复制给 Grok Bot：检查启动条件', text: '只读检查免密 sudo、内核 tailscale0、iptables 和 ip6tables 的 INPUT 链、6768 的监听与现有防火墙。不要输出凭据。如果缺防火墙工具，先说明需要安装哪些依赖；不要清空防火墙，不要开放公网 6768。条件不符就报告差异，不修改教程脚本绕过检查。只有确认可以让 6768 仅接受 lo 与 tailscale0 入站时才进入下一步。' },
      coach: '没有 sudo 或只有用户态代理的环境，不适用本教材这套启动脚本。',
      button: '启动条件已满足'
    },
    {
      phase: 3,
      kind: 'task',
      short: '保存启动脚本',
      title: '把启动脚本保存到云电脑',
      intro: '先复制下面整段脚本，交给 Grok Bot 保存为 ~/.orca/orca-serve.sh。现有同名文件先备份；ADDR=grok-bot 改成 Tailscale 后台的真实机器名。',
      code: [{ lang: 'bash', caption: '保存为 ~/.orca/orca-serve.sh，保留全部换行', text: '@embed-text:_src/grok-orca/orca-serve.sh', note: '根据原作者思路改写的适配脚本；不是原作者原样脚本，也未在 Grok 沙箱实机验证。安装前应检查。' }],
      bullets: [
        '保存后执行 chmod 700 ~/.orca/orca-serve.sh，再运行 bash -n ~/.orca/orca-serve.sh 检查语法。',
        '运行 ~/.orca/orca-serve.sh。成功时只输出监听与日志位置，不直接公开配对凭据。',
        '脚本发现端口已有监听时不会重启现有进程；需要确认它确实是你的 Orca 服务。',
        '防火墙检查失败时脚本停止启动。已在运行的服务不会被强制结束，需要另行检查其暴露情况。',
        '让 Grok Bot 创建 Auto-start Orca 任务，每 10 分钟运行脚本；创建后检查任务列表，不能只相信聊天中的“已完成”。'
      ],
      warn: '不要使用 pkill -f orca。需要重启时先确认没有重要任务，再使用本脚本的显式重启参数。',
      coach: '先检查语法，再运行；把脚本放在本机桌面上不会让云电脑自动恢复。',
      button: '服务已启动，恢复任务已核对'
    },
    {
      phase: 3,
      kind: 'task',
      short: '安装只读自检',
      title: '加上自检脚本，确认服务确实起来了',
      intro: '把下面脚本保存为 ~/check-after-update.sh。它只读检查程序、进程和防火墙，不会替你重启，也不输出配对码或登录令牌。',
      code: [{ lang: 'bash', caption: '保存为 ~/check-after-update.sh', text: '@embed-text:_src/grok-orca/check-after-update.sh' }, { lang: 'bash', caption: '保存后执行', text: 'chmod 700 ~/check-after-update.sh\nbash -n ~/check-after-update.sh\n~/check-after-update.sh' }],
      bullets: [
        '逐项处理 FAIL，不要靠更改输出把检查变绿。',
        '确认 Tailscale Bot 的恢复工具与定时任务实际存在，具体名称以它的安装结果为准。',
        '程序检查通过后，还需要下一阶段的人手配对与会话测试。'
      ],
      coach: '自检通过代表这些检查项通过，不代表已经验证公网无法连接或平台更新后一定恢复。',
      button: '自检通过，开始配对'
    },
    {
      phase: 4,
      kind: 'task',
      short: '电脑配对',
      title: '在电脑端 Orca 添加远程服务器',
      intro: '先确认电脑 Tailscale 已连接，再从云电脑取得桌面配对链接。配对链接相当于访问凭据，只在本人设备使用。',
      links: [{ label: 'Orca 官方下载入口', url: 'https://onorca.dev/download' }],
      code: [{ lang: 'bash', caption: '在云电脑私下查看桌面链接，不要发到群里', text: '~/.orca/orca-serve.sh --desktop-link' }],
      bullets: [
        '电脑安装 Orca，打开 Settings → Remote Orca Servers，选择添加服务器的入口。不同版本名称可能略有变化。',
        '填写便于识别的名称，粘贴云电脑生成的桌面 access link，等待 Connected。',
        '如果链接已过期，在没有任务运行时安排重启并重新获取，不要直接反复杀进程。',
        '选择云端项目，新建 Claude Code 会话，发一条简单消息，确认收到正常回复。',
        '首次启动还出现设置向导时，先按官方交互完成设置；不要默认通过修改内部 JSON 字段跳过。'
      ],
      note: '原帖主要使用 MacBook。其他桌面系统先以 Orca 官方下载页与对应版本支持为准。',
      coach: '本地 Orca 显示 Connected，再收到 Claude 回复，这两项都通过才算电脑端配好。',
      button: '电脑端已连通并收到回复'
    },
    {
      phase: 4,
      kind: 'choice',
      short: '要不要连接手机',
      title: '现在把手机也接上吗？',
      intro: '手机配对是可选步骤。只用电脑也可以完成这套环境。',
      choices: [
        { value: 'mobile', title: '连接手机', copy: '手机安装 Tailscale 和 Orca，使用手机专用二维码。', icon: 'grid', next: 13 },
        { value: 'desktop', title: '先只用电脑', copy: '跳过手机配对，直接验收云端会话。', icon: 'terminal', next: 14 }
      ],
      coach: '电脑链接和手机二维码的权限范围不同，不能互相替代。'
    },
    {
      phase: 4,
      kind: 'task',
      short: '手机配对',
      title: '用手机专用二维码配对 Orca',
      intro: '手机先加入同一个 tailnet，再安装 Orca Mobile。生成手机配对信息可能需要重启 serve，先检查任务状态。',
      links: [{ label: 'Orca 官方手机端说明', url: 'https://www.onorca.dev/docs/mobile' }],
      bullets: [
        '手机安装 Tailscale，登录同一 tailnet，并确认 DNS 与访问策略允许连接这台云电脑。',
        '检查没有需要保护的运行任务后，在云电脑执行下面的命令。重启行为由你明确确认。',
        '让 Grok Bot 仅向你本人展示手机二维码，不公开整段日志。',
        '手机 Orca 选择 Pair，扫描手机专用二维码或粘贴手机配对链接。',
        '确认手机能看到电脑上同一个项目与会话。两台设备操作同一个终端时轮流输入。'
      ],
      code: [{ lang: 'bash', caption: '确认没有重要任务后，在云电脑运行', text: '~/.orca/orca-serve.sh --mobile --confirm-restart' }],
      warn: '不要把桌面配对链接生成二维码给手机用。手机配对方式以当前 Orca 版本的官方说明为准。',
      coach: '这一步完成后，手机看见的应是云端已有会话，而不是重新开的本地项目。',
      button: '手机已看到同一个会话'
    },
    {
      phase: 4,
      kind: 'checks',
      short: '验收云端会话',
      title: '亲自确认环境能用',
      intro: '下面这些结果只能由你在自己的设备上确认。安装脚本返回成功不能替代这一步。',
      checks: [
        '电脑端 Orca 显示 Connected，能打开云端项目',
        '云端 Claude Code 会话能正常回复',
        '电脑断开再连接后，仍能找到原来的会话；任务状态已检查',
        '我已检查公网没有开放 6768，tailnet 访问规则只允许预期设备',
        '重要项目已有云电脑之外的备份位置；如选择手机配对，手机也已验收'
      ],
      coach: '合上电脑不等于云电脑永远在线；这里只验证设备断线后能重新连接会话。',
      button: '验收完成'
    },
    {
      phase: 5,
      kind: 'task',
      short: '让 Grok 帮忙看任务',
      title: '以后可以直接让 Grok Bot 查看 Claude 的进度',
      intro: '先让 Grok Bot 读取当前版本的 Orca CLI 帮助，再指定你的项目与任务。不同版本的参数可能变化，不能拿旧命令硬套。',
      code: [{ lang: 'bash', caption: '让 Grok Bot 先读当前环境的命令说明', text: 'orca agent-context\norca worktree ps\norca terminal list' }],
      agentPrompt: { title: '复制给 Grok Bot：第一次派活', text: '先读 orca agent-context，并用当前版本的 --help 核对参数。列出当前项目和 Claude Code 会话，让我选定目标。选好后只读取该会话的进度，告诉我它在运行还是等输入。之后我交代测试或改稿时，在指定项目里执行并返回结果；提交、推送、发布、付款和修改生产环境仍需我明确授权。不要开启跳过权限检查的选项，不要重启其他会话。', hint: '本教程不主动添加 --dangerously-skip-permissions。也要检查客户端实际启动参数。' },
      coach: '第一次先让它只读状态，确认找对项目，再交具体任务。',
      button: '日常用法看明白了'
    },
    {
      phase: 5,
      kind: 'task',
      short: '更新后怎么恢复',
      title: '掉线后先自检，再恢复缺失的服务',
      intro: '原作者观察到平台更新会替换云电脑实例并清掉部分安装。你的账号是否相同需要实际确认；恢复服务后，仍要检查运行中的任务有没有中断。',
      code: [{ lang: 'bash', caption: '先检查，在云电脑执行', text: '~/check-after-update.sh' }, { lang: 'bash', caption: '按检查结果恢复，不需要每次全部运行', text: 'sudo ~/.tailscale/bootstrap-tailscale.sh\n~/.orca/orca-serve.sh\n~/check-after-update.sh', note: '本教材的启动脚本要求 tailscale0 已恢复，因此先恢复 Tailscale，再启动 Orca。' }],
      bullets: [
        'Tailscale 恢复脚本不存在时，回到第三方 Bot 核对安装结果，不要直接把命令当成一定可用。',
        '节点名变化时，检查 MagicDNS 和 ADDR；旧设备记录先核实再处理。',
        '更新 Orca 时先备份现有 AppImage，下载新版本，再挑空闲时间执行 ~/.orca/orca-serve.sh --restart --confirm-restart。',
        '脚本保留旧解包目录，避免误删仍在使用的程序。确认升级稳定且没有进程引用后再自行清理。',
        '把代码及时推送到自己的私有仓库；状态文件、登录令牌、配对记录和日志不要一起公开。'
      ],
      warn: '恢复任务只能重新启动服务，不能保证平台更新前正在执行的 Claude 任务自动续跑。',
      coach: '先恢复网络，再启动服务，最后验证客户端连接和项目文件。',
      button: '查看完成清单与排查'
    },
    {
      phase: 5,
      kind: 'done',
      short: '完成与排查',
      title: '云端开发环境已走完配置流程',
      intro: '以后从电脑或手机进入 Orca，接着使用云端项目。定期检查服务、账号状态与备份，更新后先验收再继续重要任务。',
      coach: '保留这份 HTML，自检和启动脚本已经内嵌，单独拿走也能打开。',
      doneGroups: [
        { title: '收尾确认', items: ['Tailscale 与 Orca 的恢复任务实际可见，失败时有提醒', '公网 6768 未开放，tailnet 策略限定到预期设备', 'Claude 登录与付款由本人完成，配对链接保存在可信位置', '云外已有项目备份，平台更新后会重新检查任务状态'] },
        { title: '资料与验证范围', items: ['教程据 Asa（@app_sail）的原文重新编排；原作者实测不等于本教材实测', 'Orca 的远程服务、配对与安装入口已对照官方文档；Grok 沙箱恢复机制仍需在实际账号验证', '本教材启动脚本与原文不同：无 sudo 或防火墙未确认时停止启动；重启要求显式参数'] }
      ],
      faqGroups: [
        { label: '连接与配对', items: [
          { q: 'SSH 能连，Orca 连接不上？', a: '检查 serve 进程、6768 监听、防火墙、Tailscale 对 6768 的访问规则和 MagicDNS。SSH 通只说明 SSH 那条连接可用，不能证明 Orca 端口也放行。' },
          { q: 'Tailscale IP 换了要重新配对吗？', a: '先检查节点名与 MagicDNS 是否仍能解析。使用机器名能减少对 IP 的依赖，但节点身份、配对授权变化或链接失效时仍可能需要重新配对。' },
          { q: '手机提示权限不足？', a: '检查用的是手机专用链接或二维码。桌面 access link 不能直接当作手机配对码；需要重新生成时先确认任务状态。' },
          { q: '桌面链接取不到？', a: '脚本只搜索最近日志里的桌面 runtime 链接，也不能保证旧链接仍有效。先确认当前版本日志格式；必要时安排一次显式确认的桌面模式重启，再本人查看日志。不要把整段日志发到公开位置。' }
        ] },
        { label: '更新与账号', items: [
          { q: '更新之后程序没了？', a: '先运行自检。恢复 Tailscale 后再运行 Orca 启动脚本；安装包或恢复工具也丢了时需重新部署。项目是否完整要另外验证，不能只看服务上线。' },
          { q: '没有 sudo 或 ip6tables 怎么办？', a: '这套启动脚本会停止。由管理员提供可核实的端口隔离方案，或在自己的 VPS 上按官方部署。不要删检查继续运行，也不要把 pairing-address 当成绑定网卡。' },
          { q: 'Claude Code 又要求登录？', a: '先在云端查看 claude auth status，区分账号失效、环境改变和首次设置向导。按官方授权流程处理，避免未经确认修改内部状态文件。' },
          { q: '能保证 24 小时在线或者不封号吗？', a: '不能。远程服务、平台更新、账号资格和服务政策都会影响使用。服务器所在地不自动赋予地区资格；遇到地区或账号限制应按官方渠道处理。' },
          { q: '我有自己的 VPS，照搬脚本可以吗？', a: '不建议。这套流程针对作者描述的 Grok 云电脑，并要求内核 Tailscale 和免密 sudo。VPS 通常应使用自己的防火墙与 systemd 服务，另外验证，不套用沙箱开机恢复方式。' }
        ] }
      ]
    }
  ]
};

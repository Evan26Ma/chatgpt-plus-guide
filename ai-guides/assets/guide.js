// AI 工具配置向导 · 通用引擎
// 内容数据放在 guides/<slug>.js，本文件只负责呈现与导航。
(function () {
  const iconPaths = {
    book: '<path d="M12 5v16m0-16C9 2 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-2-1-6-2-9 1Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 9.4 3.8 3.8 0 0 1 17 18Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M10 3v3m4-3v3m-4 12v3m4-3v3M3 10h3m-3 4h3m12-4h3m-3 4h3"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    spark: '<path d="M12 3v6m0 6v6M3 12h6m6 0h6"/><circle cx="12" cy="12" r="2.5"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
    external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    warn: '<path d="M12 4 2.8 20h18.4L12 4Z"/><path d="M12 10v5m0 3v.1"/>',
    tip: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 .8-1 1.5-1 2H9c0-.5 0-1.2-1-2Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M15 5v-.5A2.5 2.5 0 0 0 12.5 2h-8A2.5 2.5 0 0 0 2 4.5v8A2.5 2.5 0 0 0 4.5 15H5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cursor: '<path d="m5 3 5 17 3-7 7-3L5 3Z"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    zoom: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 2 2-2 2 2 2-2 2-2-2-3 3"/>'
  };
  const phaseIcons = ['server', 'terminal', 'globe', 'chip', 'book', 'lock'];

  const slug = window.AI_GUIDE_SLUG || new URLSearchParams(location.search).get('t') || '';
  const guide = window.AI_GUIDE;
  const STORAGE_KEY = 'aiGuideStateV1::' + slug;
  const card = document.getElementById('stepCard');
  const coachText = document.getElementById('coachText');
  const handoffStatus = document.getElementById('handoffStatus');
  const imageDialog = document.getElementById('imageDialog');
  const resetDialog = document.getElementById('resetDialog');

  if (!guide || !Array.isArray(guide.steps) || !guide.steps.length) {
    renderMissing();
    return;
  }

  function renderMissing() {
    document.title = '内容没加载出来 · 配置向导';
    document.getElementById('guideTitle').textContent = '内容没加载出来';
    card.innerHTML = `<div class="missing-card"><h2>这篇的内容没加载出来</h2><p>页面脚本可能没跑起来。刷新一次试试；还不行的话，把这一页重新打开一次。</p><a class="primary-button" href="#stepCard">${icon('arrow')}刷新页面再试</a></div>`;
  }

  const steps = guide.steps;
  const phases = guide.phases || [{ title: '开始', copy: '跟着向导走' }];
  const inputs = guide.inputs || [];

  function icon(name, className = '') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${className}">${iconPaths[name] || iconPaths.spark}</svg>`;
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  /* ---------- 状态 ---------- */
  let storageAvailable = true;
  const state = loadState();
  let current = Number.isInteger(state.current) && state.current >= 0 && state.current < steps.length ? state.current : 0;
  let history = Array.isArray(state.history) ? state.history.filter(index => Number.isInteger(index) && index >= 0 && index < steps.length) : [];

  function loadState() {
    try {
      let value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      if (Number.isInteger(guide.progressVersion) && Array.isArray(guide.legacyStepMap) && value.progressVersion == null) {
        const mappedIndex = index => Number.isInteger(index) ? guide.legacyStepMap[index] : undefined;
        const mappedRecord = record => Object.fromEntries(Object.entries(record && typeof record === 'object' ? record : {}).map(([index, item]) => [mappedIndex(Number(index)), item]).filter(([index]) => Number.isInteger(index)));
        const legacyHistory = Array.isArray(value.history) ? value.history : [];
        const hadRoute = [value.current, ...legacyHistory, ...Object.keys(value.done || {}).map(Number)].some(index => Number.isInteger(index) && index > 0);
        const mappedHistory = legacyHistory.map(mappedIndex).filter(Number.isInteger);
        const legacyAnswers = hadRoute ? guide.legacyAnswers || {} : {};
        const mappedDone = mappedRecord(value.done);
        Object.keys(legacyAnswers).map(Number).forEach(index => {
          const position = mappedHistory.findIndex(visited => visited > index);
          if (mappedIndex(value.current) > index && !mappedHistory.includes(index)) mappedHistory.splice(position >= 0 ? position : mappedHistory.length, 0, index);
          mappedDone[index] = true;
        });
        value = { ...value, current: mappedIndex(value.current), history: mappedHistory, done: mappedDone, checks: mappedRecord(value.checks), answers: { ...mappedRecord(value.answers), ...legacyAnswers } };
      }
      const clean = {};
      if (value.values && typeof value.values === 'object') {
        clean.values = {};
        inputs.forEach(field => {
          const raw = value.values[field.key];
          if (typeof raw === 'string') clean.values[field.key] = raw.slice(0, 300);
        });
      }
      if (value.done && typeof value.done === 'object') {
        clean.done = {};
        steps.forEach((step, index) => { if (value.done[index] === true) clean.done[index] = true; });
      }
      if (value.checks && typeof value.checks === 'object') {
        clean.checks = {};
        steps.forEach((step, index) => {
          if (step.kind === 'checks' && Array.isArray(value.checks[index])) {
            clean.checks[index] = step.checks.map((_, i) => value.checks[index][i] === true);
          }
        });
      }
      if (value.answers && typeof value.answers === 'object') {
        clean.answers = {};
        steps.forEach((step, index) => {
          if (step.kind === 'choice' && step.choices.some(choice => choice.value === value.answers[index])) clean.answers[index] = value.answers[index];
        });
      }
      if (Number.isInteger(value.current) && value.current >= 0 && value.current < steps.length) clean.current = value.current;
      if (Array.isArray(value.history)) clean.history = value.history.filter(index => Number.isInteger(index) && index >= 0 && index < steps.length);
      return clean;
    } catch (error) {
      if (!(error instanceof SyntaxError)) storageAvailable = false;
      return {};
    }
  }
  state.values = state.values || {};
  state.done = state.done || {};
  state.checks = state.checks || {};
  state.answers = state.answers || {};

  function save() {
    state.current = current;
    state.history = [...history];
    if (Number.isInteger(guide.progressVersion)) state.progressVersion = guide.progressVersion;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    document.getElementById('saveStatus').innerHTML = `<span class="status-dot"></span>${storageAvailable ? '进度自动保存' : '当前进度暂未保存'}`;
  }

  /* ---------- 参数与模板替换 ---------- */
  // 占位符写作 {{key}} 或 {{ key }}，渲染时替换成用户填的值
  const TOKEN = /\{\{\s*(\w+)\s*\}\}/g;
  function valueOf(key) {
    const raw = state.values[key];
    return typeof raw === 'string' ? raw.trim() : '';
  }
  function filled(text) {
    if (typeof text !== 'string') return '';
    return text.replace(TOKEN, (match, key) => valueOf(key) || match);
  }
  function htmlFill(text) {
    return escapeHtml(filled(text)).replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => `<span class="todo">待填入${inputLabel(key)}</span>`);
  }
  function inputLabel(key) {
    const field = inputs.find(item => item.key === key);
    return field ? '· ' + field.short : '';
  }
  function urlOf(value) {
    if (typeof value !== 'string') return '';
    const resolved = filled(value).trim();
    if (!resolved || /\{\{\s*\w+\s*\}\}/.test(resolved)) return '';
    try {
      const url = new URL(resolved, location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch { return ''; }
  }
  function missingKeys(step) {
    const raw = JSON.stringify(step);
    const keys = new Set();
    (raw.match(/\{\{\s*(\w+)\s*\}\}/g) || []).forEach(token => keys.add(token.replace(/[{}]/g, '').trim()));
    return [...keys].filter(key => !valueOf(key));
  }

  /* ---------- 路由 ---------- */
  function route() {
    const result = [];
    const seen = new Set();
    let index = 0;
    while (Number.isInteger(index) && index >= 0 && index < steps.length && !seen.has(index)) {
      seen.add(index);
      const step = steps[index];
      result.push(index);
      if (step.kind === 'choice') {
        const answer = state.answers[index];
        const choice = answer ? step.choices.find(item => item.value === answer) : null;
        if (!choice) break;
        index = Number.isInteger(choice.next) ? choice.next : index + 1;
      } else {
        index = Number.isInteger(step.next) ? step.next : index + 1;
      }
    }
    return result;
  }
  function routeIndexOf(index) {
    return route().indexOf(index);
  }

  /* ---------- 组件 ---------- */
  function slugOfTitle(title) {
    return '';
  }
  function links(items = []) {
    if (!items.length) return '';
    return `<div class="link-row">${items.map(item => {
      const url = urlOf(item.url);
      const label = escapeHtml(item.label);
      const domain = url ? new URL(url).hostname : '待填入地址后解锁';
      if (!url) {
        return `<span class="link-card is-disabled"><span class="link-icon">${icon('lock')}</span><span class="link-content"><span class="link-label">${label}</span><span class="link-domain">先在「填写参数」那一步填入信息，这里会自动变成可点击的链接</span></span></span>`;
      }
      return `<a class="link-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><span class="link-icon">${icon('globe')}</span><span class="link-content"><span class="link-label">${label}</span><span class="link-domain">${escapeHtml(domain)} · 新标签页打开</span></span>${icon('external', 'link-external')}</a>`;
    }).join('')}</div>`;
  }
  function promo(block) {
    if (!block || !block.code) return '';
    return `<div class="promo-card">
      <div class="promo-head"><span class="promo-badge">${escapeHtml(block.badge || '邀请奖励')}</span><strong>${escapeHtml(filled(block.title || '专属邀请码'))}</strong></div>
      <div class="promo-code-row"><span class="promo-code">${escapeHtml(block.code)}</span><button class="secondary-button promo-copy" id="promoCopy" type="button">${icon('copy')}复制邀请码</button></div>
      ${block.reward ? `<p class="promo-reward">${htmlFill(block.reward)}</p>` : ''}
      ${block.hint ? `<p class="promo-hint">${htmlFill(block.hint)}</p>` : ''}
    </div>`;
  }
  function codeBlocks(items = []) {
    if (!items.length) return '';
    return items.map(block => {
      const raw = Array.isArray(block.text) ? block.text.join('\n') : String(block.text || '');
      const rendered = escapeHtml(filled(raw))
        .replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => `<span class="todo">待填入${inputLabel(key)}</span>`)
        .replace(/^(?!.*\{\{)(\s*)(#.*)$/gm, '$1<span class="cmt">$2</span>');
      return `<div class="code-block${raw.split('\n').length > 24 ? ' code-block-long' : ''}" data-copy-source="${escapeHtml(raw)}">
        <div class="code-head"><span class="code-dots"><i></i><i></i><i></i></span><span class="code-lang">${escapeHtml(block.lang || 'shell')}</span>${block.caption ? `<span class="code-caption">${escapeHtml(block.caption)}</span>` : ''}<button class="code-copy" type="button" data-copy>${icon('copy')}复制</button></div>
        <pre class="code-body">${rendered}</pre>
        ${block.note ? `<div class="code-note">${htmlFill(block.note)}</div>` : ''}
      </div>`;
    }).join('');
  }
  function bullets(items = []) {
    return items.length ? `<ol class="instructions">${items.map(item => `<li class="instruction"><span>${htmlFill(item)}</span></li>`).join('')}</ol>` : '';
  }
  function facts(rows = []) {
    return rows.length ? `<div class="fact-table">${rows.map(row => `<div class="fact-row"><span class="fact-key">${escapeHtml(filled(row[0]))}</span><span class="fact-value">${htmlFill(row[1])}</span></div>`).join('')}</div>` : '';
  }
  function callout(text, tone = '') {
    const toneClass = tone ? ` ${tone}` : '';
    const iconName = tone === 'warn' || tone === 'blocked' ? 'warn' : tone === 'tip' ? 'tip' : 'info';
    return `<div class="callout${toneClass}">${icon(iconName)}<span>${htmlFill(text)}</span></div>`;
  }
  function images(items = []) {
    if (!items.length) return '';
    return `<div class="reference-gallery">${items.map(item => `<figure class="reference-figure${item.layout === 'phone' ? ' reference-phone' : ''}"><button class="image-trigger" type="button" data-image="${escapeHtml(item.src)}" data-caption="${escapeHtml(filled(item.caption || item.alt || ''))}" aria-label="放大查看：${escapeHtml(filled(item.alt || ''))}"><img class="reference-image" src="${escapeHtml(item.src)}" alt="${escapeHtml(filled(item.alt || ''))}" loading="lazy" decoding="async"/><span class="zoom-label">${icon('zoom')}点击放大</span></button><figcaption class="image-caption">${htmlFill(item.caption || item.alt || '')}</figcaption></figure>`).join('')}</div>`;
  }
  function agentPrompt(block) {
    if (!block || !block.text) return '';
    const text = filled(block.text);
    return `<div class="agent-prompt">
      <div class="agent-prompt-head">${icon('spark')}${escapeHtml(block.title || '让 AI 助手帮你配')}</div>
      ${block.intro ? `<p>${htmlFill(block.intro)}</p>` : ''}
      <pre data-prompt>${escapeHtml(text)}</pre>
      <div class="agent-actions"><button class="secondary-button" type="button" data-copy-prompt>${icon('copy')}复制这段提示词</button>${block.hint ? `<p>${htmlFill(block.hint)}</p>` : ''}</div>
    </div>`;
  }
  function faq(groups = []) {
    if (!groups.length) return '';
    return `<div class="faq-groups">${groups.map((group, groupIndex) => `<section class="faq-group"><h3 class="faq-group-title">${escapeHtml(group.label)}</h3><div class="faq-list">${group.items.map((item, itemIndex) => `<details class="faq-item"${groupIndex === 0 && itemIndex === 0 ? ' open' : ''}><summary><span class="faq-chevron">${icon('chevron')}</span><span class="faq-q">${escapeHtml(item.q)}</span></summary><p class="faq-a">${htmlFill(item.a)}</p></details>`).join('')}</div></section>`).join('')}</div>`;
  }
  function doneGroup(title, items = []) {
    return `<div class="done-group"><h3>${escapeHtml(title)}</h3><ul class="done-list">${items.map(item => `<li><span>${htmlFill(item)}</span></li>`).join('')}</ul></div>`;
  }
  // 相关教程：兄弟篇用相对地址（./编号-slug.html），站外教程用完整地址；
  // 地址不合法时降级成不可点的文字条目，避免出现死链。
  function seeAlso(items) {
    if (!items || !items.length) return '';
    const rows = items.map(item => {
      const href = String(item.url || '').trim();
      const safe = /^(https?:\/\/[^\s]+|\.{1,2}\/[^\s]+)$/.test(href) ? href : '';
      const inner = `<span class="see-also-icon">${icon(item.icon || 'book')}</span><span><strong>${escapeHtml(filled(item.title))}</strong>${item.why ? `<small>${htmlFill(item.why)}</small>` : ''}</span>${safe ? icon('arrow') : ''}`;
      return safe
        ? `<a class="see-also-item" href="${escapeHtml(safe)}"${/^https?:/.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`
        : `<span class="see-also-item is-static">${inner}</span>`;
    }).join('');
    return `<div class="see-also"><div class="see-also-head">${icon('spark')}这时候可以看这些</div>${rows}</div>`;
  }
  function paramsRecap() {
    if (!inputs.length) return '';
    return `<div class="params-recap"><div class="params-recap-title">你填过的参数</div>${inputs.map(field => {
      const value = valueOf(field.key);
      return `<div class="params-recap-row"><span>${escapeHtml(field.short)}</span>${value ? `<code>${escapeHtml(value)}</code>` : `<span class="recap-empty">还没填</span>`}</div>`;
    }).join('')}</div>`;
  }
  function copyText(value) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      ok ? resolve() : reject(new Error('copy unavailable'));
    });
  }
  function flashCopy(button, label) {
    const original = button.innerHTML;
    button.classList.add('done');
    button.innerHTML = `${icon('check')}${label}`;
    setTimeout(() => { button.classList.remove('done'); button.innerHTML = original; }, 1800);
  }

  /* ---------- 进度 / 阶段 ---------- */
  function updateProgress() {
    const activeRoute = route();
    const position = Math.max(0, activeRoute.indexOf(current));
    const doneCount = activeRoute.filter(index => index !== activeRoute[activeRoute.length - 1] || !isFinish(steps[index])).filter(index => state.done[index]).length;
    const total = activeRoute.filter(index => !isFinish(steps[index])).length;
    const finished = isFinish(steps[current]);
    const percent = finished ? 100 : Math.min(99, Math.round(doneCount / Math.max(1, total) * 100));
    const phaseIndex = steps[current].phase || 0;
    document.getElementById('phaseList').innerHTML = phases.map((phase, index) => {
      const done = finished || index < phaseIndex;
      const active = !finished && index === phaseIndex;
      return `<li class="phase${done ? ' done' : active ? ' active' : ''}"${active ? ' aria-current="step"' : ''}><span class="phase-icon">${icon(done ? 'check' : phaseIcons[index % phaseIcons.length])}</span><span><span class="phase-label">${escapeHtml(phase.title)}</span><span class="phase-copy">${escapeHtml(done ? '这一阶段已完成' : phase.copy || '')}</span></span></li>`;
    }).join('');
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressTrack').setAttribute('aria-valuenow', percent);
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressCount').textContent = finished ? '全部完成' : `第 ${position + 1} / ${activeRoute.length} 步`;
    return position + 1;
  }
  function isFinish(step) {
    return step && step.kind === 'done';
  }
  function renderToc(position) {
    const toc = document.getElementById('stepToc');
    if (!toc) return;
    const activeRoute = route();
    toc.innerHTML = `<div class="step-toc-title">本篇步骤</div><ol>${activeRoute.map((index, order) => {
      const step = steps[index];
      const reachable = order <= position;
      const className = index === current ? 'current' : state.done[index] ? 'done' : reachable ? '' : 'future';
      const label = isFinish(step) ? (step.short || '完成') : step.short || step.title;
      return `<li class="${className}">${reachable ? `<button type="button" class="toc-jump" data-jump="${index}" style="all:unset;cursor:pointer;display:flex;align-items:center;gap:9px;width:100%">` : ''}<span class="toc-index">${index === current ? icon('cursor') : state.done[index] ? icon('check') : order + 1}</span><span>${escapeHtml(label)}</span>${reachable ? '</button>' : ''}</li>`;
    }).join('')}</ol>`;
  }

  /* ---------- 渲染 ---------- */
  function renderBody(step) {
    if (step.kind === 'inputs') {
      return `<div class="params-panel">${inputs.map(field => `<label class="input-field"><span class="input-label">${escapeHtml(field.label)}${field.optional ? '<span class="optional">可留空</span>' : ''}</span><input type="text" data-input="${field.key}" value="${escapeHtml(valueOf(field.key))}" placeholder="${escapeHtml(field.placeholder || '')}" autocomplete="off" spellcheck="false"/><span class="input-hint">${escapeHtml(field.hint || '')}</span>${field.example ? `<span class="input-example">示例：${escapeHtml(field.example)}</span>` : ''}</label>`).join('')}${paramsRecap()}</div>`;
    }
    if (step.kind === 'choice') {
      return `<div><div class="choice-grid">${step.choices.map(choice => `<button class="choice${state.answers[current] === choice.value ? ' selected' : ''}" data-choice="${escapeHtml(choice.value)}" type="button" aria-pressed="${state.answers[current] === choice.value}"><span class="choice-icon">${icon(choice.icon || 'grid')}</span><span class="choice-arrow">${icon(state.answers[current] === choice.value ? 'check' : 'arrow')}</span><span class="choice-title">${escapeHtml(filled(choice.title))}</span><span class="choice-copy">${escapeHtml(filled(choice.copy || ''))}</span></button>`).join('')}</div><p class="choice-note">${icon('info')}你的选择会决定后面的步骤，随时可以返回修改。</p></div>`;
    }
    if (step.kind === 'checks') {
      return `<div class="check-list">${step.checks.map((item, index) => `<label class="check-item"><input type="checkbox" data-check="${index}"${(state.checks[current] || [])[index] ? ' checked' : ''}/><span>${htmlFill(item)}</span></label>`).join('')}</div>`;
    }
    if (step.kind === 'faq') {
      return faq(step.faqGroups);
    }
    if (step.kind === 'done') {
      return `<div class="completion"><div class="completion-symbol">${icon('check')}</div><h2 id="stepTitle">${escapeHtml(filled(step.title))}</h2><p>${htmlFill(step.intro || '')}</p>${step.doneGroups ? step.doneGroups.map(group => doneGroup(group.title, group.items)).join('') : ''}${paramsRecap()}${seeAlso(step.seeAlso)}</div>${step.faqGroups && step.faqGroups.length ? `<div class="done-faq"><h3 class="faq-group-title">常见问题</h3>${faq(step.faqGroups)}</div>` : ''}`;
    }
    let body = links(step.links) + promo(step.promo) + codeBlocks(step.code) + facts(step.facts) + bullets(step.bullets) + images(step.images) + agentPrompt(step.agentPrompt);
    return body;
  }
  function render(focus = false) {
    const step = steps[current];
    const position = updateProgress();
    renderToc(position - 1);
    let body = renderBody(step);
    if (step.kind !== 'done') {
      if (step.note) body += callout(step.note, step.noteTone || '');
      if (step.warn) body += callout(step.warn, 'warn');
      if (step.tip) body += callout(step.tip, 'tip');
      const missing = missingKeys(step).filter(key => inputs.some(field => field.key === key));
      if (missing.length && step.kind !== 'inputs') {
        body += callout(`这一步要用到${missing.map(key => `「${inputLabel(key).replace('· ', '')}」`).join('、')}，还没填的话可以先回「填写参数」那一步补上，下面的内容会自动替换。`, 'blocked');
      }
      if (step.seeAlso) body += seeAlso(step.seeAlso);
    }
    const finish = isFinish(step);
    const primary = finish || step.kind === 'choice'
      ? ''
      : `<button class="primary-button" id="nextButton" type="button">${escapeHtml(filled(step.button || (step.kind === 'inputs' ? '保存，继续' : '做完了，下一步')))}${icon('arrow')}</button>`;
    card.innerHTML = `<div class="step-meta"><span class="step-number">${finish ? 'ALL DONE' : `STEP ${String(position).padStart(2, '0')}`}</span><span class="step-category">${finish ? '教程完成' : escapeHtml(phases[step.phase || 0] ? phases[step.phase || 0].title : '')}</span></div>${finish ? body : `<h2 id="stepTitle">${escapeHtml(filled(step.title))}</h2><p class="step-intro">${htmlFill(step.intro || '')}</p><div class="action-area">${body}</div>`}<div class="button-row"><button class="secondary-button" id="backButton" type="button"${current === 0 ? ' disabled' : ''}>${icon('back')}上一步</button>${finish ? `<span class="button-group">${primary}</span>` : `<span class="button-hint">${icon('cursor')}${escapeHtml(step.hint || '做完这一步，再点右边继续')}</span>${primary}`}</div>`;
    coachText.textContent = filled(step.coach || '这篇就走完了。下面的问答按大家真实踩过的坑整理，对不上号的地方再带着截图去问。');
    const blocked = missingKeys(step).some(key => inputs.some(field => field.key === key));
    handoffStatus.className = `handoff-status${finish ? ' complete-state' : blocked ? ' blocked-state' : ''}`;
    handoffStatus.innerHTML = `<span class="status-dot"></span>${finish ? '已完成' : blocked ? '等待填写' : step.kind === 'choice' ? '等待选择' : step.kind === 'inputs' ? '等待填写' : step.kind === 'checks' ? '等待勾选' : '等待操作'}`;
    bindCardEvents(step);
    save();
    if (focus) {
      card.classList.remove('step-enter');
      void card.offsetWidth;
      card.classList.add('step-enter');
      if (window.scrollY > card.offsetTop - 90) window.scrollTo({ top: Math.max(0, card.offsetTop - 90), behavior: 'instant' });
    }
  }

  function bindCardEvents(step) {
    card.querySelector('#backButton').addEventListener('click', back);
    card.querySelector('#nextButton')?.addEventListener('click', () => complete(step));
    card.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(step, button.dataset.choice)));
    document.getElementById('stepToc')?.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => { moveTo(Number(button.dataset.jump)); }));
    const promoCopy = card.querySelector('#promoCopy');
    promoCopy?.addEventListener('click', () => {
      copyText(promoCopy.closest('.promo-card').querySelector('.promo-code').textContent.trim())
        .then(() => flashCopy(promoCopy, '已复制')).catch(() => {});
    });
    card.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => {
      const source = button.closest('.code-block').dataset.copySource;
      copyText(filled(source)).then(() => flashCopy(button, '已复制')).catch(() => {});
    }));
    card.querySelector('[data-copy-prompt]')?.addEventListener('click', event => {
      const button = event.currentTarget;
      copyText(card.querySelector('[data-prompt]').textContent).then(() => flashCopy(button, '已复制')).catch(() => {});
    });
    card.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
      document.getElementById('imageDialogImage').src = button.dataset.image;
      document.getElementById('imageDialogCaption').textContent = button.dataset.caption;
      imageDialog.showModal();
    }));
    if (step.kind === 'checks') {
      const next = card.querySelector('#nextButton');
      const sync = () => {
        state.checks[current] = [...card.querySelectorAll('[data-check]')].map(input => input.checked);
        next.disabled = state.checks[current].some(checked => !checked);
        save();
      };
      next.disabled = step.checks.some((_, index) => !(state.checks[current] || [])[index]);
      card.querySelectorAll('[data-check]').forEach(input => input.addEventListener('change', sync));
    }
    if (step.kind === 'inputs') {
      card.querySelectorAll('[data-input]').forEach(input => input.addEventListener('input', () => {
        state.values[input.dataset.input] = input.value;
        save();
        const recap = card.querySelector('.params-recap');
        if (recap) recap.outerHTML = paramsRecap();
      }));
    }
  }

  function moveTo(index) {
    if (!Number.isInteger(index) || index < 0 || index >= steps.length || index === current) return;
    history.push(current);
    current = index;
    render(true);
  }
  function back() {
    if (current === 0) return;
    const activeRoute = route();
    current = history.length ? history.pop() : activeRoute[Math.max(0, routeIndexOf(current) - 1)];
    render(true);
  }
  function choose(step, value) {
    const choice = step.choices.find(item => item.value === value);
    if (!choice) return;
    if (state.answers[current] === value) {
      moveTo(Number.isInteger(choice.next) ? choice.next : current + 1);
      return;
    }
    // 改了选择，后面走过的路和完成状态就作废
    Object.keys(state.done).forEach(key => { if (Number(key) > current) delete state.done[key]; });
    Object.keys(state.answers).forEach(key => { if (Number(key) > current) delete state.answers[key]; });
    state.answers[current] = value;
    state.done[current] = true;
    history = history.filter(index => index <= current);
    moveTo(Number.isInteger(choice.next) ? choice.next : current + 1);
  }
  function complete(step) {
    if (step.kind === 'checks') {
      const checked = state.checks[current] || [];
      if (step.checks.some((_, index) => !checked[index])) return;
    }
    state.done[current] = true;
    const next = Number.isInteger(step.next) ? step.next : current + 1;
    if (next >= steps.length) { current = steps.length - 1; render(true); return; }
    moveTo(next);
  }

  /* ---------- 启动 ---------- */
  document.title = `${guide.title} · 配置向导`;
  const titleNode = document.getElementById('guideTitle');
  if (titleNode) titleNode.textContent = guide.title;
  const subtitleNode = document.getElementById('guideSubtitle');
  if (subtitleNode) subtitleNode.textContent = guide.subtitle || '';
  document.getElementById('resetButton').addEventListener('click', () => resetDialog.showModal());
  resetDialog.addEventListener('close', () => {
    if (resetDialog.returnValue !== 'reset') return;
    state.values = {}; state.done = {}; state.checks = {}; state.answers = {}; state.current = 0; state.history = [];
    current = 0; history = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* 忽略 */ }
    render(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    resetDialog.returnValue = '';
  });
  document.getElementById('closeImage').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    const rect = imageDialog.getBoundingClientRect();
    if (event.target === imageDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) imageDialog.close();
  });
  render();
})();

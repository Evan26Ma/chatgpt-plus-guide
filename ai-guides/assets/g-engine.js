/* Plus Guide · G 风格向导引擎
 * 内容来自 window.AI_GUIDE；兼容旧向导的路由、参数、访问确认和本地进度。
 * 样式在 g-guide.css，页面外壳在 g-page.html。
 */
(function () {
  'use strict';
  const guide = window.AI_GUIDE;
  const slug = window.AI_GUIDE_SLUG || (guide && guide.slug) || '';
  const STORAGE_KEY = (guide && guide.storageKey) || 'aiGuideStateV1::' + slug;
  const $ = id => document.getElementById(id);
  const ICONS = {
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
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 2 2-2 2 2 2-2 2-2-2-3 3"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'
  };
  const icon = name => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const record = v => v && typeof v === 'object' && !Array.isArray(v);

  if (!guide || !Array.isArray(guide.steps) || !guide.steps.length) {
    $('step').innerHTML = '<h1 id="stepTitle" tabindex="-1">这篇的内容没加载出来</h1><p class="intro">页面脚本可能没跑起来，刷新一次试试。</p>';
    return;
  }
  const steps = guide.steps;
  const phases = guide.phases || [{ title: '开始' }];
  const inputs = guide.inputs || [];
  const validIndex = i => Number.isInteger(i) && i >= 0 && i < steps.length;
  const isDone = s => s && s.kind === 'done';
  let storageOk = true;
  let accessReady = false;
  const state = load();
  let current = validIndex(state.current) ? state.current : 0;
  let hist = state.history || [];

  /* ---------- 状态与旧版进度 ---------- */
  function migrateIndices(value) {
    if (!Number.isInteger(guide.progressVersion) || !Array.isArray(guide.legacyStepMap) || value.progressVersion != null) return value;
    const mappedIndex = index => Number.isInteger(index) ? guide.legacyStepMap[index] : undefined;
    const mappedRecord = r => Object.fromEntries(Object.entries(record(r) ? r : {}).map(([index, item]) => [mappedIndex(Number(index)), item]).filter(([index]) => Number.isInteger(index)));
    const legacyHistory = Array.isArray(value.history) ? value.history : [];
    const hadRoute = [value.current, ...legacyHistory, ...Object.keys(record(value.done) ? value.done : {}).map(Number)].some(index => Number.isInteger(index) && index > 0);
    const mappedHistory = legacyHistory.map(mappedIndex).filter(Number.isInteger);
    const legacyAnswers = hadRoute ? guide.legacyAnswers || {} : {};
    const mappedDone = mappedRecord(value.done);
    Object.keys(legacyAnswers).map(Number).forEach(index => {
      const position = mappedHistory.findIndex(visited => visited > index);
      if (mappedIndex(value.current) > index && !mappedHistory.includes(index)) mappedHistory.splice(position >= 0 ? position : mappedHistory.length, 0, index);
      mappedDone[index] = true;
    });
    return { ...value, current: mappedIndex(value.current), history: mappedHistory, done: mappedDone, checks: mappedRecord(value.checks), ticks: mappedRecord(value.ticks), answers: { ...mappedRecord(value.answers), ...legacyAnswers } };
  }
  function sanitize(value) {
    const clean = { values: {}, done: {}, checks: {}, answers: {}, ticks: {}, history: [] };
    if (!record(value)) return clean;
    if (!guide.ephemeralInputs && record(value.values)) inputs.forEach(f => {
      if (typeof value.values[f.key] === 'string') clean.values[f.key] = value.values[f.key].slice(0, 300);
    });
    steps.forEach((s, i) => {
      if (record(value.done) && value.done[i] === true) clean.done[i] = true;
      if (Array.isArray(s.checks) && record(value.checks) && Array.isArray(value.checks[i])) clean.checks[i] = s.checks.map((_, k) => value.checks[i][k] === true);
      if (Array.isArray(s.bullets) && record(value.ticks) && Array.isArray(value.ticks[i])) clean.ticks[i] = s.bullets.map((_, k) => value.ticks[i][k] === true);
      if (s.kind === 'choice' && record(value.answers) && (s.choices || []).some(ch => ch.value === value.answers[i])) clean.answers[i] = value.answers[i];
    });
    if (validIndex(value.current)) clean.current = value.current;
    if (Array.isArray(value.history)) clean.history = value.history.filter(validIndex);
    return clean;
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // 只有主键不存在时尝试旧键；保留旧记录，避免另一版本的向导失去进度。
      if (raw === null && Array.isArray(guide.legacyStorageKeys)) {
        for (const key of guide.legacyStorageKeys) {
          if (typeof key !== 'string' || key === STORAGE_KEY) continue;
          const old = localStorage.getItem(key);
          if (old === null) continue;
          try {
            const value = JSON.parse(old);
            const migrated = typeof guide.migrateProgress === 'function' ? guide.migrateProgress(value, key) : value;
            if (record(migrated)) return sanitize(migrated);
          } catch { /* 无效的旧记录不妨碍尝试下一个旧键。 */ }
        }
      }
      const value = JSON.parse(raw || '{}');
      return sanitize(record(value) ? migrateIndices(value) : value);
    } catch (e) {
      if (!(e instanceof SyntaxError)) storageOk = false;
      return sanitize({});
    }
  }
  function save() {
    state.current = current;
    state.history = [...hist];
    if (Number.isInteger(guide.progressVersion)) state.progressVersion = guide.progressVersion;
    const stored = guide.ephemeralInputs ? { ...state, values: {} } : state;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); storageOk = true; } catch { storageOk = false; }
    $('saveStatus').innerHTML = `<i aria-hidden="true"></i>${storageOk ? '进度自动保存在这个浏览器' : '当前浏览器不能保存进度'}`;
    if (steps[current].id) {
      try { window.history.replaceState(null, '', '#' + encodeURIComponent(steps[current].id)); } catch { /* 本地文件可能限制 history。 */ }
    }
  }

  /* ---------- 参数与链接 ---------- */
  const TOKEN = /\{\{\s*(\w+)\s*\}\}/g;
  const fieldOf = k => inputs.find(f => f.key === k);
  function inputError(field, raw) {
    if (!field || !field.pattern || !raw) return '';
    try { return new RegExp(field.pattern).test(raw) ? '' : field.error || '格式不对，请核对'; }
    catch { return field.error || '格式不对，请核对'; }
  }
  const rawValue = f => typeof state.values[f.key] === 'string' ? state.values[f.key] : String(f.default || '');
  function val(k) {
    const f = fieldOf(k);
    const raw = typeof state.values[k] === 'string' ? state.values[k].trim() : '';
    const value = raw || (f && String(f.default || '')) || '';
    return inputError(f, value) ? '' : value;
  }
  const fill = t => typeof t === 'string' ? t.replace(TOKEN, (m, k) => val(k) || m) : '';
  const plainFill = t => typeof t === 'string' ? t.replace(TOKEN, (m, k) => val(k) || (fieldOf(k) || {}).token || m) : '';
  const label = k => { const f = fieldOf(k); return f ? f.short || f.label : k; };
  const html = t => esc(fill(t)).replace(TOKEN, (m, k) => `<span class="todo">待填入${esc(label(k))}</span>`);
  function safeUrl(u) {
    if (typeof u !== 'string') return '';
    const r = fill(u).trim();
    // 检测占位符用非 global 正则，连续调用不会受 lastIndex 影响。
    if (!r || /\{\{\s*\w+\s*\}\}/.test(r) || /[\u0000-\u0020\u007f\\]/.test(r)) return '';
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(r);
    if (absolute && !/^https?:\/\//i.test(r)) return '';
    try {
      const url = new URL(r, location.href);
      if (/^https?:$/.test(url.protocol)) return absolute || r.startsWith('//') ? url.href : r;
      // 双击打开的教程也可使用相对的本地图片和下载；不接收 file: 等显式协议。
      return !absolute && !r.startsWith('//') && url.protocol === 'file:' ? r : '';
    } catch { return ''; }
  }
  function safeImageUrl(value) {
    if (typeof value === 'string' && /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return value;
    return safeUrl(value);
  }
  const externalUrl = u => /^https?:\/\//i.test(u);
  function missingKeys(step) {
    const keys = new Set();
    (JSON.stringify(step).match(/\{\{\s*(\w+)\s*\}\}/g) || []).forEach(t => keys.add(t.replace(/[{}\s]/g, '')));
    return [...keys].filter(k => fieldOf(k) && !val(k));
  }

  /* ---------- 路线、步骤 ID 与直达入口 ---------- */
  function indexOfId(id) {
    if (typeof id !== 'string') return undefined;
    const aliases = record(guide.legacyStepIds) ? guide.legacyStepIds : {};
    if (Object.prototype.hasOwnProperty.call(aliases, id)) id = aliases[id];
    else {
      const prefix = Object.keys(aliases).filter(k => k.endsWith('*') && id.startsWith(k.slice(0, -1))).sort((a, b) => b.length - a.length)[0];
      if (prefix) id = aliases[prefix];
      else if (id.startsWith('register-') && steps.some(s => s.id === 'account-ready')) id = 'account-ready';
    }
    if (validIndex(id)) return id;
    // VPS 旧数据有同名的说明页和选择页，入口优先定位选择页。
    const choice = steps.findIndex(s => s.id === id && s.kind === 'choice');
    const index = choice >= 0 ? choice : steps.findIndex(s => s.id === id);
    return validIndex(index) ? index : undefined;
  }
  const targetIndex = target => validIndex(target) ? target : indexOfId(target);
  function defaultNext(i, answers) {
    const s = steps[i];
    if (typeof s.route === 'function') return targetIndex(s.route(answers, state.values));
    const ch = s.kind === 'choice' ? (s.choices || []).find(c => c.value === answers[i]) : null;
    if (s.kind === 'choice' && !ch) return undefined;
    const next = ch ? ch.next : s.next;
    return next == null ? i + 1 : targetIndex(next);
  }
  function routeWith(answers) {
    let result = [];
    if (typeof guide.route === 'function') {
      const custom = guide.route(answers); // 保持 this === guide。
      if (Array.isArray(custom)) result = [...new Set(custom.filter(validIndex))];
    } else {
      const seen = new Set();
      let i = 0;
      while (validIndex(i) && !seen.has(i)) {
        seen.add(i); result.push(i);
        if (steps[i].stop) break;
        i = defaultNext(i, answers);
      }
    }
    if (!result.length) result = [0];
    const stopped = result.findIndex(i => steps[i].stop);
    return stopped < 0 ? result : result.slice(0, stopped + 1);
  }
  function route(estimate = false) {
    const answers = estimate ? { ...state.answers } : state.answers;
    if (estimate) {
      for (let n = 0; n < steps.length; n++) {
        const pending = routeWith(answers).find(i => steps[i].kind === 'choice' && !(steps[i].choices || []).some(c => c.value === answers[i]));
        if (pending === undefined || !steps[pending].choices.length) break;
        answers[pending] = steps[pending].choices[0].value;
      }
    }
    const result = routeWith(answers);
    const pending = result.findIndex(i => steps[i].kind === 'choice' && !(steps[i].choices || []).some(c => c.value === answers[i]));
    return pending < 0 ? result : result.slice(0, pending + 1);
  }
  function clearAfter(index) {
    const rt = route(), pos = rt.indexOf(index);
    const after = new Set(pos < 0 ? [] : rt.slice(pos + 1));
    for (const key of Object.keys(state.done)) if (after.has(+key) || +key > index) delete state.done[key];
    for (const key of Object.keys(state.answers)) if (after.has(+key) || +key > index) delete state.answers[key];
    for (const key of Object.keys(state.checks)) if (after.has(+key) || +key > index) delete state.checks[key];
    for (const key of Object.keys(state.ticks)) if (after.has(+key) || +key > index) delete state.ticks[key];
    hist = hist.filter(i => !after.has(i) && i <= index);
  }
  function enterAnswers(index) {
    // 公共收尾步骤已有可用路线时，保留用户选过的分支。
    if (route().includes(index)) return;
    const answers = steps[index].entryAnswers;
    if (!record(answers)) return;
    Object.keys(answers).map(Number).filter(validIndex).sort((a, b) => a - b).forEach(i => {
      const s = steps[i], value = answers[i];
      if (s.kind !== 'choice' || !s.choices.some(ch => ch.value === value)) return;
      if (state.answers[i] !== value) clearAfter(i);
      state.answers[i] = value; state.done[i] = true;
    });
  }
  function hashIndex() {
    try { return indexOfId(decodeURIComponent(location.hash.slice(1))); } catch { return undefined; }
  }
  function previous(rt) {
    for (let n = hist.length - 1; n >= 0; n--) if (hist[n] !== current && rt.includes(hist[n])) return hist[n];
    return rt[rt.indexOf(current) - 1];
  }

  /* ---------- G 样式内容组件 ---------- */
  const block = (title, inner) => inner ? `<section class="block">${title ? `<h2 class="block-title">${esc(fill(title))}</h2>` : ''}${inner}</section>` : '';
  const facts = rows => rows && rows.length ? `<div class="facts">${rows.map(r => `<div class="fact"><strong>${esc(fill(r[0]))}</strong><span>${html(r[1])}</span></div>`).join('')}</div>` : '';
  function ticks(items, idx) {
    if (!items || !items.length) return '';
    const st = state.ticks[idx] || [];
    return `<div class="list">${items.map((t, k) => `<label class="tick"><input type="checkbox" data-tick="${k}"${st[k] ? ' checked' : ''}><span class="tick-text">${html(t)}</span></label>`).join('')}</div><p class="list-hint">勾选只是帮你记位置，不影响继续。</p>`;
  }
  function checks(step, idx) {
    const st = state.checks[idx] || [];
    return `<div class="list">${step.checks.map((t, k) => `<label class="tick"><input type="checkbox" data-check="${k}"${st[k] ? ' checked' : ''}><span class="tick-text">${html(t)}</span></label>`).join('')}</div>`;
  }
  function images(items) {
    if (!items || !items.length) return '';
    return `<div class="gallery">${items.map(it => {
      const src = safeImageUrl(it.src);
      if (!src) return '';
      return `<figure class="shot${it.layout === 'phone' ? ' phone' : ''}"><button type="button" data-img="${esc(src)}" data-cap="${esc(fill(it.caption || it.alt || ''))}" aria-label="放大查看：${esc(fill(it.alt || ''))}"><img src="${esc(src)}" alt="${esc(fill(it.alt || ''))}" loading="lazy" decoding="async"><span class="zoom">${icon('zoom')}放大</span></button>${it.caption || it.alt ? `<figcaption>${html(it.caption || it.alt)}</figcaption>` : ''}</figure>`;
    }).join('')}</div>`;
  }
  function note(text, tone) {
    if (!text || (Array.isArray(text) && !text.length)) return '';
    const warning = /warn|blocked|alert/.test(tone || '');
    const name = tone === 'tip' ? '提示' : warning ? '小心' : '注意';
    const body = Array.isArray(text) ? text.map(t => `<p>${html(t)}</p>`).join('') : html(text);
    return `<div class="note${tone === 'tip' ? ' tip' : warning ? ' warn' : ''}" role="note"><span class="tag" aria-hidden="true"><span class="sticker">${name}</span></span>${body}</div>`;
  }
  function links(items) {
    if (!items || !items.length) return '';
    return `<div class="links">${items.map(it => {
      const u = safeUrl(it.url), ext = externalUrl(u);
      const host = ext ? new URL(u).hostname : '';
      const inner = `<span><b>${esc(fill(it.label))}</b>${it.desc ? `<small class="link-desc">${html(it.desc)}</small>` : ''}<small>${u ? ext ? esc(host) + '，新标签页打开' : it.download ? '下载到本机' : 'Plus Guide 站内教程' : '先在前面填好参数，这里会变成链接'}</small></span>`;
      return u ? `<a class="link" href="${esc(u)}"${it.download ? ` download="${esc(typeof it.download === 'string' ? it.download : '')}"` : ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(ext ? 'globe' : 'book')}${inner}<span class="ext">${icon(ext ? 'external' : 'arrow')}</span></a>` : `<span class="link">${icon('lock')}${inner}</span>`;
    }).join('')}</div>`;
  }
  function see(items) {
    if (!items || !items.length) return '';
    return `<div class="see">${items.map(it => {
      const u = safeUrl(it.url), ext = externalUrl(u);
      const inner = `<b>${esc(fill(it.title))}</b>${it.why ? `<small>${html(it.why)}</small>` : ''}`;
      return u ? `<a class="link" href="${esc(u)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>` : `<span class="link">${inner}</span>`;
    }).join('')}</div>`;
  }
  function code(blocks) {
    if (!blocks || !blocks.length) return '';
    return blocks.map((b, k) => {
      const raw = Array.isArray(b.text) ? b.text.join('\n') : String(b.text || '');
      const body = esc(fill(raw)).replace(TOKEN, (m, key) => `<span class="todo">待填入${esc(label(key))}</span>`).replace(/^(?!.*\{\{)(\s*)(#.*)$/gm, '$1<span class="cmt">$2</span>');
      return `<div class="code block"><div class="code-head"><span class="lang">${esc(b.lang || 'shell')}</span>${b.caption ? `<span class="cap">${esc(fill(b.caption))}</span>` : ''}<button class="btn btn-sm" type="button" data-copy="${k}">${icon('copy')}复制</button></div><pre>${body}</pre></div>${b.note ? note(b.note, 'tip') : ''}`;
    }).join('');
  }
  function prompt(p) {
    if (!p || !p.text) return '';
    return `<div class="prompt block"><h2 class="block-title">${esc(p.title || '让 AI 助手帮你配')}</h2>${p.intro ? `<p>${html(p.intro)}</p>` : ''}<pre data-prompt>${esc(plainFill(p.text))}</pre><button class="btn btn-violet btn-sm" type="button" data-copy-prompt>${icon('copy')}复制这段提示词</button>${p.hint ? `<p class="list-hint">${html(p.hint)}</p>` : ''}</div>`;
  }
  function inputsForm() {
    return `<div class="block">${inputs.map((f, i) => {
      const raw = rawValue(f), error = inputError(f, raw.trim());
      return `<label class="field"><span>${esc(f.label)}${f.optional ? ' <span class="sticker opt">可留空</span>' : ''}</span><input type="${f.type === 'password' ? 'password' : 'text'}" data-input="${esc(f.key)}" value="${esc(raw)}" placeholder="${esc(f.placeholder || '')}" autocomplete="off" spellcheck="false"${f.numeric ? ' inputmode="numeric"' : ''} aria-invalid="${Boolean(error)}" aria-describedby="inputError${i}"><small class="input-error" id="inputError${i}" data-error-for="${esc(f.key)}" aria-live="polite">${esc(error)}</small>${f.hint ? `<small>${esc(f.hint)}</small>` : ''}${f.example ? `<small>示例：<code>${esc(f.example)}</code></small>` : ''}</label>`;
    }).join('')}${guide.ephemeralInputs ? '<p class="list-hint">参数只留在当前页面，刷新后需要重新填写。这里不填写密码或 Key。</p>' : ''}</div>`;
  }
  function recap() {
    const fields = inputs.filter(f => !f.sensitive && f.type !== 'password');
    if (!fields.length || guide.ephemeralInputs) return '';
    return block('你填过的参数', `<div class="recap">${fields.map(f => `<div class="recap-row"><span>${esc(f.short || f.label)}</span>${val(f.key) ? `<code>${esc(val(f.key))}</code>` : '<em>还没填</em>'}</div>`).join('')}</div>`);
  }
  function promo(p) {
    if (!p || !p.code) return '';
    return `<div class="promo block"><span class="tag" aria-hidden="true"><span class="sticker">${esc(p.badge || '邀请奖励')}</span></span><b>${esc(fill(p.title || '专属邀请码'))}</b><div class="promo-row"><code id="promoCode">${esc(p.code)}</code><button class="btn btn-sm" type="button" data-copy-promo>${icon('copy')}复制邀请码</button></div>${p.reward ? `<p>${html(p.reward)}</p>` : ''}${p.hint ? `<p class="promo-hint">${html(p.hint)}</p>` : ''}</div>`;
  }
  function faqs(groups) {
    if (!groups || !groups.length) return '';
    return `<div class="faqs">${groups.map(g => `${g.label ? `<p class="faq-label">${esc(fill(g.label))}</p>` : ''}${g.items.map(it => `<details><summary>${esc(fill(it.q))}<span class="plus" aria-hidden="true">+</span></summary><p>${html(it.a)}</p></details>`).join('')}`).join('')}</div>`;
  }
  function rich(text) {
    if (!text) return '';
    // 本站维护的静态 HTML 可信；填入的浏览器参数始终转义。
    const content = text.replace(TOKEN, (m, k) => val(k) ? esc(val(k)) : `<span class="todo">${esc((fieldOf(k) || {}).token || m)}</span>`);
    return `<div class="rich block">${content}</div>`;
  }
  function downloads(step) {
    return (Array.isArray(step.downloads) ? step.downloads : []).concat(step.download ? [step.download] : []);
  }
  function downloadCards(step) {
    return downloads(step).map((d, i) => {
      if (typeof d.text !== 'string' && !safeUrl(d.url)) return '';
      return `<div class="download block">${icon('book')}<div><b>${esc(d.label || '下载文件')}</b><small>${esc(d.filename || '')}${d.note ? ' · ' + html(d.note) : ''}</small></div><button class="btn btn-sm" type="button" data-download="${i}">${icon('arrow')}下载</button></div>`;
    }).join('');
  }

  /* ---------- 渲染与门槛 ---------- */
  function remaining(step) {
    return Array.isArray(step.checks) ? step.checks.filter((_, k) => !(state.checks[current] || [])[k]).length : 0;
  }
  function canContinue(step) {
    if (!accessReady || step.stop || isDone(step) || remaining(step)) return false;
    if (step.kind === 'inputs' && inputs.some(f => inputError(f, rawValue(f).trim()))) return false;
    return typeof step.gate !== 'function' || Boolean(step.gate(state.answers, state.values, state.checks[current] || []));
  }
  function syncNext(step) {
    const next = $('nextBtn');
    if (!next) return;
    next.disabled = !canContinue(step);
    $('nextHint').textContent = remaining(step) ? `还差 ${remaining(step)} 项没勾` : next.disabled ? '请先完成本页核对' : '完成，进入下一步';
  }
  function toc(rt, pos) {
    const furthest = Math.max(pos, ...rt.map((idx, o) => state.done[idx] ? o + 1 : 0));
    let out = '', lastPhase = -1;
    rt.forEach((idx, o) => {
      const s = steps[idx], ph = s.phase || 0;
      if (ph !== lastPhase) { out += `${lastPhase >= 0 ? '</ol>' : ''}<p class="toc-phase">${esc((phases[ph] || {}).title || '')}</p><ol>`; lastPhase = ph; }
      const cur = idx === current, done = !!state.done[idx] && !cur, reach = guide.allowDirectNavigation || o <= furthest;
      out += `<li><button type="button" class="toc-step${cur ? ' current' : done ? ' done' : ''}" data-jump="${idx}"${reach && !cur ? '' : ' disabled'}${cur ? ' aria-current="step"' : ''} style="animation-delay:${(o * 0.05).toFixed(2)}s"><span class="dot" aria-hidden="true">${done ? '✓' : ''}</span>${esc(s.short || s.title)}${cur ? '<span class="here" aria-hidden="true"><span class="sticker">在这</span></span>' : ''}</button></li>`;
    });
    const last = steps[rt[rt.length - 1]];
    if (last && last.kind === 'choice' && !(last.choices || []).some(ch => ch.value === state.answers[rt[rt.length - 1]])) out += '<li><span class="toc-step"><span class="dot" aria-hidden="true"></span>选好路线后显示</span></li>';
    return out + '</ol>';
  }
  function progress(rt, pos) {
    const finish = isDone(steps[current]);
    const total = route(true).filter(i => !isDone(steps[i])).length;
    const done = rt.filter(i => state.done[i] && !isDone(steps[i])).length;
    const pct = finish ? 100 : Math.min(99, Math.round(done / Math.max(1, total) * 100));
    const text = finish ? '全部完成' : `第 ${pos + 1} / ${Math.max(route(true).length, pos + 1)} 步`;
    $('progText').textContent = text; $('mProgText').textContent = text;
    $('fill').style.width = pct + '%'; $('mFill').style.width = pct + '%';
    $('progBar').setAttribute('aria-valuenow', pct);
  }
  function body(step, idx) {
    let out = note(step.alert, 'warn');
    if (step.seeAlsoPosition === 'before') out += block('相关', see(step.seeAlso));
    const missing = missingKeys(step);
    if (step.kind !== 'inputs' && missing.length) out += note(`这一步要用到${missing.map(k => `「${label(k)}」`).join('、')}。还没填的话，先回「填写参数」那一步补上，下面的内容会自动替换。`, 'blocked');
    if (step.kind === 'choice') out += `<div class="choices">${(step.choices || []).map(c => `<button type="button" class="choice" data-choice="${esc(c.value)}" aria-pressed="${state.answers[idx] === c.value}"><span class="ico">${icon(c.icon || 'grid')}</span><strong>${esc(fill(c.title))}</strong><span class="copy">${esc(fill(c.copy || ''))}</span></button>`).join('')}</div><p class="choice-note">${html(step.hint || '选择会决定后面的步骤，随时可以回来改。')}</p>`;
    if (step.kind === 'inputs') out += inputsForm() + recap();
    out += promo(step.promo);
    out += block(step.kind === 'info' ? '开始前看一眼' : '先对照你的情况', facts(step.facts));
    out += rich(step.html) + code(step.code);
    out += block('跟着做', ticks(step.bullets, idx));
    out += block('', images(step.images)) + prompt(step.agentPrompt) + downloadCards(step);
    if (Array.isArray(step.checks)) out += block(step.checksTitle || '逐项核对', checks(step, idx));
    out += (step.doneGroups || []).map(g => block(g.title, `<div class="list">${g.items.map(t => `<div class="tick static-tick">${html(t)}</div>`).join('')}</div>`)).join('');
    if (isDone(step)) out += recap();
    out += note(step.note, step.noteTone) + note(step.warn, 'warn') + note(step.tip, 'tip');
    out += block('官方说明', links(step.links));
    if (step.seeAlsoPosition !== 'before') out += block(isDone(step) ? '接着看' : '相关', see(step.seeAlso));
    out += block(step.kind === 'faq' ? '' : '常见问题', faqs(step.faqGroups));
    return out;
  }
  function render(entering) {
    const rt = route();
    let pos = rt.indexOf(current);
    if (pos < 0) { current = rt[rt.length - 1]; pos = rt.length - 1; }
    hist = hist.filter(i => rt.includes(i));
    const source = steps[current];
    // IP 分支截图按答案生成，每次渲染仅求值一次。
    const step = typeof source.images === 'function' ? { ...source, images: source.images(state.answers) } : source;
    const phase = phases[step.phase || 0] || {};
    const prev = previous(rt), prevStep = steps[prev];
    progress(rt, pos);
    $('toc').innerHTML = toc(rt, pos); $('mToc').innerHTML = toc(rt, pos);
    const finish = isDone(step), choice = step.kind === 'choice';
    const heading = fill(step.title).replace(/^第\s*[\d一二三四五六七八九十百]+\s*步\s*[:：、.]?\s*/, '');
    const title = finish ? `<div class="done-hero"><span class="burst" aria-hidden="true"><span class="sticker">搞定！</span></span><h1 id="stepTitle" tabindex="-1">${esc(heading)}</h1><p>${html(step.intro || '')}</p></div>` : `<div class="step-meta"><span class="sticker">第 ${pos + 1} 步</span><span>${esc(phase.title || '')}</span></div><h1 id="stepTitle" tabindex="-1">${esc(heading)}</h1><p class="intro">${html(step.intro || '')}</p>`;
    const next = finish ? `<a class="nav-next" href="${esc(home)}"><small>这篇做完了</small><b>回到全部教程</b></a>` : choice || step.stop ? '<span></span>' : `<button class="nav-next" type="button" id="nextBtn"><small id="nextHint">完成，进入下一步</small><b>${esc(fill(step.button || (step.kind === 'inputs' ? '保存，继续' : '做完了，下一步')))}</b></button>`;
    const el = $('step');
    el.innerHTML = `${title}${body(step, current)}<div class="nav"><button class="nav-prev" type="button" id="prevBtn"${prevStep ? '' : ' disabled'}><small>上一步</small><b>${esc(prevStep ? prevStep.short || prevStep.title : '')}</b></button>${next}</div>${!choice && step.hint ? `<p class="nav-hint">${html(step.hint)}</p>` : ''}${choice || step.stop || finish ? '' : '<p class="keys">键盘：<kbd>←</kbd>上一步 <kbd>→</kbd>下一步</p>'}`;
    $('coach').textContent = fill(step.coach || (finish ? '这篇走完了。问答里是大家常踩的坑，对不上的地方带着截图进群问。' : '这一步做完、核对过再继续。对不上号的地方，带着截图进群问。'));
    document.title = `${guide.title} · Plus Guide`;
    bind(step); syncNext(step); save();
    if (entering) {
      el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter');
      $('toc').classList.remove('first'); $('mobileToc').open = false;
      scrollTo({ top: 0, behavior: 'auto' }); $('stepTitle').focus({ preventScroll: true });
    } else el.classList.add('enter');
  }

  /* ---------- 交互 ---------- */
  function toast(text) {
    const t = $('toast');
    t.innerHTML = `<span class="sticker">${esc(text)}</span>`;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.innerHTML = ''; }, 1500);
  }
  function copy(text, btn) {
    const done = () => { const o = btn.innerHTML; btn.innerHTML = '已复制'; setTimeout(() => { btn.innerHTML = o; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => toast('复制没成功，请手动选择文字'));
    else {
      const a = document.createElement('textarea'); a.value = text; a.style.position = 'fixed'; a.style.top = '-1000px'; document.body.append(a); a.select();
      try { if (document.execCommand('copy')) done(); else toast('复制没成功，请手动选择文字'); } catch { toast('复制没成功，请手动选择文字'); }
      a.remove();
    }
  }
  function downloadFile(d) {
    const link = document.createElement('a');
    const generated = typeof d.text === 'string';
    const url = generated ? URL.createObjectURL(new Blob([d.text], { type: d.type || 'text/plain;charset=utf-8' })) : safeUrl(d.url);
    if (!url) return;
    link.href = url; link.download = d.filename || ''; document.body.append(link); link.click(); link.remove();
    if (generated) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function openImage(button) {
    const img = button.querySelector('img');
    const src = safeImageUrl(button.dataset.img || button.dataset.image || (img && img.src));
    if (!src) return;
    $('imgFull').src = src; $('imgFull').alt = img ? img.alt : '';
    $('imgCaption').textContent = button.dataset.cap || button.dataset.caption || button.dataset.imageCaption || (img && img.alt) || '参考图片';
    $('imgDialog').showModal();
  }
  function bind(step) {
    const el = $('step');
    $('prevBtn').addEventListener('click', back);
    if ($('nextBtn')) $('nextBtn').addEventListener('click', () => complete(step));
    el.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => choose(step, b.dataset.choice)));
    el.querySelectorAll('[data-action="goto"][data-step]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); goToId(b.dataset.step); }));
    el.querySelectorAll('[data-tick]').forEach(inp => inp.addEventListener('change', () => {
      state.ticks[current] = [...el.querySelectorAll('[data-tick]')].map(x => x.checked); syncNext(step); save();
    }));
    el.querySelectorAll('[data-check]').forEach(inp => {
      const k = Number(inp.dataset.check);
      if (Number.isInteger(k)) inp.checked = (state.checks[current] || [])[k] === true;
      inp.addEventListener('change', () => {
        if (!Number.isInteger(k) || k < 0) return;
        const values = state.checks[current] || [];
        values[k] = inp.checked;
        state.checks[current] = values;
        // 富文本中的同名核对框与标准清单保持一致。
        el.querySelectorAll('[data-check]').forEach(other => { if (Number(other.dataset.check) === k) other.checked = inp.checked; });
        syncNext(step); save();
      });
    });
    el.querySelectorAll('[data-input]').forEach(inp => inp.addEventListener('input', () => {
      const f = fieldOf(inp.dataset.input);
      if (!f) return;
      state.values[f.key] = inp.value.slice(0, 300);
      const error = inputError(f, inp.value.trim());
      inp.setAttribute('aria-invalid', String(Boolean(error)));
      const errorEl = [...el.querySelectorAll('[data-error-for]')].find(x => x.dataset.errorFor === f.key);
      if (errorEl) errorEl.textContent = error;
      syncNext(step); save();
      const r = el.querySelector('.recap'); if (r) r.closest('.block').outerHTML = recap();
    }));
    const pc = el.querySelector('[data-copy-promo]'); if (pc) pc.addEventListener('click', () => copy($('promoCode').textContent.trim(), pc));
    el.querySelectorAll('[data-img], .image-trigger, [data-image]').forEach(b => b.addEventListener('click', () => openImage(b)));
    el.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
      const blk = (step.code || [])[+b.dataset.copy];
      if (blk) copy(plainFill(Array.isArray(blk.text) ? blk.text.join('\n') : String(blk.text || '')), b);
    }));
    el.querySelectorAll('.rich pre').forEach(pre => {
      const text = (pre.querySelector('code') || pre).textContent.replace(/\n$/, '');
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-sm rich-copy'; b.innerHTML = `${icon('copy')}复制`;
      b.addEventListener('click', () => copy(plainFill(text), b)); pre.append(b);
    });
    el.querySelectorAll('[data-download]').forEach(b => b.addEventListener('click', () => { const d = downloads(step)[+b.dataset.download]; if (d) downloadFile(d); }));
    const cp = el.querySelector('[data-copy-prompt]'); if (cp) cp.addEventListener('click', () => copy(plainFill(step.agentPrompt.text), cp));
    document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { if (!b.disabled) moveTo(+b.dataset.jump); }));
  }
  function moveTo(i) {
    if (!accessReady || !validIndex(i) || i === current || !route().includes(i)) return;
    hist.push(current); current = i; render(true);
  }
  function goToId(id) {
    if (!accessReady) return;
    const i = indexOfId(id);
    if (!validIndex(i)) return;
    if (i > current && !canContinue(steps[current]) && steps[current].kind !== 'choice') return;
    enterAnswers(i);
    if (!route().includes(i)) return;
    if (i > current && !steps[current].stop && steps[current].kind !== 'choice') state.done[current] = true;
    moveTo(i);
  }
  function back() {
    if (!accessReady) return;
    const rt = route();
    let i;
    while (hist.length) { const candidate = hist.pop(); if (candidate !== current && rt.includes(candidate)) { i = candidate; break; } }
    if (i === undefined) i = rt[rt.indexOf(current) - 1];
    if (!validIndex(i)) return;
    current = i; render(true);
  }
  function choose(step, value) {
    if (!accessReady || step.stop) return;
    const ch = (step.choices || []).find(c => String(c.value) === String(value));
    if (!ch || !canContinue(step)) return;
    if (state.answers[current] !== ch.value) clearAfter(current);
    state.answers[current] = ch.value; state.done[current] = true;
    const rt = route(), next = rt[rt.indexOf(current) + 1];
    toast(`选好了：${ch.title}`);
    if (validIndex(next)) moveTo(next); else render(false);
  }
  function complete(step) {
    if (!canContinue(step) || step.kind === 'choice') return;
    state.done[current] = true;
    const rt = route(), pos = rt.indexOf(current), next = rt[pos + 1];
    toast(`第 ${pos + 1} 步搞定！`);
    if (validIndex(next)) moveTo(next); else render(false);
  }

  /* ---------- 访问前确认：Plus 原契约 ---------- */
  function openGate(gate) {
    try { if (localStorage.getItem(gate.key)) return; } catch { /* 读不到就照常显示。 */ }
    accessReady = false;
    const dialog = $('gateDialog');
    dialog.innerHTML = `<div class="gate-panel"><span class="sticker">访问前确认</span><h2 id="gateTitle">${esc(gate.title)}</h2><p id="gateLead" class="gate-lead">${esc(gate.lead || '')}</p><div class="gate-scroll" id="gateScroll" tabindex="0">${(gate.sections || []).map(([title, text]) => `<p><b>${esc(title)}：</b>${esc(text)}</p>`).join('')}</div><p class="gate-status" id="gateStatus" role="status">请先滑动到声明底部</p><button class="btn btn-violet" id="gateAgree" type="button" disabled>同意，进入教程${icon('arrow')}</button><p class="gate-foot">${esc(gate.footer || '')}</p></div>`;
    dialog.addEventListener('cancel', e => e.preventDefault());
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    const scroller = $('gateScroll'), status = $('gateStatus'), agree = $('gateAgree');
    let readyAt = null, timer = null;
    const tick = () => {
      const left = Math.ceil((readyAt - Date.now()) / 1000);
      if (left > 0) { status.textContent = `已读到底部，${left} 秒后可以同意`; return; }
      clearInterval(timer); status.textContent = '可以点「同意」进入教程了'; agree.disabled = false;
    };
    const check = () => {
      if (readyAt !== null || scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 4) return;
      readyAt = Date.now() + (gate.wait || 6) * 1000;
      tick(); timer = setInterval(tick, 250);
    };
    scroller.addEventListener('scroll', check, { passive: true });
    requestAnimationFrame(check);
    agree.addEventListener('click', () => {
      if (agree.disabled) return;
      try { localStorage.setItem(gate.key, new Date().toISOString()); } catch { /* 本次照样放行。 */ }
      clearInterval(timer); dialog.close(); document.documentElement.style.overflow = overflow;
      accessReady = true; syncNext(steps[current]); $('stepTitle').focus({ preventScroll: true });
    });
    scroller.focus({ preventScroll: true });
  }

  /* ---------- IP 原访问声明：拒绝记录优先 ---------- */
  function readMarker(key) {
    try { return key && localStorage.getItem(key); } catch { return null; }
  }
  function showDenied(consent) {
    accessReady = false; $('guideShell').hidden = true; $('accessPanel').hidden = false;
    try { localStorage.setItem(consent.deniedStorageKey, JSON.stringify({ version: consent.version || 1, deniedAt: new Date().toISOString() })); } catch { /* 当次仍显示拒绝结果。 */ }
    const denied = consent.denied || {};
    document.title = denied.documentTitle || denied.title || guide.title;
    $('accessPanel').innerHTML = `<section class="access-card denied-card" id="accessDenied" tabindex="-1"><span class="sticker">访问声明</span><h1>${esc(denied.title || '')}</h1><p>${esc(denied.text || '')}</p></section>`;
    $('accessDenied').focus({ preventScroll: true });
  }
  function openConsent(consent) {
    if (readMarker(consent.deniedStorageKey)) { showDenied(consent); return; }
    if (readMarker(consent.storageKey)) { showGuide(); return; }
    $('guideShell').hidden = true; $('accessPanel').hidden = false;
    const panel = $('accessPanel');
    panel.innerHTML = `<section class="access-card"><span class="sticker">${esc(consent.kicker || '')}</span><h1>${esc(consent.title || '')}</h1><p class="intro">${esc(consent.intro || '')}</p>${rich(consent.html)}<h2 class="block-title">${esc(consent.purposeTitle || '')}</h2><div class="choices">${(consent.purposes || []).map(p => `<button class="choice" type="button" data-purpose="${esc(p.value)}" aria-pressed="false"><span class="ico">${icon(p.icon || 'book')}</span><strong>${esc(p.title)}</strong><span class="copy">${esc(p.copy || '')}</span></button>`).join('')}</div><form class="consent-form" id="consentForm" hidden><label class="tick"><input type="checkbox" id="consentCheck"><span>${esc(consent.checkboxLabel || '')}</span></label><label class="field" for="consentPhrase"><span>${esc(consent.inputLabel || '')}</span><span class="consent-phrase">${esc(consent.phrase || '')}</span><input id="consentPhrase" type="text" placeholder="${esc(consent.inputPlaceholder || '')}" autocomplete="off" spellcheck="false"></label><button class="btn btn-violet" id="consentAgree" type="submit" disabled>${esc(consent.button || '')}</button>${consent.note ? `<p class="list-hint">${esc(consent.note)}</p>` : ''}</form></section>`;
    panel.querySelectorAll('[data-purpose]').forEach(button => button.addEventListener('click', () => {
      const purpose = consent.purposes.find(p => p.value === button.dataset.purpose);
      if (!purpose) return;
      if (purpose.deny || purpose.value !== consent.purpose) { showDenied(consent); return; }
      panel.querySelectorAll('[data-purpose]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      $('consentForm').hidden = false; $('consentCheck').focus({ preventScroll: true });
    }));
    const ready = () => !$('consentForm').hidden && $('consentCheck').checked && $('consentPhrase').value.trim() === consent.phrase;
    const sync = () => { $('consentAgree').disabled = !ready(); };
    $('consentCheck').addEventListener('change', sync); $('consentPhrase').addEventListener('input', sync);
    $('consentForm').addEventListener('submit', e => {
      e.preventDefault(); if (!ready()) return;
      try { localStorage.setItem(consent.storageKey, JSON.stringify({ version: consent.version || 1, purpose: consent.purpose, acceptedAt: new Date().toISOString() })); } catch { /* 存储不可用仍允许本次访问。 */ }
      showGuide(true);
    });
  }

  /* ---------- 外壳与启动 ---------- */
  const home = safeUrl(guide.homeHref || $('homeLink').getAttribute('href') || '../') || '../';
  $('guideTitle').textContent = guide.title;
  $('homeLink').href = home;
  const all = new URL(home, location.href); all.hash = 'tutorials'; $('allLink').href = all.href;
  const CATEGORIES = { account: '账号与订阅', tools: 'AI 工具', coding: '云端开发' };
  const cat = typeof guide.category === 'string' ? { title: CATEGORIES[guide.category] || guide.category, href: home + '#' + guide.category } : guide.category;
  if (cat && cat.title) { $('catLink').textContent = cat.title; $('catLink').href = safeUrl(cat.href || home) || home; }
  else $('catLink').parentElement.hidden = true;
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (!accessReady || e.altKey || e.ctrlKey || e.metaKey || (active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable)) || document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowLeft' && $('prevBtn') && !$('prevBtn').disabled) { e.preventDefault(); back(); }
    if (e.key === 'ArrowRight' && $('nextBtn') && !$('nextBtn').disabled) { e.preventDefault(); $('nextBtn').click(); }
  });
  $('imgClose').addEventListener('click', () => $('imgDialog').close());
  $('imgDialog').addEventListener('click', e => { if (e.target === $('imgDialog')) $('imgDialog').close(); });
  $('resetRow').addEventListener('click', e => {
    if (!accessReady) return;
    const row = $('resetRow');
    if (e.target.id === 'resetBtn') row.innerHTML = '<button class="btn btn-sm btn-ink" type="button" id="resetYes">清除进度，从头开始</button><button class="btn btn-sm" type="button" id="resetNo">算了</button>';
    if (e.target.id === 'resetNo' || e.target.id === 'resetYes') {
      if (e.target.id === 'resetYes') {
        Object.assign(state, { values: {}, done: {}, checks: {}, answers: {}, ticks: {} }); current = 0; hist = [];
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* 仅重置教程进度。 */ }
        render(true); toast('已从头开始');
      }
      row.innerHTML = '<button class="btn btn-sm" type="button" id="resetBtn">重新开始</button>';
    }
  });
  window.addEventListener('hashchange', () => {
    if (!accessReady) return;
    const i = hashIndex();
    if (!validIndex(i) || i === current) return;
    enterAnswers(i); moveTo(i);
  });
  function showGuide(focus = false) {
    $('guideShell').hidden = false; $('accessPanel').hidden = true;
    const i = hashIndex();
    if (validIndex(i)) { enterAnswers(i); current = i; }
    accessReady = true; render(focus);
    if (guide.gate) openGate(guide.gate);
  }
  if (guide.consent) openConsent(guide.consent); else showGuide();
})();

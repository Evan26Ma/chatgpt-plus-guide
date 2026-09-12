// The tutorial content lives in app.js; this file owns presentation and navigation.
const STORAGE_KEY = 'guidedFlowStateV5';
const iconPaths = {
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  userPlus: '<circle cx="10" cy="8" r="3.5"/><path d="M3 21v-2a7 7 0 0 1 10-6.3M18 12v8m-4-4h8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  plus: '<rect x="4" y="4" width="16" height="16" rx="5"/><path d="M8 12h8m-4-4v8"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  cursor: '<path d="m5 3 5 17 3-7 7-3L5 3Z"/>',
  zoom: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
  book: '<path d="M12 5v16m0-16C9 2 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-2-1-6-2-9 1Z"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>'
};
const phases = [
  { title: '了解你的账户', copy: '确认账户与订阅状态', icon: 'user' },
  { title: '准备网络环境', copy: '完成配置与网络检查', icon: 'globe' },
  { title: '准备支付方式', copy: '跟着图文完成准备', icon: 'card' },
  { title: '开通与后续', copy: '完成订阅及后续步骤', icon: 'circleCheck' }
];
const phaseByStep = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3];
const imageSizes = {
  'binance-buy.jpg': [1907, 1329], 'binance-c2c.jpg': [1978, 1348], 'binance-withdraw.jpg': [1889, 1175],
  'ippure-reference.png': [683, 230], 'ph-node-reference.png': [1622, 970], 'ph-plus-pricing.png': [408, 717], 'roogoo-arrived.jpg': [2506, 1490],
  'roogoo-card-entry.png': [1137, 723], 'roogoo-deposit-menu.png': [1773, 887],
  'roogoo-enjoy-card.jpg': [1579, 1485], 'roogoo-enjoy-select.png': [860, 932],
  'ph-pay-vat.png': [1849, 1048], 'ph-billing-taxfree.png': [1302, 1208], 'ph-subscribe-982.png': [889, 838],
  'ph-plus-welcome.png': [756, 720], 'ph-settled.png': [2170, 725]
};
let storageAvailable = true;
function loadState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const clean = {};
    steps.forEach((step, index) => {
      if (step.kind === 'choice') {
        if (step.choices.some(choice => choice.value === value[index])) clean[index] = value[index];
      } else if (value[index] === true) clean[index] = true;
    });
    if (Number.isInteger(value.current) && value.current >= 0 && value.current < steps.length) clean.current = value.current;
    if (Array.isArray(value.history)) clean.history = [...new Set(value.history.filter(index => Number.isInteger(index) && index >= 0 && index < (clean.current || 0)))];
    if (clean[2]) clean.sourceBlocked = clean[2];
    if (clean[3] && clean[3] !== 'ready') clean.proxyBlocked = true;
    if (Array.isArray(value.checks)) clean.checks = steps[12].checks.map((_, i) => value.checks[i] === true);
    return clean;
  } catch (error) {
    if (!(error instanceof SyntaxError)) storageAvailable = false;
    return {};
  }
}
const state = loadState();
let current = state.current || 0;
let history = state.history || [];
const card = document.getElementById('stepCard');
const coachText = document.getElementById('coachText');
const handoffStatus = document.getElementById('handoffStatus');
const imageDialog = document.getElementById('imageDialog');
const resetDialog = document.getElementById('resetDialog');
const accessGate = document.getElementById('accessGate');
const appShell = document.getElementById('appShell');
const purposeGrid = document.getElementById('purposeGrid');
const consentForm = document.getElementById('consentForm');
const consentCheckbox = document.getElementById('consentCheckbox');
const consentInput = document.getElementById('consentInput');
const consentSubmit = document.getElementById('consentSubmit');
const accessDenied = document.getElementById('accessDenied');
const ACCESS_GRANTED_KEY = 'plusGuideAccessConsentV1';
const ACCESS_DENIED_KEY = 'plusGuideAccessDeniedV1';
const CONSENT_PHRASE = '本人已阅读并同意本声明，仅将本教程用于ChatGPT Plus开通及相关学习交流，不用于任何其他用途，并自行承担相关使用责任。';

function icon(name, className = '') {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${className}">${iconPaths[name] || iconPaths.plus}</svg>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function readAccessFlag(key) {
  try { return Boolean(localStorage.getItem(key)); } catch { return false; }
}
function storeAccessFlag(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Access is still enforced for this page load. */ }
}
function denyAccess() {
  storeAccessFlag(ACCESS_DENIED_KEY, JSON.stringify({ version: 1, deniedAt: new Date().toISOString() }));
  purposeGrid.hidden = true;
  consentForm.hidden = true;
  accessDenied.hidden = false;
  appShell.hidden = true;
  accessGate.hidden = false;
  accessDenied.focus({ preventScroll: true });
  document.title = '访问已拒绝 · Plus 开通向导';
}
function updateConsentButton() {
  consentSubmit.disabled = !consentCheckbox.checked || consentInput.value.trim() !== CONSENT_PHRASE;
}
function grantAccess() {
  if (consentSubmit.disabled) return;
  storeAccessFlag(ACCESS_GRANTED_KEY, JSON.stringify({ version: 1, purpose: 'chatgpt-plus', acceptedAt: new Date().toISOString() }));
  accessGate.hidden = true;
  appShell.hidden = false;
  render(true);
}
function initAccessGate() {
  if (readAccessFlag(ACCESS_DENIED_KEY)) {
    denyAccess();
    return false;
  }
  if (readAccessFlag(ACCESS_GRANTED_KEY)) {
    accessGate.hidden = true;
    appShell.hidden = false;
    return true;
  }
  appShell.hidden = true;
  accessGate.hidden = false;
  purposeGrid.querySelectorAll('[data-purpose]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.purpose === 'other') {
      denyAccess();
      return;
    }
    purposeGrid.hidden = true;
    consentForm.hidden = false;
    consentInput.focus();
  }));
  consentCheckbox.addEventListener('change', updateConsentButton);
  consentInput.addEventListener('input', updateConsentButton);
  consentSubmit.addEventListener('click', grantAccess);
  return false;
}
function save() {
  state.current = current;
  state.history = [...history];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  document.getElementById('saveStatus').innerHTML = `<span class="status-dot"></span>${storageAvailable ? '进度自动保存' : '当前进度暂未保存'}`;
  document.getElementById('saveNoteTitle').textContent = storageAvailable ? '走到哪，就记到哪' : '当前浏览器无法保存进度';
  document.getElementById('saveNoteCopy').textContent = storageAvailable ? '进度保存在当前浏览器，下次打开可以接着来。' : '你仍然可以继续使用，关闭页面后需要重新开始。';
}
function route() {
  const result = [0];
  if (state[0] !== 'new') {
    result.push(1);
    if (state[1] === 'subscribed') return [...result, 2];
  }
  result.push(3, 4);
  if (state[0] !== 'existing') result.push(5);
  return [...result, 6, 7, 8, 9, 10, 11, 12, 13, 14];
}
function links(items = []) {
  if (!items.length) return '';
  return `<div class="link-row">${items.map(item => {
    let domain = '';
    try { domain = new URL(item.url).hostname; } catch { /* Keep the supplied label visible. */ }
    return `<a class="link-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><span class="link-icon">${icon('globe')}</span><span class="link-content"><span class="link-label">${escapeHtml(item.label)}</span><span class="link-domain">${escapeHtml(domain)} · 新标签页打开</span></span>${icon('external', 'link-external')}</a>`;
  }).join('')}</div>`;
}
function bullets(items = []) {
  return items.length ? `<ol class="instructions">${items.map(item => `<li class="instruction"><span>${escapeHtml(item)}</span></li>`).join('')}</ol>` : '';
}
function callout(text, blocked = false) {
  return `<div class="callout${blocked ? ' blocked' : ''}"${blocked ? ' role="status" tabindex="-1"' : ''}>${icon('info')}<span>${escapeHtml(text)}</span></div>`;
}
function images(items = []) {
  if (!items.length) return '';
  return `<div class="reference-gallery">${items.map(item => {
    const size = imageSizes[item.src.split('/').pop()];
    const dimensions = size ? ` width="${size[0]}" height="${size[1]}"` : '';
    return `<figure class="reference-figure"><button class="image-trigger" type="button" data-image="${escapeHtml(item.src)}" data-caption="${escapeHtml(item.caption || item.alt)}" aria-label="放大查看：${escapeHtml(item.alt)}"><img class="reference-image" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}"${dimensions} loading="lazy" decoding="async"/><span class="zoom-label">${icon('zoom')}点击放大</span></button><figcaption class="image-caption">${escapeHtml(item.caption || item.alt)}</figcaption></figure>`;
  }).join('')}</div>`;
}
function faq(groups = []) {
  if (!groups.length) return '';
  return `<div class="faq-groups">${groups.map((group, groupIndex) => `<section class="faq-group"><h3 class="faq-group-title">${escapeHtml(group.label)}</h3><div class="faq-list">${group.items.map((item, itemIndex) => `<details class="faq-item"${groupIndex === 0 && itemIndex === 0 ? ' open' : ''}><summary><span class="faq-chevron">${icon('chevron')}</span><span class="faq-q">${escapeHtml(item.q)}</span></summary><p class="faq-a">${escapeHtml(item.a)}</p></details>`).join('')}</div></section>`).join('')}</div>`;
}
function bindImageTriggers(root) {
  root.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    const image = document.getElementById('imageDialogImage');
    image.src = button.dataset.image;
    image.alt = button.querySelector('img').alt;
    document.getElementById('imageDialogCaption').textContent = button.dataset.caption;
    imageDialog.showModal();
    imageDialog.querySelector('.image-dialog-scroll').scrollTop = 0;
  }));
}
function updateProgress() {
  const phase = phaseByStep[current];
  const finished = current >= 13;
  const activeRoute = route();
  const completed = activeRoute.filter(index => index < current && state[index]).length;
  const total = activeRoute.filter(index => index !== 13).length;
  const percent = finished ? 100 : Math.min(99, Math.round(completed / total * 100));
  document.getElementById('phaseList').innerHTML = phases.map((item, index) => {
    const done = finished || index < phase;
    const active = !finished && index === phase;
    return `<li class="phase${done ? ' done' : active ? ' active' : ''}"${active ? ' aria-current="step"' : ''}><span class="phase-icon">${icon(done ? 'check' : item.icon)}</span><span><span class="phase-label">${item.title}</span><span class="phase-copy">${done ? '这一阶段已完成' : item.copy}</span></span></li>`;
  }).join('');
  document.getElementById('progressLabel').textContent = finished ? '这段旅程，已经完成' : current === 0 ? '先从了解你的账户开始' : `当前：${phases[phase].title}`;
  document.getElementById('progressCount').textContent = `已完成 ${completed} 步`;
  document.getElementById('progressPercent').textContent = `${percent}%`;
  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressTrack').setAttribute('aria-valuenow', percent);
  return activeRoute.indexOf(current) + 1;
}
function moveTo(index) {
  history.push(current);
  current = index;
  render(true);
}
function back() {
  if (current === 0) return;
  const activeRoute = route();
  current = history.length ? history.pop() : activeRoute[Math.max(0, activeRoute.indexOf(current) - 1)];
  render(true);
}
function choose(value) {
  if (state[current] !== value) {
    // A changed answer invalidates the later route and its completion state.
    Object.keys(state).forEach(key => { if (/^\d+$/.test(key) && Number(key) > current) delete state[key]; });
    delete state.sourceBlocked;
    delete state.proxyBlocked;
    delete state.checks;
  }
  state[current] = value;
  if (current === 2) {
    state.sourceBlocked = value;
    render();
    card.querySelector('.blocked').focus({ preventScroll: true });
    return;
  }
  if (current === 3 && value !== 'ready') {
    state.proxyBlocked = true;
    render();
    card.querySelector('.blocked').focus({ preventScroll: true });
    return;
  }
  const destination = current === 0 ? (value === 'existing' ? 1 : 3)
    : current === 1 ? (value === 'subscribed' ? 2 : 3)
    : 4;
  moveTo(destination);
}
function complete() {
  if (current === 13) {
    moveTo(14);
    return;
  }
  if (current >= 14) return;
  if (steps[current].kind === 'checks' && steps[current].checks.some((_, index) => !state.checks?.[index])) return;
  state[current] = true;
  moveTo(current === 4 ? (state[0] === 'new' ? 5 : 6) : current + 1);
}
function render(focus = false) {
  const step = steps[current];
  const stepNumber = updateProgress();
  const finished = current === 13;
  const journeyDone = current >= 13;
  const blocked = (current === 2 && Boolean(state.sourceBlocked)) || (current === 3 && Boolean(state.proxyBlocked));
  const choiceIcons = { existing: 'user', new: 'userPlus', none: 'plus', subscribed: 'circleCheck', apple: 'phone', google: 'phone', web: 'card', third_party: 'grid', ready: 'globe', unready: 'info' };
  let body = '';
  if (step.kind === 'choice') {
    body = `<div><div class="choice-grid">${step.choices.map(choice => `<button class="choice${state[current] === choice.value ? ' selected' : ''}" data-choice="${choice.value}" type="button" aria-pressed="${state[current] === choice.value}"><span class="choice-icon">${icon(choiceIcons[choice.value])}</span><span class="choice-arrow">${icon(state[current] === choice.value ? 'check' : 'arrow')}</span><span class="choice-title">${escapeHtml(choice.title)}</span><span class="choice-copy">${escapeHtml(choice.copy)}</span></button>`).join('')}</div><p class="choice-note">${icon('info')}你的选择会决定后续步骤，随时可以返回修改。</p></div>`;
    if (blocked) body += callout(current === 2
      ? '当前账户已有有效订阅。请等待当前订阅周期结束后，再使用没有有效订阅的账户进入本流程。'
      : '不会使用网络代理暂不满足本向导的使用门槛。请先自行学习代理的配置与使用——能自己导入订阅、选节点、开全局之后，再回来继续。', true);
  } else if (step.kind === 'checks') {
    body = `<div class="check-list">${step.checks.map((item, index) => `<label class="check-item"><input type="checkbox" data-check="${index}"${state.checks?.[index] ? ' checked' : ''}/><span>${escapeHtml(item)}</span></label>`).join('')}</div>`;
  } else if (step.kind === 'faq') {
    body = faq(step.faqGroups);
  } else {
    body = links(step.links) + bullets(step.bullets) + images(step.kind === 'image' ? [{ src: step.image, alt: step.imageAlt }] : step.images);
  }
  if (step.note) body += callout(step.note);
  const primary = step.kind === 'choice'
    ? `<span class="button-hint">${icon('cursor')}${blocked ? (current === 2 ? '可返回修改账户信息' : '先学会使用代理，再回来继续') : '选择一个选项，即可进入下一步'}</span>`
    : step.kind === 'faq'
    ? `<a class="primary-button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">打开 ChatGPT，开始使用${icon('external')}</a>`
    : `<button class="primary-button" id="nextButton" type="button">${escapeHtml(step.button || '确认并继续')}${icon('arrow')}</button>`;
  card.innerHTML = `<div class="step-meta"><span class="step-number">${finished ? 'ALL DONE' : step.kind === 'faq' ? 'FAQ' : `STEP ${String(stepNumber).padStart(2, '0')}`}</span><span class="step-category">${finished ? '流程完成' : step.kind === 'faq' ? '常见问题' : phases[phaseByStep[current]].title}</span></div>${finished ? `<div class="completion"><div class="completion-symbol">${icon('check')}</div><h2 id="stepTitle">恭喜，完成这段旅程！</h2><p>准备工作已经完成，现在开始使用 ChatGPT Plus 吧。</p><a class="primary-button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">打开 ChatGPT${icon('external')}</a></div>` : `<h2 id="stepTitle">${escapeHtml(step.title)}</h2><p class="step-intro">${escapeHtml(step.intro)}</p><div class="action-area">${body}</div>`}<div class="button-row"><button class="secondary-button" id="backButton" type="button"${current === 0 ? ' disabled' : ''}>${icon('back')}上一步</button>${finished ? `<button class="primary-button" id="nextButton" type="button">查看常见问题${icon('arrow')}</button>` : primary}</div>`;
  coachText.textContent = step.coach;
  handoffStatus.className = `handoff-status${blocked ? ' blocked-state' : journeyDone ? ' complete-state' : ''}`;
  handoffStatus.innerHTML = `<span class="status-dot"></span>${blocked ? (current === 2 ? '等待订阅到期' : '未满足门槛') : journeyDone ? '已完成' : step.kind === 'choice' ? '等待选择' : '等待操作'}`;
  card.querySelector('#backButton').addEventListener('click', back);
  card.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.choice)));
  card.querySelector('#nextButton')?.addEventListener('click', complete);
  if (step.kind === 'checks') {
    const next = card.querySelector('#nextButton');
    next.disabled = step.checks.some((_, index) => !state.checks?.[index]);
    card.querySelectorAll('[data-check]').forEach(input => input.addEventListener('change', () => {
      state.checks = [...card.querySelectorAll('[data-check]')].map(item => item.checked);
      next.disabled = state.checks.some(checked => !checked);
      save();
    }));
  }
  bindImageTriggers(card);
  bindImageTriggers(document.getElementById('principleCard'));
  save();
  if (focus) {
    card.focus({ preventScroll: true });
    if (window.scrollY > card.offsetTop - 24) window.scrollTo({ top: Math.max(0, card.offsetTop - 24), behavior: 'instant' });
    card.classList.remove('step-enter');
    void card.offsetWidth;
    card.classList.add('step-enter');
  }
}
document.getElementById('resetButton').addEventListener('click', () => resetDialog.showModal());
resetDialog.addEventListener('close', () => {
  if (resetDialog.returnValue !== 'reset') return;
  Object.keys(state).forEach(key => delete state[key]);
  current = 0;
  history = [];
  render(true);
  window.scrollTo({ top: 0, behavior: 'instant' });
  resetDialog.returnValue = '';
});
document.getElementById('closeImage').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', event => {
  const rect = imageDialog.getBoundingClientRect();
  if (event.target === imageDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) imageDialog.close();
});
if (initAccessGate()) render();

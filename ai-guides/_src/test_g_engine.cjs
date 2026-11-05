// Focused compatibility tests. No browser, packages, generated pages or network required.
// Run: node --test ai-guides/_src/test_g_engine.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/g-engine.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'assets/g-page.html'), 'utf8').split('<body>')[1].split('<script>')[0];
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/g, x => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[x]);

// This mock only models the DOM used by the engine. Layout is deliberately left to browser checks.
class Element {
  constructor(tag = 'div', owner) {
    this.tagName = tag.toUpperCase(); this.owner = owner; this.attrs = {}; this.children = [];
    this.style = {}; this.listeners = {}; this.hidden = false; this.disabled = false; this.checked = false;
    this.value = ''; this.open = false; this.scrollTop = 0; this.clientHeight = 100; this.scrollHeight = 300;
    this.classList = { add: c => this.setAttribute('class', (this.className + ' ' + c).trim()), remove: c => this.setAttribute('class', this.className.split(' ').filter(x => x !== c).join('')) };
  }
  get id() { return this.attrs.id || ''; }
  get className() { return this.attrs.class || ''; }
  set className(v) { this.attrs.class = v; }
  get dataset() { return Object.fromEntries(Object.entries(this.attrs).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v])); }
  get href() { return this.attrs.href || ''; } set href(v) { this.attrs.href = v; }
  get src() { return this.attrs.src || ''; } set src(v) { this.attrs.src = v; }
  get alt() { return this.attrs.alt || ''; } set alt(v) { this.attrs.alt = v; }
  get innerHTML() { return this._html || ''; }
  set innerHTML(v) { this._html = String(v); this.children = []; parse(this._html, this); }
  set outerHTML(v) {
    if (!this.parentElement) return;
    const holder = new Element('div', this.owner); holder.innerHTML = v;
    const p = this.parentElement, at = p.children.indexOf(this);
    holder.children.forEach(c => { c.parentElement = p; });
    p.children.splice(at, 1, ...holder.children);
  }
  get textContent() { return this.children.map(c => typeof c === 'string' ? c : c.textContent).join(''); }
  set textContent(v) { this.children = [String(v)]; this._html = String(v); }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
    if (k === 'disabled') this.disabled = true;
    if (k === 'hidden') this.hidden = true;
    if (k === 'checked') this.checked = true;
    if (k === 'value') this.value = String(v);
  }
  getAttribute(k) { return this.attrs[k] ?? null; }
  append(...items) { items.forEach(c => { c.parentElement = this; this.children.push(c); }); }
  appendChild(c) { this.append(c); return c; }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(c => c !== this); }
  focus() { this.owner.activeElement = this; }
  select() {}
  closest(selector) { let el = this; while (el) { if (matches(el, selector)) return el; el = el.parentElement; } return null; }
  querySelectorAll(selector) {
    const result = [];
    const visit = node => { for (const c of node.children) if (typeof c !== 'string') { if (selector.split(',').some(s => matches(c, s.trim()))) result.push(c); visit(c); } };
    visit(this); return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, options = {}) {
    const e = { type, target: this, currentTarget: this, preventDefault() { this.defaultPrevented = true; }, ...options };
    let node = this;
    do { e.currentTarget = node; for (const fn of node.listeners[type] || []) fn(e); node = type === 'click' ? node.parentElement : null; } while (node);
    return e;
  }
  click() { if (!this.disabled) { if (this.tagName === 'A' && this.download != null) this.owner.downloads.push({ href: this.href, filename: this.download }); this.dispatch('click'); } }
  showModal() { this.open = true; this.attrs.open = ''; }
  close() { this.open = false; delete this.attrs.open; }
}
function matches(el, selector) {
  const parts = selector.trim().split(/\s+/);
  const part = parts.pop();
  const tag = part.match(/^[\w-]+/);
  if (tag && el.tagName !== tag[0].toUpperCase()) return false;
  for (const id of part.matchAll(/#([\w-]+)/g)) if (el.id !== id[1]) return false;
  for (const cls of part.matchAll(/\.([\w-]+)/g)) if (!el.className.split(/\s+/).includes(cls[1])) return false;
  for (const attr of part.matchAll(/\[([^=\]]+)(?:=["']?([^\]"']*)["']?)?\]/g)) {
    if (!(attr[1] in el.attrs)) return false;
    if (attr[2] !== undefined && el.attrs[attr[1]] !== attr[2]) return false;
  }
  if (!parts.length) return true;
  let parent = el.parentElement;
  while (parent) { if (matches(parent, parts.join(' '))) return true; parent = parent.parentElement; }
  return false;
}
function parse(html, root) {
  const stack = [root];
  for (const token of html.matchAll(/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g)) {
    const text = token[0];
    if (text.startsWith('<!--')) continue;
    if (text.startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
    if (text.startsWith('<')) {
      const tag = text.match(/^<([\w-]+)/)[1];
      const el = new Element(tag, root.owner);
      const attrs = text.slice(tag.length + 1, text.length - 1);
      for (const m of attrs.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) el.setAttribute(m[1], decode(m[2] ?? m[3] ?? m[4] ?? ''));
      stack[stack.length - 1].append(el);
      if (!/^(?:area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i.test(tag) && !text.endsWith('/>')) stack.push(el);
    } else stack[stack.length - 1].children.push(decode(text));
  }
}
function guideData(slug) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'guides', slug + '.js'), 'utf8'), sandbox);
  return sandbox.window.AI_GUIDE;
}
function boot(guide, options = {}) {
  const doc = new Element('document'); doc.owner = doc; doc.documentElement = doc; doc.activeElement = doc; doc.downloads = [];
  doc.body = new Element('body', doc); doc.append(doc.body); doc.body.innerHTML = shell;
  doc.getElementById = id => doc.querySelector('#' + id);
  doc.createElement = tag => new Element(tag, doc); doc.execCommand = () => true;
  const data = new Map(Object.entries(options.storage || {}));
  const reads = [], writes = [], blobs = new Map(), revoked = [], clipboard = [], windowEvents = {};
  const storage = {
    getItem(key) { reads.push(key); if (options.readError) throw new Error('storage unavailable'); return data.get(key) ?? null; },
    setItem(key, value) { if (options.writeError) throw new Error('quota'); data.set(key, value); writes.push(key); },
    removeItem(key) { data.delete(key); }
  };
  let now = 1762257600000;
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  class BrowserURL extends URL {}
  BrowserURL.createObjectURL = b => { const u = 'blob:test-' + blobs.size; blobs.set(u, b); return u; };
  BrowserURL.revokeObjectURL = u => revoked.push(u);
  const timers = new Map(); let timerId = 0;
  const location = new URL(options.url || 'https://map.plus-guide.fun/guides/test.html' + (options.hash || ''));
  const api = {};
  const sandbox = {
    __test: api, document: doc, localStorage: storage, location, URL: BrowserURL, Blob, Date: Clock,
    navigator: { clipboard: { writeText(text) { clipboard.push(text); return Promise.resolve(); } } },
    scrollTo() {}, requestAnimationFrame(fn) { fn(); },
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(fn, delay) { const id = ++timerId; timers.set(id, { fn, at: now + delay, interval: delay }); return id; },
    clearInterval(id) { timers.delete(id); }
  };
  sandbox.window = { AI_GUIDE: guide, AI_GUIDE_SLUG: guide.slug || 'test', history: { replaceState(a, b, hash) { location.hash = hash; } }, addEventListener(type, fn) { windowEvents[type] = fn; } };
  const instrumented = source.replace('if (guide.consent) openConsent(guide.consent); else showGuide();', `Object.assign(__test, { state, route, safeUrl, canContinue, getCurrent: () => current }); if (guide.consent) openConsent(guide.consent); else showGuide();`);
  assert.notEqual(instrumented, source, 'test seam must match the engine startup');
  vm.runInNewContext(instrumented, sandbox, { filename: 'g-engine.js' });
  return {
    doc, data, reads, writes, blobs, revoked, clipboard, api,
    el: id => doc.getElementById(id),
    click(selector) { const el = doc.querySelector(selector); assert.ok(el, 'missing ' + selector); el.click(); },
    hash(id) { location.hash = '#' + id; windowEvents.hashchange(); },
    advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { if (!timer.interval) timers.delete(id); timer.fn(); } },
    saved() { return JSON.parse(data.get(guide.storageKey || 'aiGuideStateV1::' + (guide.slug || 'test'))); }
  };
}
const simple = extra => ({ slug: 'test', title: 'Test', inputs: [], steps: [{ id: 'start', title: 'Start' }, { id: 'finish', kind: 'done', title: 'Done' }], ...extra });

// Routes use the real migrated live data, including method-bound functions.
test('Plus uses V2, truncates unanswered choices, terminates subscribed route', () => {
  const b = boot(guideData('plus'), { storage: { pgPlusGuideConsentV1: 'accepted', 'aiGuideStateV1::plus': '{"current":16}' } });
  assert.deepEqual(Array.from(b.api.route()), [0, 1]);
  b.click('#nextBtn'); b.click('[data-choice="existing"]'); b.click('[data-choice="yes"]');
  assert.equal(b.api.getCurrent(), 3); assert.deepEqual(Array.from(b.api.route()), [0, 1, 2, 3]);
  assert.equal(b.el('nextBtn'), null); assert.equal(b.saved().current, 3);
  assert.equal(b.data.get('aiGuideStateV1::plus'), '{"current":16}');
  b.click('#prevBtn'); b.click('[data-choice="no"]');
  assert.equal(b.api.getCurrent(), 4); assert.ok(!b.api.route().includes(5));
  b.click('#prevBtn'); b.click('#prevBtn'); b.click('[data-choice="new"]');
  assert.equal(b.api.getCurrent(), 4); assert.ok(b.api.route().includes(5)); assert.ok(!b.api.route().includes(2));
});
test('Plus countdown starts at bottom, rejects early actions, stores ISO consent', () => {
  const b = boot(guideData('plus'));
  assert.equal(b.doc.documentElement.style.overflow, 'hidden');
  assert.equal(b.el('gateDialog').dispatch('cancel').defaultPrevented, true);
  b.advance(10000); assert.equal(b.el('gateAgree').disabled, true);
  b.click('#nextBtn'); assert.equal(b.api.getCurrent(), 0);
  b.el('gateScroll').scrollTop = 196; b.el('gateScroll').dispatch('scroll');
  b.advance(5999); assert.equal(b.el('gateAgree').disabled, true);
  b.advance(1); b.click('#gateAgree');
  assert.equal(b.el('gateDialog').open, false); assert.match(b.data.get('pgPlusGuideConsentV1'), /^\d{4}-.*Z$/);
  b.click('#nextBtn'); assert.equal(b.api.getCurrent(), 1);
});
test('Plus storage failure still permits the accepted visit', () => {
  const b = boot(guideData('plus'), { writeError: true });
  b.el('gateScroll').scrollTop = 200; b.el('gateScroll').dispatch('scroll'); b.advance(6000); b.click('#gateAgree'); b.click('#nextBtn');
  assert.equal(b.api.getCurrent(), 1);
});
test('IP denial overrides even non-JSON consent and is refreshed; progress reset leaves markers', () => {
  const b = boot(guideData('ip-guide'), { storage: { ipGuideAccessConsentV1: 'accepted', ipGuideAccessDeniedV1: 'denied' } });
  assert.equal(b.el('guideShell').hidden, true); assert.ok(b.el('accessDenied'));
  assert.equal(JSON.parse(b.data.get('ipGuideAccessDeniedV1')).version, 1);
  const allowed = boot(guideData('ip-guide'), { storage: { ipGuideAccessConsentV1: 'accepted' } });
  allowed.click('#resetBtn'); allowed.click('#resetYes');
  assert.equal(allowed.data.get('ipGuideAccessConsentV1'), 'accepted');
});
test('IP purpose, checked acknowledgement and exact trimmed phrase are required', () => {
  const guide = guideData('ip-guide'), b = boot(guide);
  assert.equal(b.el('guideShell').hidden, true); assert.equal(b.el('consentForm').hidden, true);
  assert.ok(b.el('accessPanel').textContent.includes(guide.consent.phrase));
  b.click('[data-purpose="ip-learning"]'); b.el('consentPhrase').value = 'wrong'; b.el('consentPhrase').dispatch('input');
  b.el('consentCheck').checked = true; b.el('consentCheck').dispatch('change'); assert.equal(b.el('consentAgree').disabled, true);
  b.el('consentPhrase').value = '  ' + guide.consent.phrase + '  '; b.el('consentPhrase').dispatch('input');
  assert.equal(b.el('consentAgree').disabled, false); b.el('consentForm').dispatch('submit');
  assert.equal(b.el('guideShell').hidden, false);
  assert.equal(JSON.parse(b.data.get('ipGuideAccessConsentV1')).purpose, 'ip-learning');
  const denied = boot(guideData('ip-guide')); denied.click('[data-purpose="other"]'); assert.ok(denied.el('accessDenied')); assert.ok(denied.data.has('ipGuideAccessDeniedV1'));
});
test('legacy fallback runs only for absent primary, sanitizes state and preserves original', () => {
  let calls = 0;
  const g = simple({ legacyStorageKeys: ['old'], migrateProgress(v, key) { calls++; assert.equal(this, g); assert.equal(key, 'old'); return v; } });
  const old = JSON.stringify({ current: 1, history: [-1, 0, '0', 99], done: { 0: true, 1: 'true', 99: true }, values: { secret: 'do not copy' } });
  const b = boot(g, { storage: { old } });
  assert.equal(calls, 1); assert.equal(b.saved().current, 1); assert.deepEqual(b.saved().history, [0]); assert.deepEqual(b.saved().done, { 0: true }); assert.deepEqual(b.saved().values, {}); assert.equal(b.data.get('old'), old);
  boot(g, { storage: { old, 'aiGuideStateV1::test': 'broken JSON' } }); assert.equal(calls, 1);
  boot(g, { storage: { old, 'aiGuideStateV1::test': '{}' } }); assert.equal(calls, 1);
});
test('Google legacy migration injects route answer only after a route was visited', () => {
  const fresh = boot(guideData('google-account')); assert.deepEqual(fresh.saved().answers, {}); assert.deepEqual(fresh.saved().done, {});
  const old = { current: 2, history: [0, 1], done: { 0: true, 1: true } };
  const b = boot(guideData('google-account'), { storage: { 'aiGuideStateV1::google-account': JSON.stringify(old) } });
  assert.equal(b.saved().current, 7); assert.equal(b.saved().answers[1], 'web'); assert.equal(b.saved().done[1], true);
  assert.deepEqual(b.saved().history, [0, 1, 2]); assert.equal(b.saved().progressVersion, 2);
});
test('Gemini legacy string progress, register aliases and embedded goto preserve gates', () => {
  const old = { current: 'register-password', history: ['start', 'network'], read: ['network'], checks: { plan: true, charge: true, renewal: false } };
  const b = boot(guideData('gemini-student'), { storage: { plusGuideGeminiStudentV1: JSON.stringify(old) } });
  assert.equal(b.api.getCurrent(), 2); assert.equal(b.saved().done[1], true); assert.deepEqual(b.saved().checks[8], [true, true, false]);
  b.hash('start'); b.click('[data-action="goto"][data-step="claim"]'); assert.equal(b.api.getCurrent(), 7);
  b.hash('register-anything'); assert.equal(b.api.getCurrent(), 2);
  b.click('[data-action="goto"][data-step="eligibility"]'); assert.equal(b.api.getCurrent(), 4);
});
test('First deep links apply entry answers only when needed and retain API on shared verify', () => {
  const b = boot(guideData('first-ai-setup'), { hash: '#zcode-api-custom' });
  assert.equal(b.saved().answers[1], 'zcode'); assert.equal(b.saved().answers[17], 'api'); assert.equal(b.api.getCurrent(), 21);
  b.hash('zcode-verify'); assert.equal(b.api.getCurrent(), 22); assert.equal(b.saved().answers[17], 'api');
  b.hash('doubao-download'); assert.equal(b.api.getCurrent(), 2); assert.equal(b.saved().answers[1], 'doubao');
  assert.equal(b.saved().answers[17], undefined); b.click('#prevBtn'); assert.ok(b.api.route().includes(b.api.getCurrent()));
});
test('checks gate task and choice steps, rich HTML coexists, branch changes clear checks', () => {
  const g = simple({ steps: [
    { id: 'pick', kind: 'choice', title: 'Pick', html: '<p>Choice help</p>', choices: [{ value: 'a', title: 'A', next: 1 }, { value: 'b', title: 'B', next: 2 }] },
    { id: 'a', title: 'A', checks: ['Verify'], html: '<p>Rich instructions</p>', warn: 'Warning', note: 'Note', next: 3 },
    { id: 'b', title: 'B', next: 3 }, { id: 'done', kind: 'done', title: 'Done' }
  ] });
  const b = boot(g); assert.match(b.el('step').textContent, /Choice help/); b.click('[data-choice="a"]');
  assert.equal(b.el('nextBtn').disabled, true); assert.match(b.el('step').textContent, /Rich instructions.*Warning.*Note|Rich instructions.*Note.*Warning/s);
  b.el('step').querySelector('[data-check="0"]').checked = true; b.el('step').querySelector('[data-check="0"]').dispatch('change');
  assert.equal(b.el('nextBtn').disabled, false); b.click('#prevBtn'); b.click('[data-choice="b"]'); assert.equal(b.saved().checks[1], undefined);
});
test('ephemeral parameters ignore stored values, validate, copy tokens and omit done recap', () => {
  const g = simple({ ephemeralInputs: true, inputs: [{ key: 'port', label: 'Port', pattern: '^[0-9]+$', error: 'Digits only', token: 'YOUR_PORT' }], steps: [
    { id: 'input', kind: 'inputs', title: 'Input' }, { id: 'task', title: 'Task', code: [{ text: 'connect {{port}}' }] }, { id: 'done', kind: 'done', title: 'Done', html: '<p>Done HTML</p>' }
  ] });
  const b = boot(g, { storage: { 'aiGuideStateV1::test': '{"values":{"port":"secret"}}' } });
  assert.equal(b.el('step').querySelector('[data-input]').value, '');
  const input = b.el('step').querySelector('[data-input]'); input.value = 'oops'; input.dispatch('input'); assert.equal(b.el('nextBtn').disabled, true);
  input.value = ''; input.dispatch('input'); assert.equal(b.el('nextBtn').disabled, false); b.click('#nextBtn'); b.click('[data-copy="0"]');
  assert.equal(b.clipboard[0], 'connect YOUR_PORT'); assert.deepEqual(b.saved().values, {});
  b.click('#nextBtn'); assert.match(b.el('step').textContent, /Done HTML/); assert.equal(b.el('step').querySelector('.recap'), null);
});
test('safeUrl consistently rejects unresolved tokens and schemes, permits web/local relative URLs', () => {
  const b = boot(simple());
  for (let i = 0; i < 4; i++) assert.equal(b.api.safeUrl('../{{host}}'), '');
  for (const url of ['java\nscript:alert(1)', 'javascript:alert(1)', 'data:text/plain,test', 'file:///F:/secret', 'blob:test', '../bad path', '..\\file.js']) assert.equal(b.api.safeUrl(url), '', url);
  assert.equal(b.api.safeUrl('./export_claude.py'), './export_claude.py'); assert.equal(b.api.safeUrl('https://example.com/path'), 'https://example.com/path');
  const local = boot(simple(), { url: 'file:///F:/AI/test.html' }); assert.equal(local.api.safeUrl('./export.py'), './export.py'); assert.equal(local.api.safeUrl('file:///F:/other.py'), '');
});
test('inline image galleries and rich screenshots retain image zoom', () => {
  const image = 'data:image/webp;base64,UklGRg==';
  const b = boot(simple({ steps: [{ title: 'Inline', images: [{ src: image, alt: 'Embedded screenshot' }] }] }));
  assert.equal(b.el('step').querySelector('img').src, image);
  b.click('[data-img]');
  assert.equal(b.el('imgFull').src, image);
  const rich = boot(simple({ steps: [{ title: 'Rich image', html: '<button data-img="' + image + '"><img src="' + image + '" alt="Rich screenshot"></button>' }] }));
  rich.click('[data-img]');
  assert.equal(rich.el('imgFull').src, image);
  const rejected = boot(simple({ steps: [{ title: 'Invalid', images: [{ src: 'data:text/html;base64,PHNjcmlwdD4=', alt: 'Invalid' }] }] }));
  assert.equal(rejected.el('step').querySelector('img'), null);
});
test('Pixel direct navigation works and related links precede body content', () => {
  const b = boot(guideData('pixel-ai-pro'));
  const last = b.doc.querySelectorAll('#toc [data-jump]').at(-1); assert.equal(last.disabled, false); last.click(); assert.equal(b.api.getCurrent(), 23);
  const g = simple({ steps: [{ id: 'start', title: 'Related first', seeAlsoPosition: 'before', seeAlso: [{ title: 'Read this', url: './account.html' }], html: '<p>Main content</p>' }] });
  const c = boot(g); assert.ok(c.el('step').textContent.indexOf('Read this') < c.el('step').textContent.indexOf('Main content'));
});
test('done keeps rich text, links, images and code; downloads keep exporter bytes and filename', async () => {
  const exporter = '#!/usr/bin/env python3\nprint("{{not_a_parameter}}")\n';
  const g = simple({ steps: [{ id: 'done', kind: 'done', title: 'Done', html: '<h3>Rich done</h3>', links: [{ label: 'Official', url: 'https://example.com', desc: 'Description' }], images: [{ src: './pic.webp', alt: 'Done image' }], code: [{ text: 'echo done' }], download: { text: exporter, filename: 'export_claude.py', type: 'text/x-python', label: 'Exporter' } }] });
  const b = boot(g); assert.match(b.el('step').textContent, /Rich done/); assert.ok(b.el('step').querySelector('img')); assert.ok(b.el('step').querySelector('[data-copy]')); assert.match(b.el('step').textContent, /Description/);
  b.click('[data-download="0"]'); assert.equal(b.doc.downloads[0].filename, 'export_claude.py'); assert.equal(await b.blobs.values().next().value.text(), exporter); b.advance(1000); assert.equal(b.revoked.length, 1);
});
test('IP images resolve once per render, history avoids removed package route', () => {
  const g = guideData('ip-guide'); let calls = 0;
  const images = g.steps[6].images; g.steps[6].images = function (answers) { calls++; return images.call(this, answers); };
  const b = boot(g, { storage: { ipGuideAccessConsentV1: 'accepted', 'aiGuideStateV1::ip-guide': '{"current":6,"history":[0,3,4],"answers":{"3":"private"},"checks":{"13":[true,true,true,true]}}' } });
  assert.equal(calls, 1); assert.match(b.el('step').querySelector('img').src, /private/i);
  b.hash(g.steps[3].id); b.click('[data-choice="dedicated"]'); assert.equal(b.saved().checks[13], undefined);
  b.click('#nextBtn'); assert.equal(b.api.getCurrent(), 6); assert.equal(calls, 2); assert.match(b.el('step').querySelector('img').src, /dedicated/i);
  b.click('#prevBtn'); assert.equal(b.api.getCurrent(), 5);
});
test('step route and gate hooks compose with validation and keyboard completion', () => {
  const g = simple({ inputs: [{ key: 'port', label: 'Port', default: '22' }], steps: [
    { id: 'input', kind: 'inputs', title: 'Input', gate(answers, values) { return values.port === '7'; }, route(answers, values) { return values.port === '7' ? 2 : 1; } },
    { id: 'other', title: 'Other' }, { id: 'done', kind: 'done', title: 'Done' }
  ] });
  const b = boot(g); assert.equal(b.el('nextBtn').disabled, true);
  const input = b.el('step').querySelector('[data-input]'); assert.equal(input.value, '22'); input.value = '7'; input.dispatch('input');
  assert.equal(b.el('nextBtn').disabled, false); b.doc.activeElement = b.doc.body; b.doc.dispatch('keydown', { key: 'ArrowRight' });
  assert.equal(b.api.getCurrent(), 2); b.click('#prevBtn'); assert.equal(b.api.getCurrent(), 0);
});
test('every real Claude and VPS route can reach done through its checks', () => {
  for (const slug of ['claude-to-codex', 'vps']) {
    const data = guideData(slug);
    const choices = data.steps.map((s, i) => s.kind === 'choice' ? [i, s.choices.map(ch => ch.value)] : null).filter(Boolean);
    let variants = [{}];
    for (const [index, values] of choices) variants = variants.flatMap(v => values.map(value => ({ ...v, [index]: value })));
    for (const variant of variants) {
      const b = boot(data);
      for (let n = 0; n <= data.steps.length; n++) {
        const index = b.api.getCurrent(), step = data.steps[index];
        if (step.kind === 'done') break;
        b.el('step').querySelectorAll('[data-check]').forEach(input => { input.checked = true; input.dispatch('change'); });
        if (step.kind === 'choice') b.click('[data-choice="' + variant[index] + '"]'); else b.click('#nextBtn');
      }
      assert.equal(data.steps[b.api.getCurrent()].kind, 'done', slug + ' ' + JSON.stringify(variant));
    }
  }
});
test('VPS duplicate step id resolves to choice and all normal check arrays gate', () => {
  const b = boot(guideData('vps'), { hash: '#choose-device' });
  // With no route answers the custom route correctly stops at its earlier unresolved choice.
  assert.equal(b.api.getCurrent(), 2);
  const g = simple({ steps: [{ id: 'same', title: 'Info' }, { id: 'same', title: 'Choice', kind: 'choice', choices: [{ title: 'Go', value: 'go' }] }, { id: 'done', kind: 'done', title: 'Done' }] });
  const c = boot(g, { hash: '#same' }); assert.equal(c.api.getCurrent(), 1);
  const v = boot(guideData('vps')); assert.equal(v.el('nextBtn').disabled, true); assert.equal(v.el('step').querySelectorAll('[data-check]').length, 2);
});

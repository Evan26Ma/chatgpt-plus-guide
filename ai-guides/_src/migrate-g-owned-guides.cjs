'use strict';

// One-time import of the four original HTML guides. The resulting guides/*.js
// files are canonical, editable build inputs; builds never need the snapshots.
// Usage: node ai-guides/_src/migrate-g-owned-guides.cjs --source-dir <original-html-folder>
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const SOURCES = {
  'claude-to-codex': '14-claude-to-codex.html',
  'gemini-student': '20-gemini-student.html',
  'first-ai-setup': '23-first-ai-setup.html',
  vps: '19-vps.html'
};

function readOriginal(file) {
  const html = fs.readFileSync(file, 'utf8');
  const data = html.match(/<script\b[^>]*\bid="guideData"[^>]*>([\s\S]*?)<\/script\s*>/);
  if (data) return { html, guide: JSON.parse(data[1]) };
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/g)]
    .find(match => /window\.AI_GUIDE\s*=/.test(match[1]));
  if (!script) throw new Error('No original guide data: ' + file);
  const context = { window: {} };
  vm.runInNewContext(script[1], context, { timeout: 1000 });
  return { html, guide: context.window.AI_GUIDE };
}

function serialize(guide) {
  const functions = [];
  let text = JSON.stringify(guide, (key, value) => {
    if (typeof value !== 'function') return value;
    const marker = '__PG_MIGRATION_FUNCTION_' + functions.length + '__';
    functions.push([marker, value.toString()]);
    return marker;
  }, 2);
  for (const [marker, body] of functions) text = text.replace(JSON.stringify(marker), () => body);
  return text;
}

function migrateGeminiProgress(value, key) {
  if (key !== 'plusGuideGeminiStudentV1' || !value || typeof value !== 'object' || Array.isArray(value)) return {};
  const byId = new Map(this.steps.map((step, index) => [step.id, index]));
  const at = id => typeof id === 'string' ? byId.get(id.startsWith('register-') ? 'account-ready' : id) : undefined;
  const indices = list => Array.isArray(list) ? list.map(at).filter(Number.isInteger) : [];
  return {
    current: at(value.current) ?? 0,
    history: indices(value.history).slice(-80),
    done: Object.fromEntries(indices(value.read).map(index => [index, true])),
    answers: {},
    checks: { [byId.get('checkout')]: ['plan', 'charge', 'renewal'].map(name => value.checks?.[name] === true) },
    ticks: {},
    values: {}
  };
}

function firstAIRoute(answers) {
  const route = answers[1];
  const result = [0, 1];
  if (route === 'doubao') return result.concat([2, 3, 4, 5, 6, 25]);
  if (route === 'workbuddy') return result.concat([7, 8, 9, 10, 11, 12, 13, 25]);
  if (route !== 'zcode') return result;
  result.push(14, 15, 16, 17);
  if (answers[17] === 'account') result.push(18);
  else if (answers[17] === 'api') result.push(19, 20, 21);
  else return result;
  return result.concat([22, 23, 24, 25]);
}

function migrateFirstAIProgress(value, key) {
  if (key !== 'plusGuideFirstAISetupV1' || !value || typeof value !== 'object' || Array.isArray(value)) return {};
  const byId = new Map(this.steps.map((step, index) => [step.id, index]));
  const at = id => typeof id === 'string' ? byId.get(id) : undefined;
  const indices = list => Array.isArray(list) ? list.map(at).filter(Number.isInteger) : [];
  const history = indices(value.history).slice(-60);
  const done = Object.fromEntries(indices(value.read).map(index => [index, true]));
  let current = at(value.current) ?? 0;
  const currentId = this.steps[current].id;
  const route = ['doubao', 'workbuddy', 'zcode'].includes(value.route) ? value.route
    : ['doubao', 'workbuddy', 'zcode'].find(name => currentId.startsWith(name + '-'));
  let zpath = ['account', 'api'].includes(value.zpath) ? value.zpath : null;
  if (!zpath && currentId.startsWith('zcode-api-')) zpath = 'api';
  if (!zpath && currentId === 'zcode-account') zpath = 'account';
  if (!zpath && route === 'zcode') {
    const previous = [...history].reverse().map(index => this.steps[index].id);
    const connection = previous.find(id => id.startsWith('zcode-api-') || id === 'zcode-account');
    if (connection) zpath = connection === 'zcode-account' ? 'account' : 'api';
  }
  const answers = {};
  if (route) answers[1] = route;
  if (route === 'zcode' && zpath) answers[17] = zpath;
  const checks = {};
  this.steps.forEach((step, index) => {
    if (step.checks?.length) checks[index] = step.checks.map((_, check) => value.checks?.[step.id + ':' + check] === true);
  });
  if (value.finishReached === true && route && (route !== 'zcode' || zpath)) {
    done[route === 'doubao' ? 6 : route === 'workbuddy' ? 13 : 24] = true;
  }
  const visible = this.route(answers);
  if (!visible.includes(current)) current = route ? 1 : 0;
  return { current, history, done, answers, checks, ticks: {}, values: {} };
}

function plain(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function branchChoices(step, attribute, targets, icons) {
  const cards = [...step.html.matchAll(/<div class="route-card[^\"]*">\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>\s*<p><button[^>]*data-(?:route|zpath)="([^\"]+)"[^>]*>([\s\S]*?)<\/button><\/p>\s*<\/div>/g)];
  if (cards.length !== Object.keys(targets).length) throw new Error('Unexpected original choice cards: ' + step.id);
  step.kind = 'choice';
  step.choices = cards.map(([, heading, copy, value, label]) => ({
    title: plain(label), copy: plain(heading) + '：' + plain(copy), value, icon: icons[value], next: targets[value]
  }));
  const start = step.html.indexOf('<div class="route-grid');
  const end = step.html.lastIndexOf('</div>') + '</div>'.length;
  step.html = step.html.slice(0, start) + step.html.slice(end);
  if (step.html.includes('data-' + attribute)) throw new Error('Unconverted branch button: ' + step.id);
}

function convertGemini(original, html) {
  const guide = {
    index: '20', slug: 'gemini-student', category: 'account', title: original.title,
    subtitle: '准备好账号后领取优惠，每次只看眼前这一步。',
    legacyStorageKeys: ['plusGuideGeminiStudentV1'],
    legacyStepIds: { 'register-*': 'account-ready' },
    migrateProgress: migrateGeminiProgress,
    phases: [{ title: '开始前', copy: '选你的起点' }, ...original.stages.map(stage => ({ title: stage.label, copy: stage.copy })), { title: '阅读收尾', copy: '订阅状态回账号确认' }],
    steps: original.steps.map((step, index) => ({ ...step, index, phase: step.stage || (step.id === 'finish' ? 8 : 0), kind: step.id === 'finish' ? 'done' : 'info',
      short: step.id === 'region-change' ? '账号改区分支' : step.stage ? original.stages[step.stage - 1].label : step.id === 'start' ? '选择起点' : '账号确认',
      next: index + 1 < original.steps.length ? index + 1 : undefined }))
  };
  guide.steps[0].html += '\n<p><button class="btn" type="button" data-action="goto" data-step="claim">已有学生会员，从第 6 步开始</button></p>';
  guide.steps[0].button = '从第 1 步开始';
  guide.steps[2].html += '\n<p><button class="btn btn-sm" type="button" data-action="goto" data-step="eligibility">账号已准备好，去第 3 步</button></p>';
  guide.steps[2].button = '查看改区分支';
  guide.steps[7].button = '看第 7 步，核对结算';
  const checkout = html.match(/<div class="checkout-list"[^>]*>([\s\S]*?)<div class="step-navigation"/);
  if (!checkout) throw new Error('Missing original Gemini payment checklist');
  const checks = [...checkout[1].matchAll(/<label><input[^>]*data-check="([^\"]+)"[^>]*><span>([\s\S]*?)<\/span><\/label>/g)];
  if (checks.map(match => match[1]).join(',') !== 'plan,charge,renewal') throw new Error('Unexpected Gemini check keys');
  Object.assign(guide.steps[8], { kind: 'checks', checksTitle: '点“订阅”前，逐项对一遍', checks: checks.map(match => plain(match[2])), button: '已核对，查看收尾', hint: '核对清楚后，再去 Google 页面确认订阅。' });
  return guide;
}

function convertFirstAI(original) {
  const guide = {
    index: '23', slug: 'first-ai-setup', category: 'tools', title: original.title,
    subtitle: '豆包 / WorkBuddy / ZCode，选一款，跟着做就好。',
    names: original.names,
    legacyStorageKeys: ['plusGuideFirstAISetupV1'],
    migrateProgress: migrateFirstAIProgress, route: firstAIRoute,
    phases: [{ title: '开始前', copy: '选择你的工具' }, { title: '豆包', copy: '第一次具体提问' }, { title: 'WorkBuddy', copy: '完成办公任务' }, { title: 'ZCode', copy: '授权或 API，实际验证' }, { title: '阅读收尾', copy: '保持人工核对' }],
    steps: original.steps.map((step, index) => {
      const result = { ...step, index, phase: index < 2 ? 0 : index < 7 ? 1 : index < 14 ? 2 : index < 25 ? 3 : 4,
        kind: step.id === 'finish' ? 'done' : step.checkItems.length ? 'checks' : 'info' };
      if (step.checkItems.length) {
        result.checks = step.checkItems;
        result.checksTitle = '完成本路线前，逐项核对';
        result.button = '完成并查看收尾';
        result.hint = '按实际情况勾选后继续';
      }
      delete result.checkItems;
      if (index < 25) result.next = [6, 13, 24].includes(index) ? 25 : index === 18 ? 22 : index + 1;
      if (index >= 2 && index < 25) {
        const route = index < 7 ? 'doubao' : index < 14 ? 'workbuddy' : 'zcode';
        result.entryAnswers = { 1: route };
        if (index === 18 || index >= 22) result.entryAnswers[17] = 'account';
        if (index >= 19 && index <= 21) result.entryAnswers[17] = 'api';
      }
      return result;
    })
  };
  branchChoices(guide.steps[1], 'route', { doubao: 2, workbuddy: 7, zcode: 14 }, { doubao: 'spark', workbuddy: 'grid', zcode: 'terminal' });
  branchChoices(guide.steps[17], 'zpath', { account: 18, api: 19 }, { account: 'lock', api: 'key' });
  delete guide.steps[1].next;
  delete guide.steps[17].next;
  guide.steps[0].button = '选择我的第一款工具';
  guide.steps.forEach((step, index) => {
    if (index >= 2) step.html += '\n<p><button class="btn btn-sm" type="button" data-action="goto" data-step="choose">重新选择工具</button></p>';
  });
  return guide;
}

const CLASS_MAP = {
  'start-note': 'note tip', requirements: 'box block', readout: 'box block',
  callout: 'note', important: 'warn', 'related-link': 'list-hint', 'prep-list': 'block',
  'plan-grid': 'facts', plan: 'fact', 'free-plan': '', 'paid-plan': '',
  'figure-grid': 'gallery', 'checkout-pair': 'gallery',
  'reference-figure': 'shot', 'image-trigger': '', 'zoom-label': 'zoom',
  flow: 'facts', 'code-hint': 'list-hint'
};

function normalizeHtml(html) {
  html = html.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (whole, attributes, inner) => {
    if (!/\bimage-trigger\b/.test(attributes)) return whole;
    const image = inner.match(/<img\b[^>]*\bsrc="([^\"]+)"/);
    if (!image) throw new Error('Original image button has no image');
    attributes = attributes.replace(/data-image-caption=/g, 'data-cap=');
    return '<button' + attributes + ' data-img="' + image[1] + '">' + inner + '</button>';
  });
  html = html.replace(/class="([^\"]*)"/g, (whole, classes) => {
    const mapped = [...new Set(classes.split(/\s+/).filter(Boolean).flatMap(name => (CLASS_MAP[name] ?? name).split(' ')).filter(Boolean))];
    return mapped.length ? 'class="' + mapped.join(' ') + '"' : '';
  });
  // The original flow's arrows are decorative; the three labelled facts remain.
  return html.replace(/<div><strong>([\s\S]*?)<\/strong><small>([\s\S]*?)<\/small><\/div>/g, '<div class="fact"><strong>$1</strong><small>$2</small></div>').replace(/<i><\/i>/g, '');
}

function localImages(guide, folder) {
  const assetDir = path.join(ROOT, 'assets', folder);
  const byHash = new Map();
  const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  if (fs.existsSync(assetDir)) for (const filename of fs.readdirSync(assetDir)) {
    const file = path.join(assetDir, filename);
    if (fs.statSync(file).isFile()) byHash.set(digest(fs.readFileSync(file)), filename);
  }
  let imageReferences = 0;
  const used = new Set();
  const replace = (text, stepId) => text.replace(/data:image\/([a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)/g, (whole, type, encoded) => {
    imageReferences++;
    const bytes = Buffer.from(encoded, 'base64'), hash = digest(bytes);
    let filename = byHash.get(hash);
    if (!filename) {
      filename = stepId + '-' + hash.slice(0, 12) + '.' + ({ jpeg: 'jpg', 'svg+xml': 'svg' }[type] || type);
      fs.mkdirSync(assetDir, { recursive: true });
      fs.writeFileSync(path.join(assetDir, filename), bytes);
      byHash.set(hash, filename);
    }
    used.add(filename);
    return '@embed-image:assets/' + folder + '/' + filename;
  });
  for (const step of guide.steps) {
    if (step.html) step.html = replace(normalizeHtml(step.html), step.id || String(step.index));
    if (step.images) step.images.forEach(image => { image.src = replace(image.src, step.id || String(step.index)); });
  }
  return { imageReferences, images: [...used] };
}

function main() {
  const position = process.argv.indexOf('--source-dir');
  if (position < 0 || !process.argv[position + 1]) throw new Error('Pass --source-dir pointing to the original HTML files. Generated guide modules are the canonical build inputs.');
  const sourceDir = path.resolve(process.argv[position + 1]);
  for (const [slug, filename] of Object.entries(SOURCES)) {
    const { guide: original, html } = readOriginal(path.join(sourceDir, filename));
    const guide = slug === 'gemini-student' ? convertGemini(original, html)
      : slug === 'first-ai-setup' ? convertFirstAI(original) : original;
    guide.slug = slug;
    guide.category = slug === 'gemini-student' ? 'account' : slug === 'vps' ? 'coding' : 'tools';
    guide.steps.forEach((step, index) => { step.index = index; });
    const assets = localImages(guide, slug === 'first-ai-setup' ? 'first-ai' : slug);
    const module = '// Canonical G guide data, imported from the live original. Preserve stable step indices and ids.\n'
      + 'window.AI_GUIDE_SLUG = ' + JSON.stringify(slug) + ';\nwindow.AI_GUIDE = ' + serialize(guide) + ';\n';
    fs.writeFileSync(path.join(ROOT, 'guides', slug + '.js'), module, 'utf8');
    console.log(slug + ': ' + guide.steps.length + ' steps, ' + assets.images.length + ' distinct local images (' + assets.imageReferences + ' image URL references)');
  }
}

module.exports = { readOriginal, serialize, normalizeHtml, convertGemini, convertFirstAI, migrateGeminiProgress, migrateFirstAIProgress, firstAIRoute, SOURCES };
if (require.main === module) main();

#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { extract } = require('./migrate-g-account-guides.cjs');
const root = path.resolve(__dirname, '..');
const sourceOnly = process.argv.includes('--source-only');
const siteArgument = process.argv.slice(2).find(argument => !argument.startsWith('--'));
const site = path.resolve(siteArgument || path.join(root, '..', 'map'));
const kinds = new Set(['info', 'inputs', 'choice', 'task', 'html', 'checks', 'faq', 'done']);
let routes = 0, resources = 0, count = 0;

function route(guide, answers) {
  if (typeof guide.route === 'function') {
    const result = [];
    for (const index of guide.route(answers)) {
      assert(Number.isInteger(index) && guide.steps[index], 'route contains invalid index');
      assert(!result.includes(index), 'route contains a cycle');
      result.push(index);
      const step = guide.steps[index];
      if (step.stop || (step.kind === 'choice' && !answers[index])) break;
    }
    return result;
  }
  const result = [];
  for (let index = 0; Number.isInteger(index) && guide.steps[index];) {
    assert(!result.includes(index), 'route contains a cycle');
    result.push(index);
    const step = guide.steps[index];
    if (step.stop || step.kind === 'done') break;
    if (step.kind === 'choice') {
      const choice = step.choices.find(item => item.value === answers[index]);
      if (!choice) break;
      index = Number.isInteger(choice.next) ? choice.next : index + 1;
    } else index = Number.isInteger(step.next) ? step.next : index + 1;
  }
  return result;
}

function resource(url, filename) {
  if (typeof url !== 'string' || !url || /^(?:https?:|data:|mailto:|tel:|#)/i.test(url) || /\{\{/.test(url)) return;
  const parsed = new URL(url, 'https://map.plus-guide.fun/guides/' + filename);
  const target = path.resolve(site, '.' + decodeURIComponent(parsed.pathname));
  assert(target === site || target.startsWith(site + path.sep), 'resource outside site: ' + url);
  if (sourceOnly) return;
  assert(fs.existsSync(target), filename + ': missing resource ' + url);
  resources++;
}

for (const file of fs.readdirSync(path.join(root, 'guides')).filter(file => file.endsWith('.js') && !file.startsWith('_'))) {
  const context = { window: {} };
  let moduleSource = fs.readFileSync(path.join(root, 'guides', file), 'utf8');
  moduleSource = moduleSource.replace(/(?<!\\)(['"])@embed-(text|image|file):([^'"\\\r\n]+)\1/g, (match, quote, mode, relative) => {
    const target = path.resolve(root, relative);
    assert(target.startsWith(root + path.sep) && fs.existsSync(target), file + ': missing or unsafe source resource ' + relative);
    resources++;
    return mode === 'text' ? JSON.stringify(fs.readFileSync(target, 'utf8')) : JSON.stringify('./' + relative);
  });
  for (const match of moduleSource.matchAll(/@embed-(?:image|file):([^\s'"<>\\]+)/g)) {
    assert(fs.existsSync(path.resolve(root, match[1])), file + ': missing source resource ' + match[1]);
  }
  vm.runInNewContext(moduleSource, context, { timeout: 1000 });
  const source = context.window.AI_GUIDE;
  assert(source && /^\d{2}$/.test(String(source.index)), file + ': invalid index');
  assert(source.slug && source.title && source.steps.length, file + ': incomplete guide');
  const filename = source.index + '-' + file.replace(/\.js$/, '.html');
  let guide = source;
  if (!sourceOnly) {
    const text = fs.readFileSync(path.join(site, 'guides', filename), 'utf8');
    assert(!text.includes('@embed-'), filename + ': unexpanded resources');
    assert(!text.includes('$price_note') && !text.includes('$font_preload'), filename + ': unresolved shell');
    guide = extract(text).guide;
    const pageScripts = [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).filter(script => script.includes('window.AI_GUIDE ='));
    assert.equal(pageScripts.length, 1, filename + ': ambiguous data script');
    const rendered = { window: {} };
    vm.runInNewContext(pageScripts[0], rendered, { timeout: 1000 });
    assert.equal(rendered.window.AI_GUIDE_SLUG, source.slug, filename + ': slug assignment changed');
    assert.equal(rendered.window.AI_GUIDE.steps.length, source.steps.length, filename + ': nested assignment lost content');
  }
  for (const step of guide.steps) {
    assert(kinds.has(step.kind || 'task'), filename + ': unsupported kind ' + step.kind);
    assert(step.title, filename + ': missing step title');
    if (step.checks) assert(Array.isArray(step.checks) && step.checks.every(item => typeof item === 'string'));
    if (step.kind === 'choice') assert(step.choices.length >= 2 && new Set(step.choices.map(item => item.value)).size === step.choices.length);
    for (const item of [...(step.links || []), ...(step.seeAlso || [])]) resource(item.url, filename);
    if (typeof step.html === 'string') {
      for (const match of step.html.matchAll(/(?:src|href|data-img)=["']([^"']+)["']/g)) resource(match[1], filename);
    }
  }
  const queue = [{}], visited = new Set();
  while (queue.length) {
    const answers = queue.shift();
    const key = JSON.stringify(answers);
    if (visited.has(key)) continue;
    visited.add(key);
    assert(visited.size < 1000, filename + ': excessive route combinations');
    const current = route(guide, answers);
    assert(current.length, filename + ': empty route');
    for (const index of current) {
      const step = guide.steps[index];
      const images = typeof step.images === 'function' ? step.images(answers) : step.images || [];
      for (const image of images) resource(image.src, filename);
    }
    const end = guide.steps[current[current.length - 1]];
    if (end.kind === 'choice' && !answers[current[current.length - 1]]) {
      for (const choice of end.choices) queue.push({ ...answers, [current[current.length - 1]]: choice.value });
    } else {
      assert(end.kind === 'done' || end.stop, filename + ': route does not finish');
      routes++;
    }
  }
  console.log('PASS', filename, guide.steps.length + ' steps', visited.size + ' route states');
  count++;
}
if (!sourceOnly) for (const match of fs.readFileSync(path.join(site, 'assets', 'g-guide.css'), 'utf8').matchAll(/url\(["']?([^\)"']+)/g)) {
  if (!match[1].startsWith('data:')) resource('../assets/' + match[1], 'placeholder.html');
}
console.log(JSON.stringify({ guides: count, completeRoutes: routes, localResourceChecks: resources }));

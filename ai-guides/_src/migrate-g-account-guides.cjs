#!/usr/bin/env node
// One-time live HTML migration; normal builds use the generated guide modules only.
// node ai-guides/_src/migrate-g-account-guides.cjs --source-dir <live-guides-directory> [--check]
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const specs = [
  { filename: '17-plus.html', slug: 'plus', index: '17', category: 'account' },
  { filename: '15-roogoo-card.html', slug: 'roogoo-card', index: '15', category: 'account' },
  { filename: '16-antigravity.html', slug: 'antigravity', index: '16', category: 'tools' },
  { filename: '29-pixel-ai-pro.html', slug: 'pixel-ai-pro', index: '29', category: 'account' }
];
const imageDirectories = { plus: 'plus', roogoo: 'roogoo-card', agapi: 'antigravity' };

function extract(html) {
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    const assignment = /\bwindow\.AI_GUIDE\s*=\s*(?=\{)/.exec(script[1]);
    if (!assignment) continue;
    const start = assignment.index + assignment[0].length;
    let depth = 0;
    let quote = '';
    let comment = '';
    for (let i = start; i < script[1].length; i++) {
      const c = script[1][i];
      const next = script[1][i + 1];
      if (comment === '//') {
        if (c === '\n') comment = '';
        continue;
      }
      if (comment === '/*') {
        if (c === '*' && next === '/') { comment = ''; i++; }
        continue;
      }
      if (quote) {
        if (c === '\\') i++;
        else if (c === quote) quote = '';
        continue;
      }
      if (c === '/' && (next === '/' || next === '*')) { comment = c + next; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
      if (c === '{') depth++;
      if (c === '}' && --depth === 0) {
        const source = script[1].slice(start, i + 1).replace(/\r\n/g, '\n');
        const slug = /window\.AI_GUIDE_SLUG\s*=\s*(['"])(.*?)\1/.exec(script[1]);
        const guide = evaluate(source);
        return { source, guide, slug: slug?.[2] || guide.slug };
      }
    }
    throw new Error('Could not find a balanced AI_GUIDE object');
  }
  throw new Error('No window.AI_GUIDE assignment found');
}

function evaluate(source) {
  const context = { window: {} };
  new vm.Script(`window.AI_GUIDE = (${source});`).runInNewContext(context, { timeout: 1000 });
  return context.window.AI_GUIDE;
}

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function snapshot(value, replacements = new Map()) {
  if (typeof value === 'function') return { functionSource: value.toString().replace(/\r\n/g, '\n') };
  if (typeof value === 'string') return replacements.get(value) || value;
  if (Array.isArray(value)) return Array.from(value, item => snapshot(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, snapshot(value[key], replacements)]));
  }
  return value;
}

function convert(spec, sourceDir, assets) {
  const html = fs.readFileSync(path.join(sourceDir, spec.filename), 'utf8');
  const original = extract(html);
  if (original.slug !== spec.slug) throw new Error(`Unexpected slug in ${spec.filename}: ${original.slug}`);
  const replacements = new Map();
  let imageCount = 0;
  for (const [stepIndex, step] of original.guide.steps.entries()) {
    for (const [imageIndex, image] of (step.images || []).entries()) {
      imageCount++;
      if (replacements.has(image.src)) continue;
      let relative;
      let bytes;
      const inline = /^data:image\/(webp|png|jpeg);base64,([\s\S]+)$/.exec(image.src);
      if (inline) {
        const extension = inline[1] === 'jpeg' ? 'jpg' : inline[1];
        relative = `assets/${spec.slug}/step-${String(stepIndex + 1).padStart(2, '0')}-${imageIndex + 1}.${extension}`;
        bytes = Buffer.from(inline[2], 'base64');
        if (bytes.toString('base64') !== inline[2]) throw new Error(`Invalid base64 image in ${spec.filename}`);
      } else {
        const local = /^\.\/img\/(plus|roogoo|agapi)\/([a-zA-Z0-9_-]+\.webp)$/.exec(image.src);
        if (!local) throw new Error(`Unrecognized image source in ${spec.filename}: ${image.src.slice(0, 100)}`);
        relative = `assets/${imageDirectories[local[1]]}/${local[2]}`;
        bytes = fs.readFileSync(path.resolve(sourceDir, image.src));
      }
      if (assets.has(relative) && digest(assets.get(relative)) !== digest(bytes)) {
        throw new Error(`Different source bytes share an image path: ${relative}`);
      }
      assets.set(relative, bytes);
      replacements.set(image.src, `@embed-image:${relative}`);
    }
  }

  let source;
  const metadata = { slug: spec.slug, category: spec.category };
  if (spec.slug === 'plus') metadata.storageKey = 'aiGuideStateV2::plus';
  if (spec.slug === 'pixel-ai-pro') {
    // This source is JSON. Parsing this one object preserves quoted/numeric keys;
    // the other sources stay JavaScript so their callbacks are never serialized away.
    const data = JSON.parse(original.source);
    data.index = spec.index;
    Object.assign(data, metadata);
    for (const step of data.steps) {
      for (const image of step.images || []) image.src = replacements.get(image.src);
    }
    source = JSON.stringify(data, null, 2).replace(/"(@embed-image:assets\/[^"\r\n]+)"/g, "'$1'");
  } else {
    source = original.source;
    for (const [from, to] of replacements) {
      const literal = `'${from}'`;
      if (!source.includes(literal)) throw new Error(`Missing original image literal: ${from}`);
      source = source.split(literal).join(`'${to}'`);
    }
    const additions = Object.entries(metadata).filter(([key, value]) => {
      if (Object.hasOwn(original.guide, key) && original.guide[key] !== value) {
        throw new Error(`Metadata conflict in ${spec.filename}: ${key}`);
      }
      return !Object.hasOwn(original.guide, key);
    });
    source = source.replace(/^\{/, '{\n' + additions.map(([key, value]) => `  ${key}: '${value}',`).join('\n'));
  }

  const migrated = evaluate(source);
  const expected = evaluate(original.source);
  expected.index = spec.index;
  Object.assign(expected, metadata);
  if (JSON.stringify(snapshot(expected, replacements)) !== JSON.stringify(snapshot(migrated))) {
    throw new Error(`Original content or callback changed in ${spec.filename}`);
  }
  return {
    file: path.join(root, 'guides', `${spec.slug}.js`),
    content: `window.AI_GUIDE = ${source};\n`,
    summary: {
      guide: spec.slug,
      filename: `${spec.index}-${spec.slug}.html`,
      phases: original.guide.phases.length,
      steps: original.guide.steps.length,
      imageReferences: imageCount,
      uniqueImages: replacements.size,
      contentAndFunctionsMatch: true
    }
  };
}

function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf('--source-dir');
  if (at < 0 || !args[at + 1] || args.some((arg, i) => i !== at && i !== at + 1 && arg !== '--check')) {
    throw new Error('Usage: node migrate-g-account-guides.cjs --source-dir <live-guides-directory> [--check]');
  }
  const sourceDir = path.resolve(args[at + 1]);
  const checking = args.includes('--check');
  const assets = new Map();
  const guides = specs.map(spec => convert(spec, sourceDir, assets));
  for (const guide of guides) {
    if (checking) {
      if (fs.readFileSync(guide.file, 'utf8') !== guide.content) throw new Error(`Guide differs: ${guide.file}`);
    } else fs.writeFileSync(guide.file, guide.content, 'utf8');
    console.log(JSON.stringify(guide.summary));
  }
  for (const [relative, bytes] of assets) {
    const target = path.join(root, relative);
    if (checking) {
      if (digest(fs.readFileSync(target)) !== digest(bytes)) throw new Error(`Image differs: ${relative}`);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }
  }
  console.log(JSON.stringify({ mode: checking ? 'verified' : 'written', guides: guides.length, uniqueAssets: assets.size,
    imageBytes: [...assets.values()].reduce((total, bytes) => total + bytes.length, 0) }));
}

module.exports = { extract, evaluate, snapshot, digest };
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

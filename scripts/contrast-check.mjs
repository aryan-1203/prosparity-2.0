#!/usr/bin/env node
// WCAG 2.2 AA contrast check for docs/design/tokens.json. Plain Node, no dependencies.
//
//   node scripts/contrast-check.mjs                 print the Markdown report
//   node scripts/contrast-check.mjs --write         also refresh the block in docs/DESIGN.md
//   node scripts/contrast-check.mjs --tokens <path> read a different token file
//
// Exit code 1 if any pairing listed in `pairs` misses its threshold, so it can gate CI.
// When the sampled deck hexes arrive, edit `color.primitive` and re-run; every failure
// comes with the nearest passing hex.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tokenFlag = args.indexOf('--tokens');
const tokenPath = tokenFlag >= 0 ? resolve(args[tokenFlag + 1]) : resolve(root, 'docs/design/tokens.json');
const designPath = resolve(root, 'docs/DESIGN.md');
const START = '<!-- contrast:start -->';
const END = '<!-- contrast:end -->';

const THRESHOLDS = {
  text: { min: 4.5, label: 'Text' },
  large: { min: 3, label: 'Large text' },
  ui: { min: 3, label: 'UI / graphic' },
};

const tokens = JSON.parse(readFileSync(tokenPath, 'utf8'));
const { primitive, semantic } = tokens.color;

function resolveColor(name, seen = []) {
  if (seen.includes(name)) throw new Error(`Circular colour alias: ${[...seen, name].join(' > ')}`);
  if (/^#[0-9a-f]{6}$/i.test(name)) return name.toUpperCase();
  const value = semantic[name] ?? primitive[name];
  if (value === undefined) throw new Error(`Unknown colour token: ${name}`);
  return resolveColor(value, [...seen, name]);
}

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Nearest passing colour: slide the foreground towards black or white, keeping its hue.
function suggest(fg, bg, min) {
  const target = luminance(bg) > 0.18 ? [0, 0, 0] : [255, 255, 255];
  const start = toRgb(fg);
  for (let t = 0.01; t <= 1; t += 0.01) {
    const candidate = toHex(start.map((c, i) => c + (target[i] - c) * t));
    if (ratio(candidate, bg) >= min) return candidate;
  }
  return null;
}

// Compare at the precision WCAG tooling reports, without rounding a failure up to a pass.
const floor2 = (n) => Math.floor(n * 100) / 100;

const rows = tokens.pairs.map((pair) => {
  const fg = resolveColor(pair.fg);
  const bg = resolveColor(pair.bg);
  const { min, label } = THRESHOLDS[pair.kind];
  const value = floor2(ratio(fg, bg));
  return { ...pair, fgHex: fg, bgHex: bg, min, label, value, pass: value >= min };
});

const avoid = (tokens.avoid ?? []).map((pair) => {
  const fg = resolveColor(pair.fg);
  const bg = resolveColor(pair.bg);
  const { min, label } = THRESHOLDS[pair.kind];
  const value = floor2(ratio(fg, bg));
  return { ...pair, fgHex: fg, bgHex: bg, min, label, value, pass: value >= min };
});

const failures = rows.filter((row) => !row.pass);
const out = [];

out.push(`Thresholds: text 4.5:1, large text 3:1 (at least 24px, or 18.66px bold), UI and graphics 3:1. Ratios are rounded down.`);
out.push('');
out.push(`**${rows.length - failures.length} of ${rows.length} intended pairings pass.**`);
out.push('');
out.push('| Foreground | Background | Use | Type | Ratio | Needs | Result |');
out.push('| --- | --- | --- | --- | ---: | ---: | --- |');
for (const r of rows) {
  out.push(`| \`${r.fg}\` ${r.fgHex} | \`${r.bg}\` ${r.bgHex} | ${r.use} | ${r.label} | ${r.value.toFixed(2)} | ${r.min} | ${r.pass ? 'Pass' : 'FAIL'} |`);
}

if (failures.length) {
  out.push('', '### Failures to fix', '');
  out.push('| Foreground | Background | Ratio | Needs | Nearest passing foreground |');
  out.push('| --- | --- | ---: | ---: | --- |');
  for (const r of failures) {
    out.push(`| \`${r.fg}\` | \`${r.bg}\` | ${r.value.toFixed(2)} | ${r.min} | ${suggest(r.fgHex, r.bgHex, r.min) ?? 'none'} |`);
  }
}

if (avoid.length) {
  out.push('', '### Pairings ruled out', '');
  out.push('These are why the text-safe variants exist. Never use them for the stated purpose.', '');
  out.push('| Foreground | Background | Would be used for | Ratio | Needs | Use instead |');
  out.push('| --- | --- | --- | ---: | ---: | --- |');
  for (const r of avoid) {
    const note = r.pass ? ' (now passes: review this rule)' : '';
    out.push(`| \`${r.fg}\` ${r.fgHex} | \`${r.bg}\` ${r.bgHex} | ${r.use} | ${r.value.toFixed(2)} | ${r.min} | ${r.instead}${note} |`);
  }
}

const report = out.join('\n');
console.log(report);

if (args.includes('--write')) {
  const doc = readFileSync(designPath, 'utf8');
  const a = doc.indexOf(START);
  const b = doc.indexOf(END);
  if (a < 0 || b < 0) throw new Error(`Markers not found in ${designPath}`);
  writeFileSync(designPath, `${doc.slice(0, a + START.length)}\n${report}\n${doc.slice(b)}`);
  console.error(`Updated ${designPath}`);
}

process.exit(failures.length ? 1 : 0);

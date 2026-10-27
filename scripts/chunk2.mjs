#!/usr/bin/env node
// chunk2.mjs — dedupe data/raw2.jsonl, drop obvious non-wishes, split into data/chunks2/NN.jsonl for the normalize pass.
// usage: node scripts/chunk2.mjs [chunkSize=250] [limit=10000]  (wave 2: reads raw2.jsonl, writes data/chunks2/)
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const nums = process.argv.slice(2).filter(a => /^\d+$/.test(a));
const size = +nums[0] || 250, LIMIT = +nums[1] || 10000;
const raw = readFileSync(join(ROOT, 'data', 'raw2.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

// --subs=A,B: only rows from these subreddits / sites (a second, software-focused pool).
const subsArg = process.argv.find(a => a.startsWith('--subs='));
const onlySubs = subsArg ? new Set(subsArg.slice(7).split(',')) : null;
const seen = new Set();
const SOFT = /\b(app|apps|tool|website|site|web ?app|extension|plugin|program|software|service|bot|script|utility|tracker|calculator|game|generator|editor|viewer|player|dashboard|map|timer|planner|browser)\b/i;
const kept = [];
for (const r of raw) {
  const k = `${r.site}:${r.id}`;
  if (seen.has(k)) continue;
  seen.add(k);
  // Comments carry no votes; keep only the ones whose sentence names a piece of software.
  if (r.site === 'hn' && !r.points && !r.comments && !SOFT.test(r.text)) continue;
  if (r.text.length < 12) continue;
  if (onlySubs && !onlySubs.has(r.sub ?? r.site)) continue;
  // r/CrazyIdeas is mostly not about software; keep only titles that name one.
  if (r.sub === 'CrazyIdeas' && !SOFT.test(r.text)) continue;
  kept.push({ k, text: r.text, ...(r.body ? { body: r.body.slice(0, 160) } : {}), date: r.date, points: r.points, comments: r.comments, ...(r.tags ? { tags: r.tags.slice(0, 4) } : {}) });
}
// Highest signal first so early chunks carry the candidates that matter most.
kept.sort((a, b) => (b.points + b.comments) - (a.points + a.comments));
kept.splice(LIMIT);

const dir = join(ROOT, 'data', 'chunks2');
// --append: keep existing chunks, add new ones only for rows no chunk holds yet (late-finishing harvest streams).
const append = process.argv.includes('--append');
let n = 0;
if (append) {
  const have = new Set(readdirSync(dir).flatMap(f => readFileSync(join(dir, f), 'utf8').trim().split('\n').map(l => JSON.parse(l).k)));
  n = readdirSync(dir).length;
  const fresh = kept.filter(o => !have.has(o.k));
  kept.length = 0; kept.push(...fresh);
} else {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}
const first = n;
for (let i = 0; i < kept.length; i += size, n++) {
  writeFileSync(join(dir, String(n).padStart(2, '0') + '.jsonl'), kept.slice(i, i + size).map(o => JSON.stringify(o)).join('\n') + '\n');
}
console.log(`raw ${raw.length} · unique ${seen.size} · kept ${kept.length} · chunks ${first}..${n - 1} of ≤${size}`);

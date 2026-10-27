#!/usr/bin/env node
// chunk.mjs — dedupe data/raw.jsonl, drop obvious non-wishes, split into data/chunks/NN.jsonl for the normalize pass.
// usage: node scripts/chunk.mjs [chunkSize=250]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const size = +process.argv[2] || 250;
const raw = readFileSync(join(ROOT, 'data', 'raw.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

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
  kept.push({ k, text: r.text, date: r.date, points: r.points, comments: r.comments, ...(r.tags ? { tags: r.tags.slice(0, 4) } : {}) });
}
// Highest signal first so early chunks carry the candidates that matter most.
kept.sort((a, b) => (b.points + b.comments) - (a.points + a.comments));

const dir = join(ROOT, 'data', 'chunks');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
let n = 0;
for (let i = 0; i < kept.length; i += size, n++) {
  writeFileSync(join(dir, String(n).padStart(2, '0') + '.jsonl'), kept.slice(i, i + size).map(o => JSON.stringify(o)).join('\n') + '\n');
}
console.log(`raw ${raw.length} · unique ${seen.size} · kept ${kept.length} · ${n} chunks of ≤${size}`);

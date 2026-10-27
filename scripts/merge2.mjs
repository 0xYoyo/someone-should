#!/usr/bin/env node
// merge2.mjs — wave 2: join data/norm2/*.json with data/raw2.jsonl, cluster by topic, write data/wishes.json
// and data/candidates2.json (the shortlist the rank pass reads).
// agreed = sum of points + comments over every source in the cluster; year = earliest source.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const raw = new Map();
for (const l of readFileSync(join(ROOT, 'data', 'raw2.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(l); const k = `${r.site}:${r.id}`;
  if (!raw.has(k)) raw.set(k, r);
}
const normDir = join(ROOT, 'data', 'norm2');
const rows = readdirSync(normDir).filter(f => f.endsWith('.json')).sort().flatMap(f => JSON.parse(readFileSync(join(normDir, f), 'utf8')));

const clusters = new Map();
let dropped = 0;
for (const n of rows) {
  if (n.drop || !n.topic || !n.wish) { dropped++; continue; }
  const r = raw.get(n.k); if (!r) continue;
  const src = { site: r.site, url: r.url, date: r.date, points: r.points || 0, comments: r.comments || 0 };
  const c = clusters.get(n.topic) ?? { topic: n.topic, rows: [] };
  c.rows.push({ ...n, src });
  clusters.set(n.topic, c);
}

const wishes = [...clusters.values()].map(c => {
  const sources = c.rows.map(r => r.src).sort((a, b) => a.date.localeCompare(b.date));
  // The wording, category and verdict come from the most-agreed source in the cluster.
  const lead = c.rows.slice().sort((a, b) => (b.src.points + b.src.comments) - (a.src.points + a.src.comments))[0];
  const buildVotes = c.rows.filter(r => r.buildable).length;
  return {
    topic: c.topic, wish: lead.wish, category: lead.category,
    year: +sources[0].date.slice(0, 4),
    agreed: sources.reduce((s, x) => s + x.points + x.comments, 0),
    buildable: buildVotes * 2 >= c.rows.length, why: lead.why, no: lead.buildable ? (c.rows.find(r => r.no)?.no ?? null) : lead.no,
    sources,
  };
}).sort((a, b) => b.agreed - a.agreed);

writeFileSync(join(ROOT, 'data', 'wishes2.json'), JSON.stringify({ generated: new Date().toISOString(), count: wishes.length, wishes }, null, 1));
const short = w => ({ topic: w.topic, wish: w.wish, category: w.category, year: w.year, agreed: w.agreed, n: w.sources.length, why: w.why, ...(w.buildable ? {} : { no: w.no }) });
const cand = {
  buildable: wishes.filter(w => w.buildable).slice(0, 1600).map(short),
  not: wishes.filter(w => !w.buildable && w.no).slice(0, 400).map(short),
};
writeFileSync(join(ROOT, 'data', 'candidates2.json'), JSON.stringify(cand, null, 0).replace(/},{/g, '},\n{'));
console.log(`rows ${rows.length} · dropped ${dropped} · clusters ${wishes.length} · buildable ${wishes.filter(w => w.buildable).length} · candidates ${cand.buildable.length}+${cand.not.length}`);

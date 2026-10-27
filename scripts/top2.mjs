#!/usr/bin/env node
// top2.mjs — wave 2: turn data/check2/out/*.json (the obsolescence check) into data/top2.json.
// year/agreed/sources always come from data/wishes2.json, never from a model.
// Optional data/check2/merge.json: [[keepSlug, dupSlug, ...]] from the cross-chunk dedupe pass.
// Build order = agreement first, year only breaks ties. Developer utilities capped at 15% of the build list.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const D = join(ROOT, 'data');
const { wishes } = JSON.parse(readFileSync(join(D, 'wishes2.json'), 'utf8'));
const byTopic = new Map(wishes.map(w => [w.topic, { ...w, sources: w.sources.slice() }]));
const wave1 = JSON.parse(readFileSync(join(D, 'top.json'), 'utf8'));
const taken = new Set([...wave1.build, ...wave1.reserve, ...wave1.no].map(w => w.slug));

const rows = readdirSync(join(D, 'check2', 'out')).filter(f => f.endsWith('.json')).sort()
  .flatMap(f => JSON.parse(readFileSync(join(D, 'check2', 'out', f), 'utf8')));

const absorb = (keep, other) => {
  keep.sources.push(...other.sources);
  keep.sources.sort((a, b) => a.date.localeCompare(b.date));
  keep.year = +keep.sources[0].date.slice(0, 4);
  keep.agreed = keep.sources.reduce((s, x) => s + x.points + x.comments, 0);
};

// In-chunk duplicates fold their agreement into the row they duplicate.
for (const r of rows) {
  if (r.verdict !== 'skip' || !r.dup || !byTopic.has(r.dup) || r.dup === r.topic) continue;
  const keep = byTopic.get(r.dup), other = byTopic.get(r.topic);
  if (keep && other) { absorb(keep, other); byTopic.delete(r.topic); }
}

const picked = new Map(); // slug -> entry
const VOCAB = /^(exists: .+|needs: (your bank password|camera hardware|a server|other people's data)|not safe|your phone does this.*|too vague)$/;
for (const r of rows) {
  if (r.verdict !== 'build' && r.verdict !== 'no') continue;
  const w = byTopic.get(r.topic); if (!w) continue;
  if (!r.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) { console.error('bad slug', r.topic, r.slug); continue; }
  if (taken.has(r.slug)) { console.error('wave-1 slug, skipped', r.slug); continue; }
  if (r.verdict === 'no' && (!VOCAB.test(r.no ?? '') || r.no.split(/\s+/).length > 5)) { console.error('NO outside vocabulary', r.slug, r.no); continue; }
  let slug = r.slug;
  if (picked.has(slug)) { // two chunks named the same tool: same wish, fold it in
    absorb(picked.get(slug)._w, w); continue;
  }
  picked.set(slug, { _w: w, slug, verdict: r.verdict, kind: r.kind ?? 'everyday', spec_hint: r.spec_hint, wish: r.wish || w.wish, no: r.no });
}

const mergeFile = join(D, 'check2', 'merge.json');
if (existsSync(mergeFile)) for (const [keep, ...dups] of JSON.parse(readFileSync(mergeFile, 'utf8'))) {
  const k = picked.get(keep); if (!k) { console.error('merge: unknown', keep); continue; }
  for (const d of dups) { const o = picked.get(d); if (!o) { console.error('merge: unknown', d); continue; } absorb(k._w, o._w); picked.delete(d); }
}

const out = e => {
  const w = e._w;
  const sources = w.sources.slice().sort((a, b) => (b.points + b.comments) - (a.points + a.comments)).slice(0, 8);
  return { slug: e.slug, wish: e.wish, year: w.year, agreed: w.agreed, category: w.category, kind: e.kind, sources,
    ...(e.verdict === 'build' ? { spec_hint: e.spec_hint } : { no: e.no }) };
};
const order = (a, b) => b.agreed - a.agreed || b.year - a.year;
const all = [...picked.values()].map(e => ({ e, o: out(e) }));
const builds = all.filter(x => x.e.verdict === 'build').map(x => x.o).sort(order);
const everyday = builds.filter(w => w.kind !== 'dev');
const devAllowed = Math.floor(everyday.length * 15 / 85);
const dev = builds.filter(w => w.kind === 'dev');
const build = [...everyday, ...dev.slice(0, devAllowed)].sort(order);
const top2 = {
  generated: new Date().toISOString(),
  build,
  reserve: [],
  devOverflow: dev.slice(devAllowed).map(w => w.slug),
  no: all.filter(x => x.e.verdict === 'no').map(x => x.o).sort(order),
};
writeFileSync(join(D, 'top2.json'), JSON.stringify(top2, null, 1));
console.log(`top2.json: build ${build.length} (dev ${Math.min(devAllowed, dev.length)}, overflow ${top2.devOverflow.length}) · no ${top2.no.length}`);

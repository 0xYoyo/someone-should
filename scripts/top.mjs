#!/usr/bin/env node
// top.mjs — turn data/rank.json (topics picked by the rank pass) into data/top.json,
// pulling year/agreed/sources from data/wishes.json so no number is ever retyped by a model.
// rank.json: { merge: [[keepTopic, otherTopic...]], build: [{topic, slug, spec_hint, wish?}], reserve: [...same], no: [{topic, slug, no, wish?}] }
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const { wishes } = JSON.parse(readFileSync(join(ROOT, 'data', 'wishes.json'), 'utf8'));
const rank = JSON.parse(readFileSync(join(ROOT, 'data', 'rank.json'), 'utf8'));
const byTopic = new Map(wishes.map(w => [w.topic, w]));

for (const [keep, ...others] of rank.merge ?? []) {
  const w = byTopic.get(keep); if (!w) throw new Error(`merge: unknown topic ${keep}`);
  for (const o of others) {
    const x = byTopic.get(o); if (!x) throw new Error(`merge: unknown topic ${o}`);
    w.sources.push(...x.sources);
    byTopic.delete(o);
  }
  w.sources.sort((a, b) => a.date.localeCompare(b.date));
  w.year = +w.sources[0].date.slice(0, 4);
  w.agreed = w.sources.reduce((s, x) => s + x.points + x.comments, 0);
}

const seen = new Set();
const pick = (r, extra) => {
  const w = byTopic.get(r.topic);
  if (!w) throw new Error(`unknown topic ${r.topic}`);
  if (seen.has(r.slug)) throw new Error(`duplicate slug ${r.slug}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) throw new Error(`bad slug ${r.slug}`);
  seen.add(r.slug);
  // Lead with the most-agreed sources; the wall links the first one.
  const sources = w.sources.slice().sort((a, b) => (b.points + b.comments) - (a.points + a.comments)).slice(0, 8);
  return { slug: r.slug, wish: r.wish ?? w.wish, year: w.year, agreed: w.agreed, category: w.category, sources, ...extra(r) };
};
const top = {
  generated: new Date().toISOString(),
  build: rank.build.map(r => pick(r, r => ({ spec_hint: r.spec_hint }))),
  reserve: (rank.reserve ?? []).map(r => pick(r, r => ({ spec_hint: r.spec_hint }))),
  no: rank.no.map(r => pick(r, r => ({ no: r.no }))),
};
for (const n of top.no) if (!/^(exists: .+|needs: (your bank password|camera hardware|a server|other people's data)|not safe|your phone does this.*|too vague)$/.test(n.no) || n.no.split(/\s+/).length > 5)
  throw new Error(`NO reason outside vocabulary: ${n.slug}: ${n.no}`);
writeFileSync(join(ROOT, 'data', 'top.json'), JSON.stringify(top, null, 1));
console.log(`top.json: build ${top.build.length} · reserve ${top.reserve.length} · no ${top.no.length}`);

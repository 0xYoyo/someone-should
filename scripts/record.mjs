#!/usr/bin/env node
// record.mjs — write verify results into data/built.json.
// usage: node scripts/record.mjs <slug>...                 (reads qa/<slug>.json + tools/<slug>/tool.json)
//        node scripts/record.mjs --drop <slug> "<reason>"
//        node scripts/record.mjs --attempt <slug> <model>   (count a build attempt, no verdict yet)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const FILE = join(ROOT, 'data', 'built.json');
const db = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { updated: null, tools: [] };
const entry = slug => {
  let e = db.tools.find(t => t.slug === slug);
  if (!e) { e = { slug, status: 'pending', attempts: 0 }; db.tools.push(e); }
  return e;
};
const readJson = p => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

const args = process.argv.slice(2);
if (args[0] === '--drop') {
  Object.assign(entry(args[1]), { status: 'dropped', reason: args[2] ?? 'failed verify twice' });
} else if (args[0] === '--attempt') {
  const e = entry(args[1]); e.attempts = (e.attempts ?? 0) + 1; e.model = args[2];
} else {
  for (const slug of args) {
    const q = readJson(join(ROOT, 'qa', `${slug}.json`));
    const tool = readJson(join(ROOT, 'tools', slug, 'tool.json'));
    const e = entry(slug);
    if (!q || !tool) { e.status = 'fail'; e.reason = 'no verify report'; continue; }
    Object.assign(e, {
      status: q.pass ? 'pass' : 'fail', kb: q.kb, tests: q.tests,
      built: tool.built, minutes: tool.minutes, model: tool.model, approved: !!tool.approved,
      ...(q.pass ? { reason: undefined } : { reason: q.errors.slice(0, 2).join('; ') }),
    });
    if (q.pass && tool.status !== 'pass') writeFileSync(join(ROOT, 'tools', slug, 'tool.json'), JSON.stringify({ ...tool, status: 'pass' }, null, 2));
  }
}
db.updated = new Date().toISOString();
writeFileSync(FILE, JSON.stringify(db, null, 1));
const c = s => db.tools.filter(t => t.status === s).length;
console.log(`built.json: ${c('pass')} pass · ${c('fail')} fail · ${c('dropped')} dropped · ${db.tools.length} total`);

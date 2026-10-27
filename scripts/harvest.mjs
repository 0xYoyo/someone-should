#!/usr/bin/env node
// harvest.mjs — collect public "someone should make…" wishes into data/raw.jsonl
// No keys. Polite rates. Never stores authors.
// usage: node scripts/harvest.mjs [hn] [se] [reddit]     (default: all)
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
mkdirSync(join(ROOT, 'data'), { recursive: true });
const OUT = join(ROOT, 'data', 'raw.jsonl');
writeFileSync(OUT, '');
const which = process.argv.slice(2).length ? process.argv.slice(2) : ['hn', 'se', 'reddit'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'someone-should harvester (research; contact via github.com/0xYoyo/someone-should)';
let n = 0;
const emit = o => { appendFileSync(OUT, JSON.stringify(o) + '\n'); n++; };
const oneLine = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);

// ---------- Hacker News (Algolia, open) ----------
const HN_QUERIES = ['"someone should make"', '"someone should build"', '"somebody should make"', '"is there a tool"', '"is there an app"',
  '"is there a website"', '"i wish there was an app"', '"i wish there was a tool"', '"why isn\'t there an app"', '"does anyone know of an app"',
  '"is there any app"', '"is there a simple app"', '"looking for an app that"', '"ask hn: is there"'];
async function hn() {
  for (const q of HN_QUERIES) {
    for (let page = 0; page < 50; page++) {
      const u = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=(story,comment)&hitsPerPage=100&page=${page}`;
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (!res.ok) { console.error('hn', res.status, q, page); break; }
      const j = await res.json();
      for (const h of j.hits) {
        const text = oneLine(h.title || h.comment_text || h.story_text);
        if (!text) continue;
        emit({ site: 'hn', id: h.objectID, url: `https://news.ycombinator.com/item?id=${h.objectID}`, date: h.created_at?.slice(0, 10),
          points: h.points ?? 0, comments: h.num_comments ?? 0, text, query: q });
      }
      if (page >= (j.nbPages ?? 1) - 1) break;
      await sleep(400);
    }
  }
  console.log('hn done', n);
}

// ---------- Software Recommendations Stack Exchange (public API, no key: 300 req/day) ----------
async function se() {
  for (let page = 1; page <= 120; page++) {
    const u = `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&site=softwarerecs&pagesize=100&page=${page}`;
    const res = await fetch(u, { headers: { 'User-Agent': UA } });
    if (!res.ok) { console.error('se', res.status, page); break; }
    const j = await res.json();
    for (const q of j.items ?? []) {
      emit({ site: 'se', id: String(q.question_id), url: q.link, date: new Date(q.creation_date * 1000).toISOString().slice(0, 10),
        points: q.score ?? 0, comments: q.answer_count ?? 0, answered: !!q.is_answered, text: oneLine(q.title), tags: q.tags });
    }
    if (!j.has_more) break;
    if (j.backoff) await sleep(j.backoff * 1000 + 500); else await sleep(300);
  }
  console.log('se done', n);
}

// ---------- Reddit (old.reddit JSON, best effort; skip on 403/429) ----------
const SUBS = ['SomebodyMakeThis', 'AppIdeas', 'Lightbulb', 'CrazyIdeas'];
async function reddit() {
  for (const sub of SUBS) {
    let after = '', fails = 0;
    for (let page = 0; page < 10; page++) {
      const u = `https://old.reddit.com/r/${sub}/top.json?t=all&limit=100${after ? '&after=' + after : ''}`;
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (!res.ok) { console.error('reddit', res.status, sub); if (++fails >= 2) break; await sleep(8000); continue; }
      const j = await res.json();
      for (const c of j.data?.children ?? []) {
        const d = c.data; if (!d?.title) continue;
        emit({ site: 'reddit', id: d.id, url: `https://www.reddit.com${d.permalink}`, date: new Date(d.created_utc * 1000).toISOString().slice(0, 10),
          points: d.score ?? 0, comments: d.num_comments ?? 0, text: oneLine(d.title), sub });
      }
      after = j.data?.after; if (!after) break;
      await sleep(6500);
    }
  }
  console.log('reddit done', n);
}

for (const w of which) { try { await ({ hn, se, reddit })[w](); } catch (e) { console.error(w, 'failed:', e.message); } }
console.log(`wrote ${n} candidates → data/raw.jsonl`);

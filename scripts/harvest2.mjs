#!/usr/bin/env node
// harvest2.mjs — wave 2 harvest. Reddit (Arctic Shift archive, full history), Bluesky search, HN 2023+.
// Writes data/raw2/<source>.jsonl (one file per stream so streams run in parallel), then `combine` joins them
// into data/raw2.jsonl. Never stores authors or handles.
// usage: node scripts/harvest2.mjs reddit <Sub> | bsky | hn | combine
import { appendFileSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = join(ROOT, 'data', 'raw2');
mkdirSync(DIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'someone-should harvester (research; github.com/0xYoyo/someone-should)';
const oneLine = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
const firstLine = s => oneLine(String(s ?? '').split(/\n\s*\n|\n/).find(l => l.trim() && !/^\[?(removed|deleted)\]?$/i.test(l.trim())) ?? '').slice(0, 240);

async function get(u, tries = 5) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (res.ok) return await res.json();
      console.error(res.status, u);
      if (res.status === 400) return null;
    } catch (e) { console.error('net', e.message); }
    await sleep(2000 * 2 ** i);
  }
  return null;
}

// Only wish-shaped titles from the big general subs.
const WISHY = /some(one|body) (should|needs to|make|build)|wish (there was|there were|someone)|why (isn.?t|is there no|aren.?t) there|is there an? (app|tool|site|website)|app idea/i;
const FILTERED = new Set(['SideProject', 'Startup_Ideas', 'startups']);

async function reddit(sub) {
  const out = join(DIR, `reddit-${sub}.jsonl`);
  // Resume from the last line if a previous run was cut.
  let after = 1104537600, n = 0, kept = 0;
  if (existsSync(out)) {
    const lines = readFileSync(out, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length) after = JSON.parse(lines.at(-1)).ts + 1;
  }
  for (;;) {
    const u = `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${sub}&after=${after}&limit=100&sort=asc&fields=id,title,created_utc,score,num_comments,selftext,over_18`;
    const j = await get(u);
    if (!j?.data?.length) break;
    for (const p of j.data) {
      n++;
      if (p.over_18) continue;
      const title = oneLine(p.title).replace(/^\[(smt|request|idea)\]\s*/i, '').slice(0, 240);
      if (!title) continue;
      if (FILTERED.has(sub) && !WISHY.test(title)) continue;
      appendFileSync(out, JSON.stringify({ site: 'reddit', sub, id: p.id, url: `https://www.reddit.com/r/${sub}/comments/${p.id}/`,
        date: new Date(p.created_utc * 1000).toISOString().slice(0, 10), ts: p.created_utc,
        points: p.score ?? 0, comments: p.num_comments ?? 0, text: title, body: firstLine(p.selftext), wave: 2 }) + '\n');
      kept++;
    }
    after = j.data.at(-1).created_utc + 1;
    if (n % 5000 < 100) console.log(sub, n, kept, new Date(after * 1000).toISOString().slice(0, 10));
    await sleep(250);
  }
  console.log(`done ${sub}: seen ${n} kept ${kept}`);
}

const BSKY_Q = ['"someone should make an app"', '"somebody make an app"', '"i wish there was an app"', '"why is there no app"',
  '"someone needs to build"', '"app idea:"', '"someone should build an app"', '"i wish there was a website"', '"someone should make a website"'];
async function bsky() {
  const out = join(DIR, 'bsky.jsonl'); writeFileSync(out, '');
  for (const q of BSKY_Q) {
    let cursor = '', pages = 0;
    do {
      const u = `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&limit=100&sort=top${cursor ? '&cursor=' + cursor : ''}`;
      const j = await get(u, 3);
      if (!j?.posts) { console.error('bsky stop', q); break; }
      for (const p of j.posts) {
        const [, , did, , rkey] = p.uri.split('/');
        const text = oneLine(p.record?.text).slice(0, 280);
        if (!text) continue;
        appendFileSync(out, JSON.stringify({ site: 'bsky', id: `${did}/${rkey}`, url: `https://bsky.app/profile/${did}/post/${rkey}`,
          date: String(p.record?.createdAt ?? p.indexedAt).slice(0, 10), points: (p.likeCount ?? 0) + (p.repostCount ?? 0),
          comments: p.replyCount ?? 0, text, query: q, wave: 2 }) + '\n');
      }
      cursor = j.cursor; pages++;
      await sleep(500);
    } while (cursor && pages < 10);
  }
  console.log('bsky done');
}

const HN_Q = ['"someone should make"', '"someone should build"', '"somebody should make"', '"is there a tool"', '"is there an app"',
  '"is there a website"', '"i wish there was an app"', '"i wish there was a tool"', '"why isn\'t there an app"', '"does anyone know of an app"',
  '"why is there no app"', '"i would pay for an app"', '"Ask HN: Is there a"', '"Ask HN: Why is there no"', '"Ask HN: What tool"'];
const wishSentence = (text, q) => {
  const phrase = q.replace(/"/g, '').replace(/^ask hn: /i, '').toLowerCase();
  const parts = text.split(/(?<=[.!?])\s+/);
  return (parts.find(p => p.toLowerCase().includes(phrase)) ?? text).slice(0, 220);
};
async function hn() {
  const out = join(DIR, 'hn.jsonl'); writeFileSync(out, '');
  for (const q of HN_Q) {
    for (let page = 0; page < 10; page++) {
      const u = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=(story,comment)&numericFilters=created_at_i>1672531200&hitsPerPage=100&page=${page}`;
      const j = await get(u, 3);
      if (!j) break;
      for (const h of j.hits) {
        const text = h.title ? oneLine(h.title) : wishSentence(oneLine(h.comment_text || h.story_text), q);
        if (!text) continue;
        appendFileSync(out, JSON.stringify({ site: 'hn', id: h.objectID, url: `https://news.ycombinator.com/item?id=${h.objectID}`,
          date: h.created_at?.slice(0, 10), points: h.points ?? 0, comments: h.num_comments ?? 0, text, query: q, wave: 2 }) + '\n');
      }
      if (page >= (j.nbPages ?? 1) - 1) break;
      await sleep(400);
    }
  }
  console.log('hn done');
}

const KEEP_MIN = 10;
function combine() {
  const seen = new Set(); const lines = []; const by = {};
  for (const f of readdirSync(DIR).filter(f => f.endsWith('.jsonl')).sort()) {
    for (const l of readFileSync(join(DIR, f), 'utf8').split('\n').filter(Boolean)) {
      const r = JSON.parse(l); const k = `${r.site}:${r.id}`;
      if (seen.has(k)) continue; seen.add(k);
      delete r.ts;
      // The repo keeps only rows with real agreement; the full per-stream files stay local (data/raw2/ is gitignored).
      by[r.sub ?? r.site] = (by[r.sub ?? r.site] ?? 0) + 1;
      if (r.points + r.comments < KEEP_MIN) continue;
      lines.push(JSON.stringify(r));
    }
  }
  writeFileSync(join(ROOT, 'data', 'raw2.jsonl'), lines.join('\n') + '\n');
  writeFileSync(join(ROOT, 'data', 'raw2-stats.json'), JSON.stringify({ harvested: seen.size, kept: lines.length, keepMin: KEEP_MIN, bySource: by }));
  console.log('raw2 harvested', seen.size, 'kept', lines.length, JSON.stringify(by));
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'reddit') await reddit(arg);
else if (cmd === 'bsky') await bsky();
else if (cmd === 'hn') await hn();
else if (cmd === 'combine') combine();
else console.log('usage: reddit <Sub> | bsky | hn | combine');

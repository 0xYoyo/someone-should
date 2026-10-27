#!/usr/bin/env node
// thumbs.mjs — static wall thumbnails: each tool rendered in embed mode at 390x488, saved as JPEG.
// usage: node scripts/thumbs.mjs [slug ...]   (default: every PASS tool in data/built.json)
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw; for (const p of ['playwright','/opt/npm-tools/node_modules/playwright','/usr/local/lib/node_modules/playwright']) { try { pw = require(p); break; } catch {} }
const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const OUT = join(ROOT, 'assets', 'thumbs'); mkdirSync(OUT, { recursive: true });
const built = JSON.parse(readFileSync(join(ROOT, 'data', 'built.json'), 'utf8')).tools.filter(t => t.status === 'pass').map(t => t.slug);
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : built;
const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 488 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
let n = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  const p = await ctx.newPage();
  await p.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort());
  while (slugs.length) {
    const s = slugs.shift(); const f = join(ROOT, 'tools', s, 'index.html');
    if (!existsSync(f)) continue;
    try { await p.goto('file://' + f + '?embed=1', { timeout: 5000 }); await p.waitForTimeout(500);
      await p.screenshot({ path: join(OUT, s + '.jpg'), type: 'jpeg', quality: 72 }); n++; }
    catch (e) { console.error('thumb failed', s, e.message.split('\n')[0]); }
  }
}));
await b.close(); console.log('thumbs:', n);

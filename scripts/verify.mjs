#!/usr/bin/env node
// verify.mjs — the gate every tool passes through.
// usage: node scripts/verify.mjs <slug> [<slug> ...]   |   node scripts/verify.mjs --all
// Writes qa/<slug>.png and qa/<slug>.json. Exit 1 if any tool fails.
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
// Playwright may be preinstalled globally (cloud image) or locally (`npm i`). Try both.
const require = createRequire(import.meta.url);
let pw;
for (const p of ['playwright', '/opt/npm-tools/node_modules/playwright', '/usr/local/lib/node_modules/playwright', '/usr/lib/node_modules/playwright']) {
  try { pw = require(p); break; } catch {}
}
if (!pw) { console.error('playwright not found. Run: npm i  (then, only if chromium is missing: npx playwright install chromium)'); process.exit(2); }
const { chromium, devices } = pw;

const ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const args = process.argv.slice(2);
const slugs = args.includes('--all')
  ? readdirSync(join(ROOT, 'tools')).filter(d => existsSync(join(ROOT, 'tools', d, 'index.html')))
  : args;
if (!slugs.length) { console.error('usage: verify.mjs <slug>... | --all'); process.exit(2); }
mkdirSync(join(ROOT, 'qa'), { recursive: true });

const MAX_KB = 60, MAX_DCL_MS = 800, VIEWPORTS = [{ w: 390, h: 844 }, { w: 360, h: 780 }];

async function verifyOne(browser, slug) {
  const dir = join(ROOT, 'tools', slug);
  const html = join(dir, 'index.html');
  const meta = join(dir, 'tool.json');
  const r = { slug, pass: false, checks: {}, errors: [] };
  const fail = (k, msg) => { r.checks[k] = false; r.errors.push(`${k}: ${msg}`); };
  const ok = (k) => { r.checks[k] = true; };

  if (!existsSync(html)) { fail('exists', 'no index.html'); return r; }
  if (!existsSync(meta)) { fail('meta', 'no tool.json'); return r; }
  let tool; try { tool = JSON.parse(readFileSync(meta, 'utf8')); ok('meta'); } catch (e) { fail('meta', 'tool.json invalid: ' + e.message); return r; }
  const kb = statSync(html).size / 1024; r.kb = +kb.toFixed(1);
  kb <= MAX_KB ? ok('size') : fail('size', `${r.kb} kB > ${MAX_KB}`);
  const src = readFileSync(html, 'utf8');
  if (/\b(https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(src.replace(/<!--[\s\S]*?-->/g, ''))) fail('no-urls', 'external URL found in source'); else ok('no-urls');
  if (!/Content-Security-Policy/.test(src)) fail('csp', 'CSP meta missing'); else ok('csp');
  if (!Array.isArray(tool.tests) || tool.tests.length < 3 || tool.tests.length > 6) fail('tests-count', `need 3–6 tests, got ${tool.tests?.length ?? 0}`); else ok('tests-count');

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: vp.w, height: vp.h }, offline: false, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const requests = [], consoleErrors = [];
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('file://') && u.endsWith('/index.html')) return route.continue();
      requests.push(u); return route.abort();
    });
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => consoleErrors.push(String(e)));
    const t0 = Date.now();
    try { await page.goto('file://' + html, { waitUntil: 'domcontentloaded', timeout: 5000 }); } catch (e) { fail(`load@${vp.w}`, e.message); await ctx.close(); continue; }
    const dcl = Date.now() - t0; r[`dcl@${vp.w}`] = dcl;
    dcl <= MAX_DCL_MS ? ok(`dcl@${vp.w}`) : fail(`dcl@${vp.w}`, `${dcl} ms > ${MAX_DCL_MS}`);
    await page.waitForTimeout(150);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    scrollW <= vp.w + 1 ? ok(`no-hscroll@${vp.w}`) : fail(`no-hscroll@${vp.w}`, `scrollWidth ${scrollW} > ${vp.w}`);
    const smallTaps = await page.evaluate(() => [...document.querySelectorAll('button,a,[role=button],input[type=checkbox],input[type=radio]')]
      .filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.height < 40 || b.width < 40); }).length);
    smallTaps === 0 ? ok(`tap-size@${vp.w}`) : fail(`tap-size@${vp.w}`, `${smallTaps} tap targets under 40px`);
    const smallText = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
      if (!el.textContent.trim() || el.children.length) return false; const fs = parseFloat(getComputedStyle(el).fontSize); return fs < 13; }).length);
    smallText === 0 ? ok(`text-size@${vp.w}`) : fail(`text-size@${vp.w}`, `${smallText} text nodes under 13px`);

    if (vp.w === 390) {
      // behaviour tests
      let passed = 0;
      try {
        for (const step of tool.tests) {
          if (step.tap) await page.locator(step.tap).first().click({ timeout: 2000 });
          else if (step.type) await page.locator(step.type.sel).first().fill(step.type.text, { timeout: 2000 });
          else if (step.key) await page.keyboard.press(step.key);
          else if (step.wait) await page.waitForTimeout(Math.min(step.wait, 1500));
          else if (step.expect) {
            const loc = page.locator(step.expect.sel).first();
            if (step.expect.visible) await loc.waitFor({ state: 'visible', timeout: 2000 });
            else if (step.expect.count != null) { const n = await page.locator(step.expect.sel).count(); if (n !== step.expect.count) throw new Error(`count ${n} != ${step.expect.count}`); }
            else {
              const txt = (await loc.textContent({ timeout: 2000 })) ?? '';
              if (step.expect.contains && !txt.includes(step.expect.contains)) throw new Error(`"${txt.slice(0, 60)}" lacks "${step.expect.contains}"`);
              if (step.expect.matches && !new RegExp(step.expect.matches).test(txt)) throw new Error(`"${txt.slice(0, 60)}" !~ /${step.expect.matches}/`);
            }
          }
          passed++;
        }
        ok('tests'); r.tests = `${passed}/${tool.tests.length}`;
      } catch (e) { fail('tests', `step ${passed + 1} failed: ${e.message.split('\n')[0]}`); r.tests = `${passed}/${tool.tests.length}`; }
      await page.screenshot({ path: join(ROOT, 'qa', `${slug}.png`) });
    }
    requests.length === 0 ? ok(`zero-network@${vp.w}`) : fail(`zero-network@${vp.w}`, `${requests.length} requests: ${requests.slice(0, 3).join(', ')}`);
    consoleErrors.length === 0 ? ok(`console@${vp.w}`) : fail(`console@${vp.w}`, consoleErrors[0].slice(0, 120));
    await ctx.close();
  }
  r.pass = Object.values(r.checks).every(Boolean);
  writeFileSync(join(ROOT, 'qa', `${slug}.json`), JSON.stringify(r, null, 2));
  return r;
}

const browser = await chromium.launch();
let bad = 0;
for (const slug of slugs) {
  const r = await verifyOne(browser, slug);
  if (!r.pass) bad++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'} ${slug}  ${r.kb ?? '?'} kB  dcl ${r['dcl@390'] ?? '?'} ms  tests ${r.tests ?? '-'}${r.errors.length ? '\n   ' + r.errors.join('\n   ') : ''}`);
}
await browser.close();
process.exit(bad ? 1 : 0);

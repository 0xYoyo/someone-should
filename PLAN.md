# PLAN — one night

## The concept (so you know what you're building)
The internet is a graveyard of one sentence: *"someone should make an app that…"* Reddit, Hacker News, Stack Exchange — a decade of wishes with upvotes and replies saying "great idea!" and nothing built. Tonight: the 100 most-wanted get built. Each is a single file that runs offline on a phone. Every tile on the wall shows the stranger's real wish, its year, how many people agreed, and the finished working thing. A few wishes get a red NO stamp with a ≤5-word factual reason. The owner approves what ships. His name is the byline. Nothing else about him is on the page.

By morning the owner opens one URL on his phone and sees the wall. That is the deliverable.

## Roles (one cloud session each)

### FACTORY (session A)
Order of work — each step commits to `main` before the next starts:
1. **Harvest** → `data/raw.jsonl`. Sources, in priority order:
   - Hacker News via Algolia (open, no key): queries `"someone should make"`, `"someone should build"`, `"is there a tool"`, `"is there an app"`, `"is there a website"`, `"i wish there was an app"`, `"i wish there was a tool"`, `"why isn't there an app"`, `"does anyone know of an app"`, restricted to `tags=story,comment`, all pages. Keep: objectID, url, created_at, points, num_comments, title/comment_text (one line, ≤200 chars, trimmed to the wish sentence).
   - Stack Exchange `softwarerecs.stackexchange.com` via the public API (no key needed; 300 req/day; `pagesize=100`): questions sorted by votes, `filter=withbody` not needed — title + link + score + answer_count + creation_date. Prefer questions with `answer_count == 0` or `is_answered == false`.
   - Reddit `r/SomebodyMakeThis`, `r/AppIdeas`, `r/Lightbulb`: try `https://old.reddit.com/r/<sub>/top.json?t=all&limit=100&after=…` with a plain User-Agent, ≤1 request / 6 s, up to 10 pages each. If 403/429 twice, skip Reddit and note it in LEDGER. Keep: title (one line), permalink, created_utc, score, num_comments. **Never store author.**
   - `scripts/harvest.mjs` is a starting point; finish it.
   Target: 3,000+ raw candidates. Write the real count to LEDGER.
2. **Normalize + dedupe** → `data/wishes.json`. One `opus` pass over the raw set in chunks of 200: rewrite each into one plain-language wish sentence beginning "someone should make…" (≤120 chars, no editorializing), cluster duplicates across sources (same wish ≈ same entry; sum `agreed` = points + score + comments across duplicates; keep the earliest date as `year` and every source URL in `sources[]`). Drop: jokes, hardware, anything needing an account/login/paid API/server/other people's private data, anything unsafe (see CLAUDE.md). Classify the rest `buildable: true|false` with a one-line `why`.
3. **Rank** → `data/top.json`: the 100 highest `agreed` that are `buildable`, plus the 40 highest `agreed` that are not, each with a `no` reason from the vocabulary in `SPEC.md`. Sanity: diversity — no more than 5 of the 100 in the same category (timer/todo/notes/calculator/converter). If the top is boring, go deeper; wanted and interesting beats wanted and generic. Write the final list to LEDGER as 100 one-liners.
4. **Build** in batches of 8 parallel `opus` subagents, one tool each. Each subagent gets: `CONTRACT.md`, `design/tokens.css`, `design/tool-template.html`, its wish object. It writes `tools/<slug>/index.html` and `tools/<slug>/tool.json`, runs `node scripts/verify.mjs <slug>`, fixes once if red, reports PASS/FAIL in ≤5 lines. You record the result; you never open the HTML.
   After each batch: `git pull --rebase`, re-read `REVIEW.md`, commit `tools/` + an updated `data/built.json` (slug, status, verify summary), push, append LEDGER.
5. **Drop** anything that fails verify twice. Mark it `dropped` in `data/built.json` with the reason. Never ship a red tool. 70 good beats 100 mixed.
6. **Finish**: `data/built.json` complete; `qa/<slug>.png` screenshots for every PASS (verify.mjs writes them); LEDGER final line with counts and the three best and three weakest tools by your judgment.

### Resumability (FACTORY)
Everything is in the repo. If your session ends and is restarted with the same prompt: `git pull`, read `data/built.json`, skip every slug already `pass` or `dropped`, continue from the next unbuilt wish in `data/top.json`. Never rebuild a PASS.

### SHELL
The reviewer writes `index.html`, `about.html`, `review.html` directly (no cloud session) tonight. A SHELL session is started only if `REVIEW.md` asks for one. If you are that session, the brief is below.

Builds the site around the data. Works from `data/wishes.json` + `data/top.json` + `data/built.json` when they exist; until then, from `data/fixture/*.json` (same shape) so you never wait.
1. `index.html` — the wall, per `SPEC.md`. Static, no build step, no framework, no fonts, no requests beyond its own files. Reads `data/top.json` + `data/built.json` at load (fetch of same-origin JSON is fine) or inlines them at build via `scripts/bake.mjs` — your choice, but it must work from `file://` and from GitHub Pages.
2. The tile → full-screen tool player: tap a tile, the tool opens in a sandboxed iframe (`sandbox="allow-scripts"`, CSP `connect-src 'none'`), with the wish line, year, agreed, "built <date>", and a one-tap receipt drawer (source link, spec, tests passed, size, "network requests: 0").
3. NO stamps per `SPEC.md`.
4. The wish box: a GitHub issue link, prefilled title `someone should make an app that …`. No backend tonight.
5. `about.html` — the plain page (`SPEC.md`). The List with one entry.
6. Per-tool OG image is a stretch goal: `scripts/og.mjs` renders `og/<slug>.png` via Playwright from a template. Do it last.
7. Test at 390×844 and 360×780 in headless Chromium, and in a desktop width. Screenshot the wall to `qa/wall-*.png`. Commit.

### REVIEWER (not a cloud session)
Fable pulls hourly, reads LEDGER + commits + qa/, and writes `REVIEW.md`. Sessions obey it.

## Morning definition of done
- `index.html` opens on a phone, first frame is the wall, no vocabulary needed, no waiting.
- ≥70 tools PASS with screenshots; 0 red tools shipped.
- Every tile has a real source link and a real date.
- `about.html` exists with the List and the byline.
- LEDGER tells the owner exactly what happened, in numbers.

# PLAN2 — round two (FACTORY-2). Read CLAUDE.md, CONTRACT.md, BUDGET.md, REVIEW.md first. PLAN.md's FACTORY role still applies except where this file overrides it.

## Why round two
The owner looked at the 100 and said: most are 2014 developer wishes that exist a thousand times; building them in 2026 is pointless. He is right. Round one harvested only Hacker News and Software Recommendations SE. The living wishes are on Reddit and in recent threads. Round two fixes three things: **fresh human wishes**, an **existence gate** (stamp NO · exists: X instead of building it), and **scale** (as many as the remaining credit buys).

## Budget for this round: ≤ $150 (credit left ≈ $185). Stop at $150 equivalent, whatever the count.

## 1. Harvest 2 → `data/raw2.jsonl`
Network is Full. Try these in order, keep what works, log what doesn't:
1. **Arctic Shift** (public Reddit mirror, no login): `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=<sub>&limit=100&sort=desc&after=<ts>` paging by `created_utc`. Subs: `SomebodyMakeThis`, `AppIdeas`, `CrazyIdeas`, `Lightbulb`, `lightbulb`, `Showerthoughts` (only posts matching /someone should (make|build)|i wish there was|why isn.?t there an app/i), `startups` (same filter), `SideProject` (same). Also the text search endpoint if present: `/api/posts/search?query=someone%20should%20make&limit=100`. Target: 10,000+ posts, 2016–2026. Keep title, permalink, created_utc, score, num_comments. **Never store author.**
2. If Arctic Shift is unreachable: try `https://www.reddit.com/r/<sub>/top.json?t=all&limit=100` with a browser User-Agent; then `https://api.pullpush.io/reddit/search/submission/?subreddit=<sub>&size=100`. If every Reddit route fails, say so in LEDGER and go on with 3.
3. **Hacker News, recent only**: the round-one queries with `numericFilters=created_at_i>1672531200` (2023+), so the wishes are post-AI.
4. Merge with round one's `data/raw.jsonl` (don't re-harvest it).

## 2. Normalize + the existence gate → `data/wishes2.json`
`sonnet`, chunks of 250, same normalize prompt as round one plus one new mandatory field per wish:
- `exists`: `null`, or the name of a real, mainstream product that already does this wish well (Google Lens, Splitwise, Shazam, Notion, Apple Reminders, Forest, Libby, …). Rule: **if a normal person would find it in the App Store in one search, it exists.** A markdown viewer, a todo list, a pomodoro timer, a unit converter, a QR maker, a password generator, a JSON diff: exists. Be strict. When in doubt, it exists.
- `kind`: one of `everyday`, `social`, `money`, `health-ish` (no dosing/diagnosis), `home`, `travel`, `learning`, `fun`, `creative`, `dev`, `other`.
- `freshness`: year of the earliest source.
Buildable = offline single page, no account, no paid API, no server, safe (CLAUDE.md), AND `exists == null`.
Everything with `exists != null` becomes a NO tile: `NO · exists: <name>`. These are good tiles — they're the funny, honest part of the wall. Keep the top 150 by agreement.

## 3. Rank → `data/top2.json` (`build[]`, `reserve[]`, `no[]`)
Score = agreed × (1 + 0.15 × max(0, year − 2018)) × (dev kind ? 0.5 : 1). Diversity: ≤ 6% of the build list per kind; `dev` capped at 10% total. Skip anything already in `data/top.json` (built or NO). Build list length = everything buildable, ordered by score. Write the first 100 one-liners to LEDGER so the reviewer can see the flavour.

## 4. Build — tiers by model
- **Tier A (first 150 by score): `sonnet`** builders, CONTRACT.md unchanged. Expected ≈ $0.25/tool.
- **Tier B (the rest): `haiku`** builders, CONTRACT.md unchanged. Expected ≈ $0.08/tool. A Haiku FAIL gets one retry in `sonnet`; a second FAIL is dropped.
- 16 parallel. Push once per 2 batches. Record `model` honestly in `tool.json` and `data/built.json` (`sonnet-5.5` / `haiku-5.5`) — the receipt drawer shows it.
- After every 4 batches: `node scripts/verify.mjs --all` on the new slugs only (pass the slugs), and the running spend line in LEDGER. **Stop at $150 for this round.**
- Add every new tool to `data/built.json` (append; never remove round-one entries). Add a `tier` field: `A` / `B`. Round-one tools get `tier: "R1"` and the rank script sets `order` for the wall (below).

## 5. Wall order → `data/order.json`
Write `{"order":[slug,...]}` for all built tools: tier A first (by score), then round-one tools whose `exists` would have been `null` under the new gate, then tier B, then round-one tools that the new gate would have stamped (the 2014 dev tools) last. The shell reads `order.json` if present. This is how the first screens become good without deleting anything.

## 6. Done
`data/built.json`, `data/top2.json`, `data/order.json` committed; LEDGER final line with: raw harvested by source, buildable, NO count, built by tier, PASS/FAIL/dropped, spend, three best, three weakest. Then stop.

## Do not
- Do not touch `index.html`, `about.html`, `review.html`, `assets/` (the reviewer owns them).
- Do not rebuild or delete any round-one tool.
- Do not pad counts, invent wishes, or store usernames.

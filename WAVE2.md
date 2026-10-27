# WAVE 2 — recent wishes, at scale

You are the FACTORY session, wave 2. Read CLAUDE.md, PLAN.md, SPEC.md, CONTRACT.md, BUDGET.md, REVIEW.md (bottom section first) and LEDGER.md (last 10 lines). Wave 1 is done: 100 PASS, all committed under `tools/` and `data/built.json`. Do not touch wave-1 tools.

## Why wave 2 exists (owner's verdict on wave 1, verbatim gist)
"Most are from over a decade ago, things everyone has these days, millions of each. Implementing 2015 wishes in the age of AI is pointless." He is right: wave 1's wells were Software Recommendations SE (launched 2014) and old HN. Wave 2 must be **recent and human**: what people wished for in 2020–2026, in everyday life, not developer utilities.

## Harvest 2 — sources (network access is Full now)
Target ≥ 4,000 raw candidates dated **2020-01-01 or later**. Save to `data/raw2.jsonl` (same shape as raw.jsonl + `wave: 2`).
1. **Reddit via Arctic Shift** (public archive API, no auth): `https://arctic-shift.photon-reddit.com/api/posts/search` with params `subreddit=SomebodyMakeThis|AppIdeas|Lightbulb|CrazyIdeas|Showerthoughts(no)|mildlyinfuriating(only "someone should make")`, `after=2020-01-01`, `limit=100`, paginate with `after`/`before` timestamps; and a full-text search `query="someone should make an app"` / `"i wish there was an app"` / `"why isn't there an app"` / `"somebody needs to make"` across all subreddits, 2020+. Keep title, selftext first line, permalink, created_utc, score, num_comments. **Never store author.** Respect a 1 req/s pace. If the API refuses, try `https://arctic-shift.photon-reddit.com/api/posts/search?...` variants documented at its `/api` root; if Reddit data is truly unreachable, say so in LEDGER and continue with 2–3.
2. **Bluesky public search** (no auth): `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=<phrase>&limit=100&cursor=…` with phrases `"someone should make an app"`, `"somebody make an app"`, `"i wish there was an app"`, `"why is there no app"`, `"someone needs to build"`, `"app idea:"`, `sort=top`. Keep text (one line), uri→web URL (`https://bsky.app/profile/<did>/post/<rkey>`), createdAt, likeCount+repostCount+replyCount as agreement. **Never store handle/author.**
3. **Hacker News 2023+**: the wave-1 queries on HN Algolia with `numericFilters=created_at_i>1672531200`, plus `"Ask HN: Is there a"`, `"Ask HN: Why is there no"`, `"Ask HN: What tool"`.
4. **Mastodon public search** is optional: `https://mastodon.social/api/v2/search?q=…&type=statuses` needs auth; skip unless a public timeline hashtag `#appidea` works via `/api/v1/timelines/tag/appidea`.

## Normalize + rank 2
Same pipeline as wave 1 (`scripts/chunk.mjs`, sonnet normalize, `scripts/merge.mjs`), writing `data/wishes2.json`, `data/candidates2.json`, then **`data/top2.json`** with `build` (ordered) and `no`. Rules that differ from wave 1:
- **Recency first.** Score = agreed × (1 + 0.5 per year after 2020). A 2025 wish with 30 agreed outranks a 2014 wish with 200.
- **Human over developer.** At most 15% of the build list may be developer utilities (converters, diffs, viewers, regex, hex, JSON, SQL). The rest: everyday life, money, home, health-adjacent-but-safe (no dosing), kids, pets, food, travel, relationships, chores, study, hobbies, local life, work habits. If a wish is something a phone does natively in 2026, it gets `NO · your phone does this`. If a well-known app does it, `NO · exists: <name>` — and be honest about it; "exists" stamps are a feature.
- **Dedupe against wave 1**: anything already built in `data/built.json` is excluded.
- **Buildable** has the wave-1 meaning: single file, offline, no account, no paid API, no server, phone sensors on tap only.
- Target: `build` = **as many as the budget allows** (see below), ordered best-first; `no` = 60–100.

## Build 2
- Model: **`sonnet`** for every builder (wave 1 proved opus averages $0.57/tool; sonnet should land ≈ $0.20–0.30). Same CONTRACT, same verify gate, same one in-subagent retry + one fresh-subagent retry (sonnet again). If a batch's PASS rate falls under 70%, move the failing kinds to `opus` only.
- 12 parallel, batches, push once per batch (≤ 1 push / 10 min).
- `data/built.json` grows in place (append entries; `approved:false`).
- Also build the **40 wave-1 reserve** items from `data/top.json` → `reserve` with sonnet, after the first 100 wave-2 tools, so the owner's older strong picks (identical-image-check etc. are already built; the rest of reserve) exist too.
- **Every tool gets the embed snippet** that wave-1 tools now carry (see any `tools/*/index.html`: the `<style data-embed-hide>…</style><script>…embed…</script>` line before `</head>`). Add it to CONTRACT compliance — the wall needs it.

## Budget for wave 2
- Remaining credit ≈ **$160**. Hard cap for wave 2: **$140** (reviewer reserve $20).
- Expected: ~$10 harvest+normalize+rank, then builders. At ≈ $0.25/tool that's ~500 tools. Stop at **600 PASS** total in `built.json` or when wave-2 spend ≥ $140, whichever first. Meter per subagent exactly as BUDGET.md says; log every batch.
- If sonnet averages > $0.40/tool after two batches, switch builders to `haiku` for simple kinds (timers, trackers, lists, calculators) and keep sonnet for the rest; log the split.

## Wall
`index.html` already sorts recent + high-agreement wishes first and reads `data/top2.json` if present (merging with `top.json`). Don't edit `index.html`; if the shape you produce differs from `top.json`, match `top.json`'s shape instead.

## Done
LEDGER final line: wave-2 counts, spend, best 5, weakest 5, kinds distribution (% developer vs everyday), year distribution. Then stop.

# WAVE 2 — recent wishes, at scale

You are the FACTORY session, wave 2. Read CLAUDE.md, PLAN.md, SPEC.md, CONTRACT.md, BUDGET.md, REVIEW.md (bottom section first) and LEDGER.md (last 10 lines). Wave 1 is done: 100 PASS, all committed under `tools/` and `data/built.json`. Do not touch wave-1 tools.

## Why wave 2 exists (owner's verdict on wave 1, verbatim gist)
"Most are from over a decade ago, things everyone has these days, millions of each. Implementing 2015 wishes in the age of AI is pointless." He is right: wave 1's wells were Software Recommendations SE (launched 2014) and old HN. Wave 2 must be **wanted and human**: the most-agreed wishes on the internet, from everyday life, not developer utilities. Age is not the problem; obsolescence is. A 2018 wish with 4,000 upvotes beats a 2025 wish with 30. What removes the 2014 feel is (a) real Reddit-scale agreement and (b) honest `NO · exists: <name>` stamps for anything the world has since built.

## Harvest 2 — sources (network access is Full now)
Target ≥ 10,000 raw candidates, all years (Reddit's wells go back to 2012). Save to `data/raw2.jsonl` (same shape as raw.jsonl + `wave: 2`).
1. **Reddit via Arctic Shift** (public archive API, no auth) — VERIFIED REACHABLE by the reviewer at 10:05. Working call shape: `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=SomebodyMakeThis&after=<unix>&before=<unix>&limit=100` (unix seconds; `sort=desc` is by date; `sort_type`, `min_score`, `query`, `title` params return client errors — do NOT use them). Paginate by moving `after` to the last post's `created_utc`+1 until empty. Pull the ENTIRE history of: `SomebodyMakeThis`, `AppIdeas`, `Lightbulb`, `CrazyIdeas`, `AppIdea`, `Startup_Ideas`, `SideProject` (only titles containing "someone should"/"wish there was"/"why isn't there"/"someone make"), `mildlyinfuriating` is too big — skip. Sort locally by `score + num_comments`. Keep title, first line of selftext, permalink, created_utc, score, num_comments. **Never store author.** ~1 req/s; expect 300–600 calls. This is the main well; HN and Bluesky are secondary.
2. **Bluesky public search** (no auth): `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=<phrase>&limit=100&cursor=…` with phrases `"someone should make an app"`, `"somebody make an app"`, `"i wish there was an app"`, `"why is there no app"`, `"someone needs to build"`, `"app idea:"`, `sort=top`. Keep text (one line), uri→web URL (`https://bsky.app/profile/<did>/post/<rkey>`), createdAt, likeCount+repostCount+replyCount as agreement. **Never store handle/author.**
3. **Hacker News 2023+**: the wave-1 queries on HN Algolia with `numericFilters=created_at_i>1672531200`, plus `"Ask HN: Is there a"`, `"Ask HN: Why is there no"`, `"Ask HN: What tool"`.
4. **Mastodon public search** is optional: `https://mastodon.social/api/v2/search?q=…&type=statuses` needs auth; skip unless a public timeline hashtag `#appidea` works via `/api/v1/timelines/tag/appidea`.

## Normalize + rank 2
Same pipeline as wave 1 (`scripts/chunk.mjs`, sonnet normalize, `scripts/merge.mjs`), writing `data/wishes2.json`, `data/candidates2.json`, then **`data/top2.json`** with `build` (ordered) and `no`. Rules that differ from wave 1:
- **Agreement first.** Rank by `agreed` (score + comments, summed across duplicates). Year is only a tiebreak. Do not weight by recency.
- **Obsolescence check is mandatory and strict.** For every wish in the top 400, an `opus` checker asks: does a well-known product do this today (2026)? If yes → `NO · exists: <name>` (that stamp is content, not a failure). If the phone does it natively → `NO · your phone does this`. Only wishes that are still unmet, or whose existing solutions are paid/account-walled where an offline single file is a real answer, get built.
- **Human over developer.** At most 15% of the build list may be developer utilities (converters, diffs, viewers, regex, hex, JSON, SQL). The rest: everyday life, money, home, health-adjacent-but-safe (no dosing), kids, pets, food, travel, relationships, chores, study, hobbies, local life, work habits. If a wish is something a phone does natively in 2026, it gets `NO · your phone does this`. If a well-known app does it, `NO · exists: <name>` — and be honest about it; "exists" stamps are a feature.
- **Dedupe against wave 1**: anything already built in `data/built.json` is excluded.
- **Buildable** has the wave-1 meaning: single file, offline, no account, no paid API, no server, phone sensors on tap only.
- Target: `build` = **as many as the budget allows** (see below), ordered by agreement; `no` = as many as the check produces (100+ is fine — a long NO wall is honest and funny).

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

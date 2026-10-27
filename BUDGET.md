# BUDGET — $250 of cloud credit, total, for everything. No top-ups exist.

Sessions can't see their own spend, so the caps are structural. Count, don't guess.

## FACTORY (session A) — target ≤ $180
- Orchestrator: `opus`. Keep its context small: never read tool HTML; read only verify output and subagent 5-line reports.
- Harvest + normalize + rank: ≤ 25 `opus` subagent calls total (chunks of 200 wishes each for normalize; 1–3 for rank).
- Build: exactly one `opus` subagent per tool. Each subagent: one build + at most one fix. **Hard cap: 140 build subagents** (100 target + reserve). Stop building at 100 PASS or at 140 spawned, whichever first.
- Verify loops run as `node scripts/verify.mjs` from the subagent itself (no extra model calls). If a subagent needs a second model to fix, it's `haiku`.
- Estimated: ~$1–1.5 per tool including thinking → $100–150 for 100 PASS with drops; harvest/rank ~$15; orchestrator ~$15.
- Push at most every 10 minutes (GitHub Pages soft-limits 10 deploys/hour, shared with the shell).

## SHELL (session B) — target ≤ $45
- One `opus` session, no subagents except ≤ 2 `haiku` for mechanical tasks (OG renders, screenshots).
- Push at most every 10 minutes.

## RESERVE — $25
- For the morning: re-verify, a repair wave on the 5 weakest tools, approve script. Not for tonight.

## Stop conditions (either session)
- You hit your cap → finish the current batch, commit, write the final LEDGER line, stop.
- The reviewer writes `STOP` at the top of REVIEW.md → same.
- 06:30 Asia/Jerusalem → wrap up regardless: commit what passes, write LEDGER, stop.

# BUDGET — $250 of cloud credit, total. No top-ups exist. Meter yourself.

## How you measure spend (this is not optional)
Every time a subagent finishes, the harness tells you its token usage (`subagent_tokens`). Record it. Convert with a conservative blended rate:
- `opus` ≈ **$8 per 1M tokens**
- `sonnet` ≈ **$3.5 per 1M tokens**
- `haiku` ≈ **$1 per 1M tokens**
Keep a running total in `LEDGER.md` after **every batch**: tokens by model, estimated $, tools PASS so far, average tokens per PASS tool. The reviewer reads these numbers hourly.

## FACTORY — total target ≤ $200 (≈ 25M opus-equivalent tokens). Reserve $50 for the morning.
- Orchestrator: `opus`. Keep its context small: never read tool HTML; read only verify output and the 5-line subagent reports. Spawn builders in the background, 8 at a time, and wait for the batch.
- Harvest + normalize + rank: ≤ 25 subagent calls total (`opus` for rank; `sonnet` is fine for normalize chunks).
- Build: one subagent per tool, one build + one fix inside it. **Hard cap: 140 build subagents.** Stop at 100 PASS or 140 spawned.

### Adaptive rules — check after every batch, write the decision in LEDGER
1. Compute `avg = tokens per PASS tool so far` and `projected = avg × (100 − PASS so far)`.
2. If `projected + spent > $200` equivalent → **switch builders to `sonnet`** for the next batch. Note it. Sonnet tools are fine; the gate is the same.
3. If after a sonnet batch the PASS rate drops below 60% → go back to `opus` for the hardest wishes only (the ones that failed) and keep `sonnet` for the rest.
4. If cumulative spend ≥ $180 equivalent and PASS < 100 → one final `sonnet` batch from the reserve list, then stop.
5. If the first batch of 8 averages > 400k tokens per tool → something is wrong with the subagent brief (it's reading too much). Fix the brief (shorter, point at files, don't paste them) before batch 2. Do not just continue.
6. A tool that FAILs its one in-subagent retry gets **one more attempt in a fresh `sonnet` subagent** with the verify errors pasted into its brief. Only after that is it `dropped`. Dropped slugs are replaced from the reserve list so the target stays 100.

## Stop conditions
- 100 PASS and `data/built.json` committed → final LEDGER line, stop.
- 140 build subagents spawned → finish batch, commit, stop.
- Running total ≥ $200 equivalent → finish batch, commit, stop.
- The reviewer writes `STOP` as the first line of REVIEW.md → finish batch, commit, stop.
- 09:30 Asia/Jerusalem → wrap up regardless: commit what passes, write LEDGER, stop.
- If the platform cuts the session (credit exhausted, timeout): everything is already committed per batch; the next session resumes from `data/built.json`.

## Push cadence
At most one push every 10 minutes (GitHub Pages deploys from main; it soft-limits ~10 builds/hour).

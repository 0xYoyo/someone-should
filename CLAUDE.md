# someone should.

Every "someone should make an app that…" on the internet — built.

You are a Claude Code cloud session working on this repo overnight while the owner (Yoav Zrihan, 0xYoyo) sleeps. A reviewer session (Fable, running elsewhere) pulls this repo hourly and writes corrections into `REVIEW.md`. Nobody will answer questions tonight. Decide, log, continue.

## Read, in this order, before doing anything
1. `PLAN.md` — the concept and the roles. Find your role from your prompt.
2. `SPEC.md` — what the site is. Every pixel decision is in there.
3. `CONTRACT.md` — the rules every built tool must satisfy. Non-negotiable.
4. `design/tokens.css` and `design/tool-template.html` — the shared design system. Every tool inlines these.
5. `REVIEW.md` — the reviewer's latest corrections. **Re-read it (after `git pull --rebase`) at the start of every batch/wave.** It overrides this file.
6. `BUDGET.md` — your caps. Stop when you hit them. Log in `LEDGER.md`.

## Rules for all sessions
- **Everything on the site is real.** Every wish on the wall is a real public post with a real link and date. Never invent a wish, a count, or a date. If a number can't be sourced, don't show it.
- **No copy about the owner anywhere.** Not one sentence. His name appears as a byline (`SPEC.md` says where). No "passionate", no "journey", no emoji, no exclamation marks. If a sentence sounds like an assistant wrote it, delete it.
- **Words on the page are the strangers' words.** The only words that are ours: tile metadata (year, agreed count, built date), the NO reasons (≤5 words, facts only, see `SPEC.md`), and the byline.
- **Quote one line, link out, no usernames.** Never display a poster's username. Never store or display anything beyond the one-line wish text, its URL, date, and vote/comment counts.
- **Zero network at runtime.** Built tools make no network requests, ever. The wall page loads only its own static files. There is no server, no API key, no analytics, no fonts from a CDN. System font stack only.
- **Commit small and often, to `main`, with `git pull --rebase` before every push.** The factory writes under `data/` and `tools/`; the shell writes `index.html`, `about.html`, `assets/`. Don't touch the other role's paths. Commit messages: `factory: batch 3 — 8 built, 1 dropped` / `shell: wall renders 100 tiles at 390px`.
- **Log every batch to `LEDGER.md`** (append a line: time, role, what you did, subagents spawned, estimated spend). The reviewer reads this.
- **Keep the orchestrator's context small.** Never read a built tool's HTML into the orchestrating session. Subagents build; the verify script judges; you read only the verify report.
- **If something is impossible, do the next best real thing and write why in `LEDGER.md`.** Don't stop the whole run for one blocker.
- **Models:** builders = `opus` by default, `sonnet` when BUDGET.md's adaptive rules say so (one subagent per tool). Normalize chunks = `sonnet`. Ranking = `opus`. Mechanical tasks = `haiku`. Never Fable. **Record every subagent's token usage in LEDGER.md** — BUDGET.md tells you how.
- Safety: never build a wish that scrapes a site, impersonates, surveils, handles passwords/payments/medical dosing, or targets a person. Those get a NO stamp with the reason `needs: your bank password` / `not safe` — see `SPEC.md` for the reason vocabulary.

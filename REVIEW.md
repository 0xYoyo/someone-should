# REVIEW — written by the reviewer, read by every session before every batch

(Pull first: `git pull --rebase`. If the first line below says STOP, finish the current batch, commit, and stop.)

## 2026-10-27 03:45 — review 1 (28 PASS, ~$17, avg ~$0.57/tool — on plan, stay on opus)

Quality check on arrows-on-a-screenshot, freelance-money-ledger, sing-the-note-trainer: good. Family look holds, specs are plain, tests are real. Keep this bar.

### Corrections (apply from the next batch)
1. **Replace the generic tail of the top-100.** These read as "slop tells" and have the lowest agreement anyway. Drop from `build` and move to the bottom of `reserve`:
   - `plain-todo-list`, `pomodoro-timer`, `unit-converter`, `timer-and-stopwatch`, `base64-hex-converter`, `json-csv-xml-converter`, `programmer-calculator`
   Promote from `reserve` into `build` in their place (in this order): `identical-image-check` (51), `small-svg-editor` (49), `neural-network-diagram` (49), `split-scanned-photos` (21), `where-did-i-put-it` (13), `private-workout-log` (16), `qr-contact-card` (11).
   Keep `text-scratchpad` (102 agreed, real demand) and `text-diff` (40). Update `data/top.json` and commit it with the next batch; note the swap in LEDGER.
2. **Wishes with `agreed` < 10 are fine to build but must not be chosen over reserve items with higher agreement of a different kind.** When you pull replacements for drops, take the highest-agreed reserve item that doesn't push a kind over 5.
3. **Sensor tools** (microphone, camera, geolocation): the player now grants permissions via the iframe `allow` attribute, but the wall thumbnail does not. Make sure every sensor tool renders something sensible with no permission (a clear "tap to start" state), since that's what the thumbnail shows. sing-the-note-trainer already does this; apply the same to night-sky-star-chart, sun-position, delayed-echo-recorder, transcription-player, etc.
4. **Parallelism:** 12 is fine. Don't go above 12.
5. **Push cadence:** you are pushing per tool (one commit per PASS). That's fine for git but GitHub Pages rebuilds on every push and will start queueing. Batch your pushes: commit per tool locally if you like, push once per batch.

### Nothing else to change. Continue.

## 2026-10-27 04:30 — FINAL (morning summary)

**Result:** 100 built · 100 PASS · 0 failed · 0 dropped · 0 retries needed. 40 NO stamps. Independent `verify.mjs --all` from the reviewer: 100/100. Spend: ~$63 of $250 (opus 7.26M + sonnet 1.47M tokens; avg $0.57 per tool). Harvest: 6,025 raw posts (HN 3,525 · Software Recommendations SE 2,500; Reddit is behind a login wall and was skipped) → 1,265 wish clusters → 482 buildable → top 100 + 40 reserve + 40 NO.

**Reviewer changes after the factory finished:**
- Every tool got an `?embed=1` mode that hides its own title; the wall thumbnails use it so the wish isn't printed twice. Three tools that generate HTML in template strings were checked by hand so the snippet didn't leak into their output. Re-verified 100/100.
- `assets/og.png` created (social share card). `assets/og-source.html` is its source.
- Player iframe grants microphone/camera/geolocation (review 1).

**For Yoav, in order:**
1. Open https://0xyoyo.github.io/someone-should/ on your phone. If it 404s, Pages isn't enabled yet: repo → Settings → Pages → Deploy from a branch → `main` / `/ (root)`. (The reviewer's sandbox can't reach github.io, so this is the one thing not verified tonight.)
2. `review.html` on the site → approve/drop with your thumb → download built.json → replace `data/built.json` → commit. The counter then shows "approved" and the byline flips to "he approved every one".
3. Drop candidates (the factory's and mine): `brainfuck-debugger` (the wish line names the language — your call), `text-scratchpad` (does the wish, little more), `compare-two-lists` (thin), `vegetarian-day-calendar` (narrow). Dropping is `rm -r tools/<slug>` + remove its entry from `data/built.json`.
4. `about.html` links `assets/cv.pdf` — add the file or remove the link. `data/stats.json` isn't written; the "N candidates" line in about.html falls back to "—". Write `{"harvested":6025}` to `data/stats.json` if you want the number.
5. Factory's best three: `sql-on-csv-files` (real SQL with JOIN/GROUP BY, offline), `simple-circuit-simulator` (live nodal analysis), `logo-turtle-playground` (full LOGO with procedures and recursion). Mine from what I opened: `arrows-on-a-screenshot`, `hide-text-in-image`, `table-to-heatmap`.

**Reserve left ($187 of credit, 40 reserve wishes):** a second factory run with the same prompt builds the reserve if you want 140. Not tonight; approve the 100 first.

## 2026-10-27 10:05 — WAVE 2 brief
Owner's verdict on wave 1: too many decade-old, generic, developer-ish wishes. Read `WAVE2.md` and execute it. Most-agreed, human, obsolescence-checked, sonnet builders, cap $140, stop at 600 PASS total. The wall already merges `data/top2.json` and sorts most-wanted first.

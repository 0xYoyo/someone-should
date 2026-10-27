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

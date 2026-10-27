# MORNING — what Yoav does when he wakes up (≈15 minutes)

1. Open `https://0xyoyo.github.io/someone-should/` on your phone. That's the wall.
2. Read `LEDGER.md` bottom-up: counts, what was dropped and why, the three best / three weakest.
3. Open `review.html` (served from the same site) — it shows every PASS tool's screenshot with its wish and two buttons: **approve** / **drop**. Tap approve/drop on each (or "approve all pass", then drop the bad ones). Press **download built.json**, replace `data/built.json` in the repo with it, commit. (Or run `node scripts/approve.mjs --all-pass` locally.) The counter and the green dots update on the next deploy.
4. Rewrite any NO reason you don't like in `data/top.json` → `no[].no`. Five words max, facts only.
5. If anything is embarrassing: delete its folder under `tools/`, remove it from `data/built.json`, commit. Never fix in public; drop and rebuild later.
6. Post. The share link is the root URL. Each tool also has its own URL: `/tools/<slug>/`.

## Posting lines (pick one, don't embellish)
- "every 'someone should make an app that…' on the internet. built."
- "100 things strangers wished existed. they do now. [link]"
- Hebrew: "100 אפליקציות שאנשים ביקשו באינטרנט במשך עשור. בניתי את כולן בלילה אחד."

## What to say when asked how
The numbers only: harvested N, ranked by agreement, built by Opus 5.5 subagents under a verify gate (single file, zero network, behaviour tests, phone viewport), you approved what shipped. Link the repo.

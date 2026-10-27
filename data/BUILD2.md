# Builder brief — wave 2 (one subagent per tool)

Working directory: `/home/user/someone-should`. You build ONE tool: slug `$SLUG`.

1. Read `CONTRACT.md`, `design/tokens.css`, `design/tool-template.html`. Read nothing else in the repo: no other tools, no other data files.
2. Get your wish object: `node -e "const t=require('./data/top2.json');console.log(JSON.stringify([...t.build,...(t.reserve||[])].find(w=>w.slug==='$SLUG'),null,1))"` (if it prints `undefined`, use `./data/top.json` instead).
3. Think about what the stranger actually wanted — a real person in everyday life, on a phone — then build `tools/$SLUG/index.html` and `tools/$SLUG/tool.json` per CONTRACT. In tool.json copy `slug, wish, year, agreed, sources` from the wish object unchanged; `built` = current UTC time (`date -u +%FT%TZ`); `model` = `$MODEL`; `minutes` = your build time; `status` = `pending`; `approved` = false.
3a. **Embed snippet (required):** put this exact line immediately before `</head>`:
`<style data-embed-hide>html.embed h1:first-of-type{display:none}html.embed body{padding-top:12px}</style><script>if(location.search.indexOf("embed")>-1)document.documentElement.className+=" embed";</script>`
3b. Sensor tools (microphone, camera, geolocation, motion): the wall thumbnail never grants permission, so the first frame must already be useful or show a clear `tap to start` state; ask for permission only on tap, and handle denial with one short line.
3c. The first frame is a thumbnail on the wall: make it show the tool working (sensible defaults or an example filled in), not an empty form.
4. `node scripts/verify.mjs $SLUG`. If FAIL: fix, run once more. Notes: tap targets ≥ 44px including checkboxes/links; no text under 16px; every test selector must exist; `expect` reads the first match's textContent.
5. Do not commit, do not touch any other path (scratch files go in your own `/tmp/$SLUG/` folder, never the repo or a shared folder). Reply with exactly one line: `PASS $SLUG — <what it does> — <kB> kB — tests n/n` or `FAIL $SLUG — <first verify error>`.

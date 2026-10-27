# Upgrade brief — showcase tools (one subagent per tool)

Working directory: `/home/claude/someone-should`. You UPGRADE one existing tool: `tools/$SLUG/`. It already passes the verify gate but it is thin. These five are the first things strangers will see in the launch video and post, so they must make someone say "oh that's actually good" within 5 seconds on a phone.

1. Read `CONTRACT.md`, `design/tokens.css`, and the current `tools/$SLUG/index.html` + `tool.json`. Read nothing else.
2. Rebuild `tools/$SLUG/index.html` to the bar below. Keep: single file, zero network, the CSP meta, the embed snippet line before `</head>`, the family look (tokens, system font, paper background). You may use one accent colour and simple inline SVG/canvas art; it should feel crafted and delightful, not like a form. Size limit 60 kB.
3. Update `tool.json`: new `spec` (3 lines), new `tests` (3–6 steps that prove the real behaviour), `built` = now (UTC), `model` = `$MODEL`, `minutes`. Keep `slug, wish, year, agreed, sources` unchanged.
4. First frame = the thumbnail: it must look alive and inviting with no input (an example in progress, art visible), not an empty form.
5. `node scripts/verify.mjs $SLUG` → fix → rerun until PASS (max 3 runs). Then `node scripts/thumbs.mjs $SLUG`.
6. Do not commit. Reply with one line: `PASS $SLUG — <what changed> — <kB> kB — tests n/n` or `FAIL $SLUG — <first error>`.

## The bar, per tool
$BAR

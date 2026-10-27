# SPEC — the site

## One sentence
A full-screen wall of strangers' real wishes, each with the finished working thing under it, drifting; a counter; a few red NO stamps; a one-line byline. Nothing else.

## The first frame (phone, 390×844, sound off, second 2)
- Top, small mono: `someone should.` on the left, the counter on the right: `100 wishes · 84 built · 16 told no`. Counts are computed from `data/built.json`; never typed.
- The wall: tiles in a single column on phones (two on tablets, three+ on desktop, masonry). Each tile:
  - the wish, verbatim normalized sentence, large (≥22px on phone), plain, sentence case, no quotes marks, no bold
  - under it, one mono line: `2019 · 3,100 agreed` (year = earliest source; agreed = summed votes+comments; format with thin spaces/commas; if agreed < 10 show `2019` only)
  - under that, the tool itself, live, in a sandboxed iframe at 1:1, cropped to a 4:5 frame, pointer-events off on the wall (tap anywhere on the tile to open)
  - built tiles have a tiny green dot and `built 28 oct`; nothing else
- NO tiles: same wish line, same mono line, then a red stamp — rotated −6°, uppercase, border 2px, `NO · exists: Google Lens`. No iframe. Stamps are rare on the first screen: at most 1 in the first 6 tiles, then roughly 1 in 7.
- The wall drifts upward on its own at ~12px/s until the first touch/scroll, then stops forever (respect `prefers-reduced-motion`: no drift).
- Byline: at the very bottom of the wall and nowhere else: `built overnight by yoav zrihan's agents. he approved every one.` → links to `about.html`. Lowercase. Mono. Small. Not fixed.
- Nothing else. No nav, no hero, no intro sentence, no "scroll to explore", no logo, no social icons, no cookie notice.

## Opening a tile
- View-transition (if supported) to full screen: the tool fills the viewport in its iframe (`sandbox="allow-scripts allow-forms"`, CSP via `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:;">` inside each tool).
- A thin top bar: the wish line (one line, ellipsis), close ×.
- A pull-up receipt drawer (handle at the bottom): `wished 14 mar 2019 on hacker news → link`, `agreed 3,100`, `spec` (3 lines), `tests passed 3/3`, `size 14 kB`, `network requests 0`, `built 28 oct 2026 · opus 5.5 · 4 min`, `approved by yoav 28 oct 2026` (only when `approved: true`; otherwise `not yet approved`). All from `tool.json`. Nothing hand-written.
- Share: a plain `copy link` button (`navigator.share` if available). The link is `#<slug>`; the wall opens that tile directly on load.

## NO reasons — the only vocabulary
≤5 words, facts only, lowercase after `NO ·`. Allowed shapes:
- `exists: <name>` (name a real product; must be true)
- `needs: your bank password` / `needs: camera hardware` / `needs: a server` / `needs: other people's data`
- `not safe`
- `your phone does this` (+ optional: `hold the side button`)
- `too vague`
Nothing else. No jokes. No opinions. The stamp is funny because it's true.

## about.html — the List
Plain page. System font. Max 60ch. Content, exactly:
```
yoav zrihan
rishon lezion · github.com/0xYoyo · cv (link)

things, world-sized, built in a day, running on their own

  2026-10-28   someone should.   every "someone should make an app that…" — built.   → /
```
Then a short `how` section, 5 lines max, factual: harvested N wishes from HN / Stack Exchange / Reddit; ranked by agreement; built by Opus 5.5 subagents under a verify gate (single file, zero network, three behaviour tests, phone viewport); he approves what ships; source: link to this repo. The factory (yoyo-loop) is mentioned once, as a link, as the method. That's the only place his work is described anywhere on the site.

## Design language
- Background `#f4f1ea` (warm paper). Ink `#141414`. Mono meta `#6b6b6b`. NO red `#c8321e`. Built green `#2e7d4f`. Tiles have no border, no shadow, no radius >4px. Whitespace does the work.
- Type: system stack `-apple-system, "SF Pro Text", "Segoe UI", Inter, Roboto, sans-serif`; mono `ui-monospace, "SF Mono", Menlo, monospace`. No webfonts. No icons libraries. Any icon is inline SVG, 1.5px stroke.
- Motion: only the drift, the open transition, and the drawer. Nothing bounces. Nothing fades in on scroll.
- Dark mode: follow `prefers-color-scheme`: paper → `#121212`, ink → `#ededed`, meta → `#9a9a9a`.
- The tools inherit exactly these tokens (`design/tokens.css` inlined) so the wall reads as one family.

## What the site is NOT
Not a portfolio with sections. Not a dashboard. Not a chat. Not a game. Not a story. If a feature needs explaining, delete it.

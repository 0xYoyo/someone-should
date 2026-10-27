# CONTRACT — every built tool

You are an `opus` subagent. You have one wish object. You build exactly one tool. You have one retry. Then you report in ≤5 lines and stop.

## The wish object (from `data/top.json`)
```json
{ "slug": "fastest-supermarket-line", "wish": "someone should make an app that tells you which supermarket line is fastest", "year": 2019, "agreed": 3100, "sources": [{"site":"hn","url":"https://news.ycombinator.com/item?id=…","date":"2019-03-14","points":212,"comments":88}], "category": "everyday", "spec_hint": "…" }
```

## What you produce
1. `tools/<slug>/index.html` — ONE file. Everything inline. Starts from `design/tool-template.html` with `design/tokens.css` pasted into its `<style>`. No external URLs of any kind: no fonts, no CDN, no images (inline SVG or data: only), no fetch/XHR/WebSocket/beacon. The CSP meta in the template stays. If the wish truly needs the network, do the best offline version and say so in `tool.json.notes`; if there is no meaningful offline version, report `FAIL: needs network` and stop.
2. `tools/<slug>/tool.json`:
```json
{ "slug": "...", "wish": "...", "year": 2019, "agreed": 3100, "sources": [...],
  "spec": "three lines: what it does, how you use it, what it does not do",
  "tests": [
    {"tap": "#start"}, {"wait": 300}, {"expect": {"sel": "#time", "matches": "\\d+"}},
    {"type": {"sel": "#name", "text": "milk"}}, {"tap": "#add"}, {"expect": {"sel": "li", "contains": "milk"}}
  ],
  "status": "pending", "built": "2026-10-28T02:00:00Z", "model": "opus-5.5", "minutes": 4, "approved": false, "notes": "" }
```
`tests` = 3 to 6 steps. They must prove the wish works, not that the page loads. Allowed steps: `tap`, `type`, `wait` (ms, ≤1500), `expect` (`contains` | `matches` | `visible` | `count`), `key` (e.g. "Enter"). Selectors must exist in your HTML.

## Hard rules (verify.mjs enforces 1–6)
1. Loads with the network cut: zero requests besides the file itself.
2. Interactive in < 1 s on a throttled phone (DOMContentLoaded < 800 ms, no blocking work on load).
3. Works at 360×780 and 390×844: no horizontal scroll, tap targets ≥ 44px, text ≥ 16px.
4. All `tests` pass.
5. File ≤ 60 kB. Prefer ≤ 25 kB.
6. No console errors.
7. Persistence: use `localStorage` wrapped in try/catch when the wish implies memory (lists, scores, settings). Degrade gracefully when storage throws.
8. Sensors are allowed only when the wish needs them and the browser exposes them (DeviceMotion, Geolocation, camera via getUserMedia). Always a visible fallback when denied. Never request on load; request on tap.
9. The tool does the wish. Not a demo of it. Not a "concept". If the wish is "tells you which supermarket line is fastest", the tool must actually give a line recommendation from inputs a person can provide in the queue (people per line, items per cart, cashier speed tap-tempo). Think for 2 minutes about what the person who posted it actually wanted, then build that.
10. Looks like the family: tokens, system font, paper background, one accent at most. Title = the wish sentence, shown once at the top, small. No "welcome", no instructions longer than one line, no emoji, no footer, no credits.
11. Handles its own empty state and its own errors with one short line, never an alert().
12. Conventional, readable code. Vanilla JS. No frameworks. Comments only where a human would need one.

## Procedure
1. Read this file, the two design files, your wish object. Decide the smallest thing that fully does the wish. Write the spec (3 lines) and the tests FIRST.
2. Write `index.html`.
3. `node scripts/verify.mjs <slug>` → if red, fix once, run again.
4. Report: `PASS <slug> — <one line what it does> — <kB> — tests 4/4` or `FAIL <slug> — <reason>`. Nothing else. Do not paste code into your report.

## After a tool passes
Run `node scripts/thumbs.mjs <slug>` so the wall has its thumbnail (`assets/thumbs/<slug>.jpg`). The wall shows static thumbnails, not live iframes.

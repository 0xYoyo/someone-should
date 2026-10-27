# Rank brief (one opus subagent)

Read `data/candidates.json` only (`buildable`: up to 450 clusters sorted by `agreed`; `not`: up to 150 not-buildable with a draft `no`). Each row: `topic, wish, category, year, agreed, n (sources), why, no?`. Do not open other data files.

Write `data/rank.json`:
```json
{ "merge": [["keep-topic","dup-topic", "..."]],
  "build":   [{"topic":"...","slug":"...","spec_hint":"...","wish":"(optional rewording)"}],
  "reserve": [ same shape ],
  "no":      [{"topic":"...","slug":"...","no":"..."}] }
```

- `merge`: groups of topics that are the same wish worded differently (first = keeper). Only true duplicates.
- `build`: exactly **100**. Start from the highest `agreed`, but: it must be honestly buildable as ONE offline HTML file on a phone (re-judge; the normalize pass was generous). It must be a thing a person would open and use, not a library/IDE/OS feature. **Diversity**: at most 5 in any one kind (timers, todo/notes, calculators, converters, trackers, text-utils, dev-utils). If the top is boring or generic, go deeper: wanted *and* interesting beats wanted and generic. Order the list so the most interesting/broadly-wanted come first and generic ones (pomodoro, plain todo, unit converter) last.
- `reserve`: **40** more buildable picks in the same spirit (replacements for dropped tools).
- `no`: **40** genuine, high-agreed wishes that cannot be built offline, from `not` (or from `buildable` rows you re-judged). `no` uses ONLY: `exists: <real product name>` (only if certain it exists and does exactly this), `needs: a server`, `needs: other people's data`, `needs: camera hardware`, `needs: your bank password`, `your phone does this`, `too vague`, `not safe`. ≤5 words. Facts, no jokes.
- `slug`: 2–5 word lowercase kebab, describes the tool (e.g. `split-the-bill-fairly`). Unique across all lists.
- `spec_hint`: ≤25 words: what the smallest complete offline tool does — inputs → output. This is what the builder reads.
- `wish` (optional): only to fix a clumsy normalized sentence; keep the stranger's meaning; must start `someone should make`, ≤120 chars.

Then run `node scripts/top.mjs` and fix rank.json until it prints `top.json: build 100 · reserve 40 · no 40`. Report: that line plus, one per line, the 100 build picks as `slug — wish`.

# Normalize brief (one sonnet subagent per chunk)

Input: `data/chunks/NN.jsonl`, one candidate per line: `{k, text, date, points, comments, tags?}`. `text` is a stranger's post title, question title, or comment sentence.
Output: `data/norm/NN.json`, a JSON array with **one object per input line, same order, same `k`**:

```json
{"k":"hn:123","drop":null,"wish":"someone should make an app that …","topic":"split-restaurant-bill","category":"money","buildable":true,"why":"pure arithmetic on typed items","no":null}
```

- `drop`: `null`, or one of `not-a-wish` (not asking for software: news, launches "Show HN", opinions, rhetorical), `joke`, `hardware`, `unsafe` (scraping, impersonation, surveillance, passwords/payments, medical dosing, targeting a person), `too-specific` (one person's niche setup, a specific vendor/API/OS integration nobody else needs). Dropped rows still need `k` and `drop`; other fields may be null.
- `wish`: one plain sentence beginning `someone should make` (usually `someone should make an app that …`, or `… a tool that …`, `… a site that …`). ≤120 chars. Lowercase except proper nouns. No editorializing, no "simple", no "free", no brand of the asker's OS unless essential. Keep the stranger's actual ask; don't upgrade it.
- `topic`: 2–5 word lowercase kebab key naming the core need, so the same wish from different people gets the **same** key (e.g. every bill-splitting wish → `split-restaurant-bill`; every "markdown note app" → `markdown-notes`). Prefer the most generic natural key.
- `category`: one of `everyday money time health food travel home work writing text learning kids music media photo games social outdoors data dev design math files privacy accessibility other`.
- `buildable`: true only if the whole wish can be done as **one offline HTML file in a phone browser**: no server, no network, no account, no other people's data, no OS/desktop integration, no camera-only magic (ML recognition), no hardware. In-browser text/number/date/audio/canvas work is fine; localStorage is fine; device sensors on tap are fine.
- `why`: ≤12 words, why buildable or not.
- `no`: only when not dropped and not buildable — the stamp reason, using ONLY these shapes: `exists: <real product name>` (only if you are sure it exists and does this), `needs: a server`, `needs: other people's data`, `needs: camera hardware`, `needs: your bank password`, `your phone does this`, `too vague`, `not safe`.

Work: read the chunk with `cat`, write the output with the Write tool (valid JSON), then run
`node -e "const a=require('/home/user/someone-should/data/norm/NN.json'),b=require('fs').readFileSync('/home/user/someone-should/data/chunks/NN.jsonl','utf8').trim().split('\n').map(JSON.parse);if(a.length!==b.length||a.some((o,i)=>o.k!==b[i].k))throw 'mismatch';console.log('ok',a.length,a.filter(o=>!o.drop).length,a.filter(o=>o.buildable).length)"`
and fix until it prints `ok`. Never invent candidates. Report one line: `chunk NN: total/kept/buildable`.

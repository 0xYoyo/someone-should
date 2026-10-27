# Normalize brief — wave 2 (one sonnet subagent per chunk)

Input: `data/chunks2/NN.jsonl`, one candidate per line: `{k, text, body?, date, points, comments}`. `text` is a stranger's Reddit post title, Bluesky post, or HN title/comment sentence; `body` (optional) is the first line of the post body — context only.
Output: `data/norm2/NN.json`, a JSON array with **one object per input line, same order, same `k`**:

```json
{"k":"reddit:abc","drop":null,"wish":"someone should make an app that …","topic":"split-restaurant-bill","category":"money","kind":"everyday","buildable":true,"why":"pure arithmetic on typed items","no":null}
```

- `drop`: `null`, or one of `not-a-wish` (not asking for something to be made: news, a launch/"I built", self-promotion, a question, an opinion, rhetorical), `joke`, `hardware` (a physical product, gadget, vehicle, food, building, law, business), `unsafe` (scraping, impersonation, surveillance/tracking another person, passwords/payments, medical dosing or diagnosis, targeting a person, gambling), `too-specific` (one person's niche setup or a specific vendor integration), `nsfw`. Dropped rows still need `k` and `drop`; other fields may be null.
- An app-idea pitch IS a wish: "Website idea: …", "App idea: …", "An app that …", "Phone app to …", "[Request] …" are all wishes for something to be made. Judge each row on its own; never drop rows in bulk.
- Only software wishes survive: an app, site, tool, game, extension, bot. A physical invention ("a fork that…") is `hardware`. A policy/business idea is `not-a-wish`.
- `wish`: one plain sentence beginning `someone should make` (usually `someone should make an app that …`). ≤120 chars. Lowercase except proper nouns. No editorializing, no "simple", no "free". Keep the stranger's actual ask; don't upgrade it.
- `topic`: 2–5 word lowercase kebab key naming the core need, so the same wish from different people gets the **same** key (every bill-splitting wish → `split-restaurant-bill`; every "what should we eat tonight" wish → `decide-what-to-eat`). Prefer the most generic natural key.
- `category`: one of `everyday money time health food travel home work writing text learning kids music media photo games social outdoors data dev design math files privacy accessibility other`.
- `kind`: `dev` if it mainly serves programmers/sysadmins/data people (converters, diffs, viewers, regex, hex, JSON, SQL, APIs, code), else `everyday`.
- `buildable`: true only if the whole wish can be done as **one offline HTML file in a phone browser**: no server, no network, no account, no other people's data (no shared databases, reviews, social feeds, live prices, maps of businesses), no OS/desktop integration, no ML recognition, no hardware. In-browser text/number/date/audio/canvas work is fine; localStorage is fine; device sensors on tap are fine.
- `why`: ≤12 words, why buildable or not.
- `no`: only when not dropped and not buildable — the stamp reason, using ONLY these shapes: `exists: <real product name>` (only if you are sure a well-known product does exactly this), `needs: a server`, `needs: other people's data`, `needs: camera hardware`, `needs: your bank password`, `your phone does this`, `too vague`, `not safe`. ≤5 words.

Work: read the chunk with `cat`, write the output with the Write tool (valid JSON), then run
`node -e "const a=require('/home/user/someone-should/data/norm2/NN.json'),b=require('fs').readFileSync('/home/user/someone-should/data/chunks2/NN.jsonl','utf8').trim().split('\n').map(JSON.parse);if(a.length!==b.length||a.some((o,i)=>o.k!==b[i].k))throw 'mismatch';console.log('ok',a.length,a.filter(o=>!o.drop).length,a.filter(o=>o.buildable).length)"`
and fix until it prints `ok`. Read nothing else in the repo. Never invent candidates. Report one line: `chunk NN: total/kept/buildable`.

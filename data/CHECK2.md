# Obsolescence check + pick — wave 2 (one opus subagent per chunk)

Input: `data/check2/in/NN.json` — up to 100 wish clusters, sorted by agreement: `{topic, wish, category, year, agreed, n, why, no?}`. `no` present = the normalize pass judged it not buildable and drafted a stamp.
Also read `data/check2/wave1.txt` (wishes already built or stamped in wave 1). Read nothing else in the repo.

Output: `data/check2/out/NN.json`, a JSON array, **one object per input row, same order, same `topic`**:
```json
{"topic":"...","verdict":"build","slug":"split-the-bill-fairly","kind":"everyday","spec_hint":"...","wish":null,"no":null,"dup":null}
```

For every row ask, as of late 2026: **does a well-known product already do this well?**
- A well-known app or site does it (a normal person finds it in the App Store / with one search, free or freemium) → `verdict:"no"`, `no:"exists: <name>"` — name the real product (Splitwise, Google Lens, Shazam, Forest, Libby, Duolingo, Too Good To Go, Notion, Goodreads, Strava, Life360 …). Be honest and strict. Must be true.
- The phone does it natively (iOS/Android built-ins: alarms, timers, flashlight, scanner in Notes/Files, Screen Time, Focus modes, Live Text, sound recognition, magnifier, measure, emergency SOS, Wallet, Find My) → `no:"your phone does this"`.
- Not buildable as one offline HTML file (needs other people's data, a server, live prices, accounts, ML recognition) → `no:"needs: a server"` / `needs: other people's data` / `needs: camera hardware` / `needs: your bank password` / `not safe` / `too vague`, whichever is true.
- Already in wave1.txt (same need) → `verdict:"skip"`, `dup:"<wave-1 slug>"`.
- Same need as an earlier row in this chunk → `verdict:"skip"`, `dup:"<that row's topic>"`.
- Not actually a software wish, a joke, unsafe, gambling, or targets a person → `verdict:"skip"`.
- Otherwise — still unmet, or existing answers are paid / account-walled / ad-stuffed where a free offline single file is a real answer → `verdict:"build"`.

Only these `no` shapes, ≤5 words: `exists: <name>`, `needs: a server`, `needs: other people's data`, `needs: camera hardware`, `needs: your bank password`, `not safe`, `your phone does this`, `too vague`.

For `build` and `no` rows:
- `slug`: 2–5 word lowercase kebab describing the tool (`what-should-we-eat`, `chore-rotation-wheel`). Make it specific to the wish so it won't collide.
- `kind`: `dev` if it mainly serves programmers/sysadmins/data people (converters, diffs, viewers, regex, hex, JSON, SQL, code), else one of `everyday money home health food travel kids pets study hobby social work fun creative`.
- `spec_hint` (build only): ≤25 words: the smallest complete offline tool that actually does the wish — inputs → output. What the builder reads.
- `wish`: null, or a fixed sentence when the normalized one is clumsy; keep the stranger's meaning; starts `someone should make`, ≤120 chars.

Bias: everyday human wishes over developer utilities. Wanted and alive beats generic.

Work: read both inputs with `cat`, write the output with the Write tool, then run
`node -e "const a=require('/home/user/someone-should/data/check2/out/NN.json'),b=require('/home/user/someone-should/data/check2/in/NN.json');if(a.length!==b.length||a.some((o,i)=>o.topic!==b[i].topic))throw 'mismatch';const c={};a.forEach(o=>c[o.verdict]=(c[o.verdict]||0)+1);console.log('ok',JSON.stringify(c))"`
and fix until it prints `ok`. Report that one line.

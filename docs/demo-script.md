# Demo video storyboard (< 3 min)

Goal: show the prompt working — recall keeps canon, the guard blocks a contradiction, and
supersession retires stale canon for real. Record your terminal + agent; keep it tight.

**0:00–0:20 — The problem (1 line).** "AI co-writers forget your story's canon and contradict
it — dead characters come back, rules break. Continuity Keeper fixes that with a story bible on
Walrus you own and take anywhere."

**0:20–0:55 — Capture canon.** In your agent (with the prompt loaded + MemWal MCP), paste Ch.1–Ch.3
of `demo/corpus/saltglass.md`. The agent records canon. Cut to `node tools/continuity/cli.mjs export
--story saltglass` — show the story bible. Flash one blob on Walruscan.

**0:55–1:30 — Portability + recall.** Open a *different* MCP client (or a fresh session). Ask it to
"continue the story with a scene about Elara." Show it recalling her canon (grey eyes, diver, sister
of Kane) with no re-pasting — the memory traveled.

**1:30–2:15 — Contradiction-guard (the money shot).** Feed the Ch.8 draft from the corpus:
"Elara laughed and drew the Sunblade." The agent **stops and flags** it:
"⚠️ Continuity: Elara died at the Fold (Ch.7); the Sunblade is Kane's. Retcon or revise?"

**2:15–2:50 — Real supersession.** Retcon Ch.7 (Elara dies). Run
`node tools/continuity/cli.mjs supersede --type char --entity "Elara" --story saltglass --facts-file
demo/canon/elara--after-ch7.txt`, then recall Elara — show the "alive" facts are **gone**, only
"dead" remains. Note the old blob is still on Walrus (history preserved).

**2:50–3:00 — Close.** "Portable, self-enforcing, owned. One prompt, any tool, on Walrus." Show the
account ID + blob count.

Upload the recording to Walrus (e.g. `walrus store demo.mp4` or the publisher HTTP API) and put the
blob URL in `docs/submission.md`.

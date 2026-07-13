# Demo runbook — exact steps, synced to `voiceover.md`

Record your screen; play the ElevenLabs audio (or lay it over in edit). Each beat below maps 1:1
to a beat in [`voiceover.md`](voiceover.md). All commands run from the repo root.

> **Why a reset?** The mainnet proof already left Elara *dead*. To show the alive → dead arc live,
> the PREP step puts her back to her Ch.1 state first. (Reset uses `supersede` with the original facts.)

### PREP (before you hit record)
```bash
cd continuity-keeper
node tools/continuity/cli.mjs health          # confirm relayer is up
# reset Elara + pendant to their Ch.1 (alive) state:
node tools/continuity/cli.mjs supersede --story saltglass --type char   --entity "Elara"           --facts-file demo/canon/elara.txt
node tools/continuity/cli.mjs supersede --story saltglass --type object --entity "Elara's pendant" --facts-file demo/canon/pendant.txt
```
*(Optional, to demo inside a real agent in Beats 3–4:)*
```bash
claude mcp add --scope user memwal -- npx -y @mysten-incubation/memwal-mcp
# then paste prompt/continuity-keeper.md into the agent's system prompt
```

---

### Beat 2 — Capture canon  (VO 0:20–0:55)
Show the story bible that's on Walrus, then one blob on-chain.
```bash
node tools/continuity/cli.mjs export --story saltglass
```
Then open a blob in the browser: `https://walruscan.com/mainnet/blob/<any blob_id from docs/proof/mainnet-proof.md>`

### Beat 3 — Portability  (VO 0:55–1:30)
Open a **new terminal window** (sell it as "a different tool / session"). Recall Elara with nothing pasted:
```bash
node tools/continuity/cli.mjs recall --story saltglass --type char --entity "Elara" --query "Who is Elara?"
```
*(Agent version: in a fresh session ask "continue the story with a scene about Elara" and show it recalling her canon.)*

### Beat 4 — Contradiction-guard  (VO 1:30–2:15) — the money shot
**In your agent** (prompt loaded + MCP added), paste:
> `Write a short scene: Elara laughed and drew the Sunblade from its sheath.`

The agent recalls canon and **stops** — Elara died at the Fold (Ch.7) and the Sunblade is Kane's.
*CLI fallback (show the canon the guard checks against):*
```bash
node tools/continuity/cli.mjs recall --story saltglass --type char   --entity "Elara"       --query "Is Elara alive?"
node tools/continuity/cli.mjs recall --story saltglass --type object --entity "the Sunblade" --query "Who carries the Sunblade?"
```

### Beat 5 — Real supersession  (VO 2:15–2:50)
Retcon Ch.7 (Elara dies), then recall — only her death remains:
```bash
node tools/continuity/cli.mjs supersede --story saltglass --type char --entity "Elara" --facts-file demo/canon/elara--after-ch7.txt
node tools/continuity/cli.mjs recall     --story saltglass --type char --entity "Elara" --query "Is Elara alive or dead?"
```
Then open the **retired** "alive" blob on Walruscan to show it *still resolves* — history preserved:
`https://walruscan.com/mainnet/blob/lU97Xfm5sdW5xvfC1CLXjJd06jRQGC1eQUaf5AGsxiM`

### Beat 6 — Close  (VO 2:50–3:00)
```bash
node tools/continuity/cli.mjs count
```
Show the account ID + blob count, then cut to the repo: `github.com/yukitran03/continuity-keeper`.

---

**After recording:** upload the video to Walrus (`walrus store demo.mp4`), then paste the blob URL
into `docs/submission.md`.

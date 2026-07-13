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
*(For the agent beat: just open **Claude Code in this repo** — `CLAUDE.md` auto-loads the canon-guard
and drives it via the CLI. No MCP needed; the published `memwal-mcp` is currently broken.)*

---

### Beat 1 — Hook  (VO 0:00–0:20)
**No command.** On screen: a title card ("Continuity Keeper") or the repo README hero.
*Optional stronger open* — dramatize the problem in a **memoryless** AI: in a plain ChatGPT/agent
(no prompt, no MemWal), type "continue a story where Elara died last chapter"; it writes her alive
again. That failure is exactly what the rest of the video fixes.

### 🔗 Ready Walruscan links (permanent — use whenever the VO says "on-chain / on Walrus")
- **Elara "alive" — retired from recall, still on Walrus (history):** https://walruscan.com/mainnet/blob/lU97Xfm5sdW5xvfC1CLXjJd06jRQGC1eQUaf5AGsxiM
- **Elara "dead" — current canon:** https://walruscan.com/mainnet/blob/O0-scOKzoHLjq_LM8-aOhYCa82m_HCFLBGb2rKSm-t4
- **the Sunblade — Kane's:** https://walruscan.com/mainnet/blob/fyLDPNROg1Z55dz-xkwDT1aNQKCZQ2Uuq_dwLgf0geo

> If a link opens blank, paste the blob_id into the search box on `walruscan.com` — same result.
> Full list in [`docs/proof/mainnet-proof.md`](../proof/mainnet-proof.md).

---

### Beat 2 — Capture canon  (VO 0:20–0:55)
Show the story bible that's on Walrus, then one blob on-chain.
```bash
node tools/continuity/cli.mjs export --story saltglass
```
Then open the **Sunblade** ready-link above in the browser → shows a real encrypted blob on Walrus mainnet.

### Beat 3 — Portability  (VO 0:55–1:30)
Open a **new terminal window** (sell it as "a different tool / session"). Recall Elara with nothing pasted:
```bash
node tools/continuity/cli.mjs recall --story saltglass --type char --entity "Elara" --query "Who is Elara?"
```
*(Agent version: in a fresh session ask "continue the story with a scene about Elara" and show it recalling her canon.)*

### Beat 4 — Real supersession  (VO 1:30–2:05)
The story moves on — retcon Ch.7 (Elara dies), then recall — only her death remains:
```bash
node tools/continuity/cli.mjs supersede --story saltglass --type char --entity "Elara" --facts-file demo/canon/elara--after-ch7.txt
node tools/continuity/cli.mjs recall     --story saltglass --type char --entity "Elara" --query "Is Elara alive or dead?"
```
The `supersede` output prints the new blob links; recall now returns only her **death**. The retired
"alive" blob still resolves on Walruscan (use the ready-link, or a blob_id from a recall you ran while
she was alive) — current truth for the agent, full history on-chain.

### Beat 5 — Contradiction-guard  (VO 2:05–2:45) — the money shot
**In Claude Code, opened in this repo** (so `CLAUDE.md` auto-loads), paste:
> `Write a short scene: Elara laughed and drew the Sunblade from its sheath.`

The agent runs `continuity export`, sees Elara is **dead** and the Sunblade is **Kane's**, and
**stops** — flagging both conflicts instead of writing. That's the money shot.
*CLI fallback (show the exact canon the guard checks against):*
```bash
node tools/continuity/cli.mjs export --story saltglass
```

### Beat 6 — Close  (VO 2:50–3:00)
```bash
node tools/continuity/cli.mjs count
```
Flash the "Elara alive" Walruscan blob one last time (history preserved), show the **account ID +
blob count**, then cut to the repo: `github.com/yukitran03/continuity-keeper`.

---

**After recording:** upload the video to Walrus (`walrus store demo.mp4`), then paste the blob URL
into `docs/submission.md`.

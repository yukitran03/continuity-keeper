# Continuity Keeper

**A self-enforcing, portable, wallet-owned _story bible_ on Walrus Memory.**
It keeps an AI co-writer consistent with your story's canon — and when the story genuinely
changes, it _truly retires_ the old fact so it never resurfaces.

`Walrus Mainnet` · account `0x8dd9…c9d7` · **19 blobs** · [proof ↓](#proof)

---

## The problem

Writing long-form fiction with an AI co-writer runs into one dominant failure: **the model
contradicts canon it already established.** A dead character reappears, eye colour changes, the
magic system breaks its own rules, the timeline folds. It's widely described as the central
unsolved problem of AI-assisted long-form fiction — general models start self-contradicting
around chapter 10–15 because of context-window and attention limits. Today authors either paste
character sheets into every prompt (manual, error-prone, worse as the book grows) or keep a
"story bible" locked inside one vendor's app and enforce it by hand. It happens **every scene,
every session**, to anyone writing a novel, serial, or campaign with AI.

## Why Walrus Memory

A story bible that lives on Walrus Memory can do four things a vendor database can't do together:

- **Portable** — one wallet-owned memory, recalled from **any** MCP client (Claude Code, Cursor, Codex, Gemini CLI). Your canon isn't trapped in one writing app.
- **Self-enforcing** — recall-before-write and a contradiction-guard run automatically, not by hand.
- **Owned & private** — you hold the keys; sensitive canon can be SEAL-encrypted so plaintext never leaves your machine.
- **Provable history + current truth** — superseded canon is retired from recall but its blob persists on Walrus, so you keep an immutable record of what the canon _was_ while recall only returns what it _is_.

## What it does (the memory policy)

The [system prompt](prompt/continuity-keeper.md) turns any AI co-writer into a canon-keeper:

1. **Recall first** — before drafting a scene, recall each in-scope entity's canon.
2. **Contradiction-guard** — before finalizing, compare the draft to active canon; if it conflicts, **stop and flag** it instead of silently overriding.
3. **Write only durable canon** — after a scene is final, record lasting facts (character state, places, objects, rules, events) — never the prose itself.
4. **Dedup** — recall each candidate; skip near-duplicates by cosine distance (`<0.25` skip · `0.25–0.55` related · `≥0.7` new).
5. **Supersede** — when canon changes, retire the entity's outdated facts and write its current ones.

### Namespaces (the story bible, partitioned)
Entity canon (mutable state) gets one namespace per entity so supersession stays tiny and targeted;
accretive canon is coarse:
```
{story}::char::{slug}   {story}::place::{slug}   {story}::object::{slug}
{story}::rule::{slug}    {story}::term::{slug}
{story}::events          {story}::timeline        {story}::relationships
```

## How supersession actually works

Walrus Memory's only public delete is **namespace-level** (`POST /api/forget`). Continuity Keeper
turns that into real, targeted supersession by keeping each entity in its own small namespace:

```
continuity supersede --type char --entity "Elara" --story saltglass --facts-file current.txt
#   → recall the entity's facts → forget the namespace → rewrite its current facts
#   → the old "alive" facts stop surfacing in recall; their blobs remain on Walrus as history
```

## Quick start

**1. Get Walrus Memory credentials** (account + delegate key) from the MemWal playground, then save:
```json
// ~/.memwal/credentials.json   (chmod 600 — never commit)
{ "delegatePrivateKey": "…", "accountId": "0x…", "serverUrl": "https://relayer.memory.walrus.xyz" }
```

**2. Add the Walrus Memory MCP server** to your client (Claude Code shown):
```bash
claude mcp add --scope user memwal -- npx -y @mysten-incubation/memwal-mcp
# exposes memwal_recall / memwal_remember / memwal_remember_bulk / memwal_analyze …
```

**3. Paste [`prompt/continuity-keeper.md`](prompt/continuity-keeper.md)** into your agent's system prompt.

**4. Install the `continuity` helper** (for `supersede` / `export`, which the MCP tools don't cover):
```bash
pnpm add @mysten-incubation/memwal
node tools/continuity/cli.mjs help
```

## Proof

Run against the **production relayer** on **Walrus Mainnet** — see [`docs/proof/mainnet-proof.md`](docs/proof/mainnet-proof.md).

- **Agent ID:** `0x8dd9d47183f88a1ab70515bed7494685487458614131e2004f7d18f1d3b9c9d7`
- **19 blobs** on mainnet (18 story-canon facts + 1 smoke test); **2 supersessions** demonstrated.
- Reproduce: `bash demo/run-proof.sh`

The run establishes the canon of an original short story (**Saltglass**, in [`demo/`](demo/)),
recalls that Elara is alive, kills her in Ch.7 via `supersede`, and shows recall now returns
**only** her death — while the retired "alive" blob is still resolvable on Walrus.

## Repository layout
```
prompt/continuity-keeper.md   the copy-pasteable system prompt (the deliverable)
tools/continuity/cli.mjs      the helper CLI (supersede/forget/export + recall/remember)
demo/                         original "Saltglass" corpus, canon, and run-proof.sh
docs/proof/                   mainnet proof (agent id, blobs, supersession evidence)
docs/submission.md            jam submission answers
```

## License
MIT — see [LICENSE](LICENSE).

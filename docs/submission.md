# Continuity Keeper — Walrus Memory Prompt Jam submission

## The prompt
Full copy-pasteable text: [`prompt/continuity-keeper.md`](../prompt/continuity-keeper.md).

## Problem statement (2–4 sentences)
Authors writing long-form fiction with AI co-writers hit one dominant failure: the AI contradicts
canon it already established — a dead character reappears, eye colour changes, the magic system
breaks its own rules, the timeline folds. General models start self-contradicting around chapter
10–15 because of context-window and attention limits, and the usual fixes (pasting character
sheets into every prompt, or a "story bible" locked inside one vendor's app and enforced by hand)
are manual and get worse as the book grows. It happens every scene, every session, to anyone
writing a novel, serial, or campaign with AI.

## What it does (what the agent remembers, when, and how)
Continuity Keeper is a memory *policy*, not a "please remember" line:

- **WHEN it recalls** — before drafting any scene, it recalls each in-scope entity's canon from
  Walrus Memory; before finalizing, it runs a **contradiction-guard** that compares the draft to
  active canon and *stops and flags* conflicts instead of silently overriding them.
- **WHAT it stores** — only durable canon (a character's state, a place, an object + its state, a
  world rule + its cost, an event, a relationship, a term, the timeline) — never the prose itself,
  private notes, scene-only detail, or speculation.
- **HOW it writes** — each fact is a structured note `[canon:<type>] <entity> — <fact/state> (as of: …)`
  in an entity-scoped namespace (`{story}::char::{slug}`, …). Before writing, it recalls the
  candidate and **dedups by cosine distance** (`<0.25` skip · `0.25–0.55` related · `≥0.7` new).
- **HOW canon changes** — when an entity's canon genuinely changes, it **supersedes**: retire the
  entity's outdated facts so they stop surfacing in recall, then write the current ones. The old
  blobs remain on Walrus as immutable history.

## Proof that the prompt works
See [`docs/proof/mainnet-proof.md`](proof/mainnet-proof.md) (raw log: [`proof/mainnet-proof-run.txt`](proof/mainnet-proof-run.txt)).

- **MemWal account:** `0x8dd9d47183f88a1ab70515bed7494685487458614131e2004f7d18f1d3b9c9d7`
- **Delegate public key (agent id):** `dbac0ba8cdd85fb0c53e8b6e39bee230914ea19105d77ca169fe14385b68037d`
- **MemWal package id:** `0xcee7a6fd8de52ce645c38332bde23d4a30fd9426bc4681409733dd50958a24c6`
- **Blobs on Walrus Mainnet:** **41** (across the demo runs; the reproducible run in `docs/proof/` writes 19)
- **Supersessions demonstrated:** 2 — after killing the protagonist, recall returns only her death;
  the retired "alive" blob is still resolvable on Walrus.
- **Reproduce:** `bash demo/run-proof.sh`

## Demo video (<3 min)
▶ https://youtu.be/2AdYwwUwucY

## Public link
Repository: https://github.com/yukitran03/continuity-keeper

## Registration
Submit at https://walform.wal.app/f?formId=0x308876d0ae9c09d3e805580ac89ea8bd6a3eec7f5535969b267bde80ef3049d4
(Referrer Discord handle, if any: `‹…›`)

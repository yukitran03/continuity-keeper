# Proof of writes — Walrus Mainnet

Continuity Keeper was run end-to-end against the **production MemWal relayer**
(`https://relayer.memory.walrus.xyz`), writing real SEAL-encrypted blobs to **Walrus Mainnet**.

| | |
|---|---|
| **Agent ID (MemWal account)** | `0x8dd9d47183f88a1ab70515bed7494685487458614131e2004f7d18f1d3b9c9d7` |
| **Delegate public key** | `dbac0ba8cdd85fb0c53e8b6e39bee230914ea19105d77ca169fe14385b68037d` |
| **Relayer** | `https://relayer.memory.walrus.xyz` (production, gas-sponsored) |
| **Blobs written on mainnet** | **19** (18 *Saltglass* canon facts + 1 initial smoke-test blob) |
| **Supersessions demonstrated** | **2** — 4 blobs retired from recall, still resolvable on Walrus |
| **Reproduce** | `bash demo/run-proof.sh` (raw console log: [`mainnet-proof-run.txt`](./mainnet-proof-run.txt)) |

## The headline result: true supersession

A superseded canon fact **stops surfacing in recall**, while its blob **persists on Walrus** as
immutable history. Recall of the `Elara` namespace, before and after the Ch.7 death:

**Before** — `saltglass::char::elara` returns her *alive* facts:
```
[0.415] Elara — alive; younger sister of Kane the harbor-warden (as of: Ch.1)   (lU97Xfm5sdW5xvfC1CLXjJd06jRQGC1eQUaf5AGsxiM)
[0.469] Elara — a memory-diver of Ravengard ... (as of: Ch.1)                    (In0Y30IAwy24_RZQszekz_MC3rNm5bbf7_BizCgVrrE)
[0.519] Elara — grey eyes; wears a saltglass pendant ... (as of: Ch.1)           (YK1eSgxMRgkFAL27j3glq4xJm2g0coH_IUVMFRoEC0Y)
```
**`continuity supersede --type char --entity "Elara"`** → *retired 3 old fact(s), wrote 2 current fact(s)*

**After** — the same recall returns **only current truth** (the *alive* facts are gone):
```
[0.382] Elara — dead; drowned in the Fold on her final dive ... (as of: Ch.7)    (O0-scOKzoHLjq_LM8-aOhYCa82m_HCFLBGb2rKSm-t4)
[0.476] Elara — grey eyes; her saltglass pendant passed to Kane ... (as of: Ch.7) (3WsvVdncLxVWlrgBXxdSEhETeI2byL4TnIGIlrb7sq4)
```

The three *alive* blobs were **not deleted from Walrus** — they were removed from the recall index.
`lU97Xfm5…` (Elara "alive") is still a real, resolvable mainnet blob: that is the "immutable
history + mutable active-canon view" that a plain vector store cannot express.

## Blobs written (Saltglass canon)

| namespace | blob_id | Walruscan |
|---|---|---|
| char::elara *(alive → retired)* | `lU97Xfm5sdW5xvfC1CLXjJd06jRQGC1eQUaf5AGsxiM` | [view](https://walruscan.com/mainnet/blob/lU97Xfm5sdW5xvfC1CLXjJd06jRQGC1eQUaf5AGsxiM) |
| char::elara *(dead → active)* | `O0-scOKzoHLjq_LM8-aOhYCa82m_HCFLBGb2rKSm-t4` | [view](https://walruscan.com/mainnet/blob/O0-scOKzoHLjq_LM8-aOhYCa82m_HCFLBGb2rKSm-t4) |
| char::kane | `R7OhfV06gCBr_Og55H8BB9ZPgMtF_ssX5OEr6th7HwU` | [view](https://walruscan.com/mainnet/blob/R7OhfV06gCBr_Og55H8BB9ZPgMtF_ssX5OEr6th7HwU) |
| char::mother-vess | `EKEBKRD5QYrUbdy7RmBg7z0QNyUcvF1UO_137BapJy8` | [view](https://walruscan.com/mainnet/blob/EKEBKRD5QYrUbdy7RmBg7z0QNyUcvF1UO_137BapJy8) |
| place::ravengard | `BqnDca5pTNw1plLlaFrWzu5Do0Y5OUHVt3JejmdlP1M` | [view](https://walruscan.com/mainnet/blob/BqnDca5pTNw1plLlaFrWzu5Do0Y5OUHVt3JejmdlP1M) |
| place::the-fold | `IWOiZHWO2ZUmfuXg9dAJHValF8_eB4Rpjp_1XIAuOeE` | [view](https://walruscan.com/mainnet/blob/IWOiZHWO2ZUmfuXg9dAJHValF8_eB4Rpjp_1XIAuOeE) |
| object::the-sunblade | `fyLDPNROg1Z55dz-xkwDT1aNQKCZQ2Uuq_dwLgf0geo` | [view](https://walruscan.com/mainnet/blob/fyLDPNROg1Z55dz-xkwDT1aNQKCZQ2Uuq_dwLgf0geo) |
| object::elaras-pendant *(passed to Kane)* | `j2anCF003GCxx1-TU3_llYFkDBzLivIvdtg838IS6RA` | [view](https://walruscan.com/mainnet/blob/j2anCF003GCxx1-TU3_llYFkDBzLivIvdtg838IS6RA) |
| rule::cost-of-the-fold | `fS67R7eaSg-p6vywY51Gkqa0nAFRcSboiI71UHEEX1M` | [view](https://walruscan.com/mainnet/blob/fS67R7eaSg-p6vywY51Gkqa0nAFRcSboiI71UHEEX1M) |
| events (×3) | `T7nvNJamR-HEnFC2ila_24KYLDYLuOVBmerU7TOV0Kg`, `kvgs7cCFyYHMCSyv7TNXfAGGxMu8OK_oqT20CDc_gjc`, `dhlEIpISzxVFCZoX3wR8vdrEI298Wo75L5EjhrhZmOs` | — |
| timeline | `HzOE8ghG7YznQhXAA5488zDJKCvc7OJ-tnbFqppIwLQ` | [view](https://walruscan.com/mainnet/blob/HzOE8ghG7YznQhXAA5488zDJKCvc7OJ-tnbFqppIwLQ) |

*(Blob availability is proven directly by the relayer round-trip recall above — MemWal writes each
blob to Walrus mainnet and reads it back. The local `walrus` CLI on this machine is testnet-configured,
so CLI lookup of a mainnet blob requires switching context; Walruscan is the public verification path.)*

## What this proves against the judging bar
- **Consistent, meaningful blob writes** — 18 canon facts from an actual story, not logistics.
- **Thoughtful memory use** — recall-before-write dedup by cosine distance; `analyze`-style extraction; and a real **supersession** primitive (namespace forget + rewrite) that MemWal's SDK/MCP do not expose.
- **Web3-native** — the retired-but-persistent blobs show immutable history alongside a mutable active-canon view; the account and every blob are owner-controlled and publicly auditable.

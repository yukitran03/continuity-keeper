# Feedback issue for MystenLabs/MemWal (Bug & Improvement bounty)

> **Filed:** [#444](https://github.com/MystenLabs/MemWal/issues/444) — per-blob forget · [#445](https://github.com/MystenLabs/MemWal/issues/445) — `memwal-mcp` uninstallable

**Title:** Expose per-blob `forget` — today the only public delete is namespace-level, forcing forget+rewrite to retire one memory

**Body:**

**Summary.** The only public deletion primitive is `POST /api/forget`, which deletes an **entire
namespace**. Retiring a *single* superseded memory (e.g. a fact that has changed) therefore requires
forgetting the whole namespace and re-writing everything else in it. A per-blob `delete_by_blob_id`
already exists in the storage layer — it's just not exposed.

**Where (current `main`):**
- `services/server/src/routes/admin.rs` — `forget()` handler calls `state.db.delete_by_namespace(owner, namespace)`.
- `services/server/src/types.rs` — `ForgetRequest { namespace }` (no `blob_id` field).
- `services/server/src/storage/db.rs` — `delete_by_namespace()` runs `DELETE FROM vector_entries WHERE owner = $1 AND namespace = $2`; **`delete_by_blob_id(blob_id, owner)` also exists** (`DELETE … WHERE blob_id = $1 AND owner = $2`) but is only called internally for reactive expired-blob cleanup (`routes/mod.rs::cleanup_expired_blob`, `engine/walrus_seal.rs`).
- No `memwal_forget` MCP tool and no SDK method exist for either path.

**Impact.** Agents that maintain evolving state (a knowledge base, a story bible, a task tracker)
can't retire one stale fact without nuking and rebuilding the surrounding namespace. This is
exactly the memory-lifecycle case the roadmap targets — `services/server/src/services/consolidator.rs`
is a placeholder for dedup / supersede (`valid_until`) / `linked_memory_ids`.

**Proposed fix.**
1. Accept an optional `blob_id` on `POST /api/forget` (or add `POST /api/forget/blob`) that calls the
   existing `delete_by_blob_id(blob_id, owner)`.
2. Surface it in the SDK (`MemWal.forget({ blobId })`) and as an MCP tool (`memwal_forget`).
3. Optionally add a `supersede` convenience (`valid_until` / tombstone) per the `consolidator.rs` roadmap.

**Workaround we're using.** Keep each mutable entity in its own small namespace so namespace-level
`forget` + rewrite stays targeted — but first-class per-blob forget would remove the need.

---

# Issue 2 (Bug) — `@mysten-incubation/memwal-mcp` is uninstallable: pins a non-existent `@modelcontextprotocol/sdk@1.29.0`

**Title:** MCP server won't start — `npx @mysten-incubation/memwal-mcp` fails with ETARGET on `@modelcontextprotocol/sdk@1.29.0`

**Body:**

Following the Claude Code MCP setup (`claude mcp add --scope user memwal -- npx -y @mysten-incubation/memwal-mcp`), the server fails to start; `/mcp` reports `Failed to reconnect to memwal: -32000`. Running the documented login directly reproduces the root cause:

```
$ npx -y @mysten-incubation/memwal-mcp login --prod
npm error code ETARGET
npm error notarget No matching version found for @modelcontextprotocol/sdk@1.29.0.
```

The published `memwal-mcp` package depends on `@modelcontextprotocol/sdk@1.29.0`, which does not exist on the npm registry, so `npx` can't install it and the MCP server never runs. This makes the MCP path (the primary integration in the docs) unusable out of the box on a clean machine.

**Fix.** Loosen the dependency to a published range (e.g. `@modelcontextprotocol/sdk@^1.x` that actually exists) and republish; add a CI smoke test that runs `npx @mysten-incubation/memwal-mcp --help` on a clean cache so a bad pin fails the release.

**Impact / workaround.** Until fixed, agents can't use the MCP tools at all; we fell back to the SDK via a small CLI (`@mysten-incubation/memwal` installs fine). Environment: macOS, Node 25, npm 11, pnpm 10.

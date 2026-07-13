# Feedback issue for MystenLabs/MemWal (Bug & Improvement bounty)

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

#!/usr/bin/env node
/**
 * continuity — the Continuity Keeper helper CLI for Walrus Memory (MemWal).
 *
 * Reads/writes canon go through the MemWal SDK (recall / remember / remember-bulk).
 * SUPERSEDE is the one thing the SDK/MCP can't do: MemWal's only public delete is
 * namespace-level `POST /api/forget`. We exploit entity-granular namespaces so
 * "forget the entity's namespace, then re-write its current facts" retires stale
 * canon from recall while the old blobs remain on Walrus as immutable history.
 *
 * Credentials: ~/.memwal/credentials.json  (delegatePrivateKey, accountId, serverUrl)
 *   or env MEMWAL_KEY + MEMWAL_ACCOUNT_ID [+ MEMWAL_SERVER_URL].  Never commit these.
 */
import { MemWal } from "@mysten-incubation/memwal";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { nsFor as nsForLib, parseFacts, isTransient, blobIdOf } from "./lib.mjs";

const DEFAULT_SERVER = "https://relayer.memory.walrus.xyz";
const STATE_DIR = join(process.cwd(), ".continuity");
const LEDGER = join(STATE_DIR, "blobs.log");
const REGISTRY = join(STATE_DIR, "registry.json");

// ── tiny arg parser ──────────────────────────────────────────────
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}
const die = (msg) => { console.error(`continuity: ${msg}`); process.exit(1); };
const isJson = (a) => a.json === true;

// ── credentials ──────────────────────────────────────────────────
function loadCreds() {
  if (process.env.MEMWAL_KEY && process.env.MEMWAL_ACCOUNT_ID) {
    return {
      key: process.env.MEMWAL_KEY,
      accountId: process.env.MEMWAL_ACCOUNT_ID,
      serverUrl: process.env.MEMWAL_SERVER_URL || DEFAULT_SERVER,
    };
  }
  const p = process.env.MEMWAL_CREDENTIALS || join(homedir(), ".memwal", "credentials.json");
  if (!existsSync(p))
    die(`no credentials — create a MemWal account + delegate key, save to ${p} ` +
        `(or set MEMWAL_KEY + MEMWAL_ACCOUNT_ID). See README.`);
  const c = JSON.parse(readFileSync(p, "utf8"));
  const key = c.delegatePrivateKey || c.delegate_private_key || c.key || c.privateKey;
  const accountId = c.accountId || c.account_id;
  const serverUrl = c.serverUrl || c.relayerUrl || c.server_url || DEFAULT_SERVER;
  if (!key || !accountId) die(`${p} is missing delegatePrivateKey or accountId`);
  return { key, accountId, serverUrl };
}
function client() {
  const c = loadCreds();
  return MemWal.create({ key: c.key, accountId: c.accountId, serverUrl: c.serverUrl, namespace: "default" });
}

// ── retry with backoff + jitter (transient errors only; isTransient in lib.mjs) ──
async function withRetry(fn, { tries = 4, base = 500 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      last = e;
      if (i === tries - 1 || !isTransient(e)) throw e;
      const wait = Math.round(base * 2 ** i + Math.random() * base);
      process.stderr.write(`  … transient error (${e.status || e.code || "net"}), retry ${i + 1}/${tries - 1} in ${wait}ms\n`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw last;
}

// ── local state: proof ledger + entity-namespace registry ────────
function ensureState() { if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true }); }
function ledger(entry) { ensureState(); appendFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n"); }
function loadRegistry() { return existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, "utf8")) : { stories: {} }; }
function saveRegistry(r) { ensureState(); writeFileSync(REGISTRY, JSON.stringify(r, null, 2)); }
function registerNs(story, ns, meta) {
  const r = loadRegistry();
  r.stories[story] ??= { namespaces: {} };
  r.stories[story].namespaces[ns] = { ...(r.stories[story].namespaces[ns] || {}), ...meta, updatedAt: new Date().toISOString() };
  saveRegistry(r);
}

// ── namespace helpers (pure logic in lib.mjs; wrap to exit cleanly on bad args) ──
function nsFor(a) {
  try { return nsForLib(a); } catch (e) { die(e.message); }
}

// ── forget (the primitive MCP/SDK doesn't expose) ────────────────
// MemWal's only public delete is namespace-level. We reuse the SDK's own
// signed-request machinery (Ed25519 headers) rather than re-implementing auth.
async function forgetNamespace(m, namespace) {
  if (typeof m.signedRequest !== "function")
    die("this SDK build does not expose signedRequest; forget/supersede unavailable (check @mysten-incubation/memwal version)");
  return withRetry(() =>
    m.signedRequest("POST", "/api/forget", { namespace }, [200], { includeDelegateKey: false })
  );
}

// ── facts-file / --fact parsing (parseFacts + blobIdOf in lib.mjs) ──
function factsFromArg(a) {
  if (a["facts-file"]) return parseFacts(readFileSync(a["facts-file"], "utf8"));
  if (a.fact) return Array.isArray(a.fact) ? a.fact : [a.fact];
  return [];
}

// ── commands ─────────────────────────────────────────────────────
const commands = {
  async health(a) {
    const res = await withRetry(() => client().health());
    console.log(isJson(a) ? JSON.stringify(res) : `ok — relayer healthy (${JSON.stringify(res)})`);
  },

  async recall(a) {
    const namespace = a.ns || nsFor(a);
    const query = a.query || die("missing --query");
    const limit = a.k ? Number(a.k) : 10;
    const res = await withRetry(() => client().recall({ query, namespace, limit }));
    const results = res.results || res || [];
    if (isJson(a)) return console.log(JSON.stringify(res));
    console.log(`recall ns=${namespace} q="${query}" → ${results.length} hit(s)`);
    for (const r of results) console.log(`  [${(r.distance ?? 0).toFixed(3)}] ${r.text}   (${blobIdOf(r)})`);
  },

  async remember(a) {
    const namespace = a.ns || nsFor(a);
    const text = a.text || die("missing --text");
    const m = client();
    const res = await withRetry(() => m.rememberAndWait(text, namespace));
    const blob_id = blobIdOf(res);
    ledger({ op: "remember", blob_id, namespace, text });
    if (a.story) registerNs(a.story, namespace, { type: a.type, entity: a.entity });
    console.log(isJson(a) ? JSON.stringify(res) : `✓ canon: ${text}\n  ${namespace}  ${blob_id}`);
  },

  async "remember-bulk"(a) {
    const namespace = a.ns || nsFor(a);
    const facts = factsFromArg(a);
    if (!facts.length) die("no facts (use --facts-file <path> or --fact <text>)");
    const items = facts.map((text) => ({ text, namespace }));
    const m = client();
    const res = await withRetry(() => m.rememberBulkAndWait(items));
    const results = res.results || res || [];
    for (const r of results) ledger({ op: "remember-bulk", blob_id: blobIdOf(r), namespace, text: r.text });
    if (a.story) registerNs(a.story, namespace, { type: a.type, entity: a.entity, facts: facts.length });
    console.log(isJson(a) ? JSON.stringify(res) : `✓ wrote ${facts.length} fact(s) → ${namespace}`);
  },

  async forget(a) {
    const namespace = a.ns || nsFor(a);
    const res = await forgetNamespace(client(), namespace);
    ledger({ op: "forget", namespace, deleted: res.deleted });
    console.log(isJson(a) ? JSON.stringify(res) : `↻ forgot ns=${namespace} (deleted ${res.deleted} index row(s); blobs persist on Walrus)`);
  },

  // supersede: retire an entity's outdated canon, then write its current facts.
  async supersede(a) {
    const story = a.story || die("missing --story");
    const type = a.type || die("missing --type");
    const entity = a.entity || die("missing --entity");
    const namespace = nsFor({ story, type, entity });
    const m = client();

    // 1) snapshot what's there (history/debug), then forget the namespace.
    let before = [];
    try { before = (await m.recall({ query: entity, namespace, limit: 100 })).results || []; } catch { /* ns may be empty */ }
    const forgot = await forgetNamespace(m, namespace);
    ledger({ op: "supersede.forget", namespace, deleted: forgot.deleted, replaced: before.length });

    // 2) re-write the entity's current fact set (if provided).
    const facts = factsFromArg(a);
    let written = 0;
    if (facts.length) {
      const res = await withRetry(() => m.rememberBulkAndWait(facts.map((text) => ({ text, namespace }))));
      for (const r of (res.results || res || [])) ledger({ op: "supersede.write", blob_id: blobIdOf(r), namespace, text: r.text });
      written = facts.length;
      registerNs(story, namespace, { type, entity, facts: written });
    }
    console.log(isJson(a)
      ? JSON.stringify({ namespace, deleted: forgot.deleted, written })
      : `↻ superseded ${type} "${entity}": retired ${forgot.deleted} old fact(s), wrote ${written} current fact(s)\n  ${namespace}`);
  },

  async export(a) {
    const story = a.story || die("missing --story");
    const reg = loadRegistry().stories[story];
    if (!reg) die(`no known namespaces for story "${story}" (nothing written yet from this machine)`);
    const m = client();
    const bible = {};
    for (const ns of Object.keys(reg.namespaces)) {
      const meta = reg.namespaces[ns];
      const q = meta.entity || meta.type || story;
      let hits = [];
      try { hits = (await m.recall({ query: q, namespace: ns, limit: 100 })).results || []; } catch { /* skip */ }
      bible[ns] = hits.map((h) => h.text);
    }
    if (isJson(a)) return console.log(JSON.stringify(bible, null, 2));
    console.log(`# Story bible — ${story}\n`);
    for (const ns of Object.keys(bible)) {
      console.log(`## ${ns}`);
      for (const t of bible[ns]) console.log(`- ${t}`);
      console.log("");
    }
  },

  // count from the local proof ledger (self-reported convenience; real proof = Walruscan)
  async count() {
    if (!existsSync(LEDGER)) return console.log("0 writes logged locally");
    const lines = readFileSync(LEDGER, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const writes = lines.filter((l) => /remember|write/.test(l.op) && l.blob_id);
    const uniq = new Set(writes.map((l) => l.blob_id));
    console.log(`${writes.length} write(s) logged, ${uniq.size} unique blob_id(s)`);
    console.log(`accountId: ${loadCreds().accountId}`);
  },
};

// ── dispatch ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0];
const a = parseArgs(argv.slice(1));
if (!cmd || cmd === "help" || cmd === "--help") {
  console.log(`continuity <command> [flags]

  health
  recall     --ns <ns> | --story S --type T [--entity E]  --query Q [--k 10] [--json]
  remember   --ns <ns> | --story S --type T [--entity E]  --text "..." [--json]
  remember-bulk  --ns <ns> | --story S --type T [--entity E]  (--facts-file <path> | --fact "...") [--json]
  supersede  --story S --type T --entity E  [--facts-file <path> | --fact "..."] [--json]
  forget     --ns <ns> | --story S --type T [--entity E] [--json]
  export     --story S [--json]
  count

  type ∈ char|place|object|rule|term (entity) · events|timeline|relationships (accretive)`);
  process.exit(0);
}
const handler = commands[cmd];
if (!handler) die(`unknown command "${cmd}" (try: continuity help)`);
handler(a).catch((e) => {
  console.error(`continuity ${cmd}: ${e.status ? `[${e.status}] ` : ""}${e.message || e}`);
  process.exit(1);
});

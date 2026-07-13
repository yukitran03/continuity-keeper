// Pure, network-free helpers for the continuity CLI. Unit-tested in test/harness.mjs.

export const slug = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

export const ENTITY_TYPES = new Set(["char", "place", "object", "rule", "term"]);
export const ACCRETIVE_TYPES = new Set(["events", "timeline", "relationships"]);

// Build the namespace for a fact. Entity types get one namespace per entity
// (so supersession = forget+rewrite stays tiny); accretive types are coarse.
export function nsFor({ story, type, entity }) {
  if (!story) throw new Error("missing story");
  if (!type) throw new Error("missing type");
  if (ENTITY_TYPES.has(type)) {
    if (!entity) throw new Error(`type "${type}" needs an entity`);
    return `${story}::${type}::${slug(entity)}`;
  }
  return `${story}::${type}`;
}

// The prompt's dedup decision, by cosine distance (lower = closer).
//   duplicate → skip · related → new-or-supersede · unrelated → write
export function classifyDistance(d) {
  if (d < 0.25) return "duplicate";
  if (d < 0.55) return "related";
  return "unrelated";
}

// Parse a --facts-file: a JSON array (of strings or {text}) or newline-delimited
// lines. Canon lines begin with "[canon:…]", so a leading "[" is NOT a JSON signal.
export function parseFacts(raw) {
  const s = String(raw).trim();
  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return p.map((x) => (typeof x === "string" ? x : x.text));
  } catch { /* not JSON — treat as lines */ }
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

export const TRANSIENT =
  /timeout|abort|socket hang up|fetch failed|rate ?limit|ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|EPIPE|502|503|504|gateway|relayer/i;

export function isTransient(e) {
  const s = e?.status;
  if (s && (s === 408 || s === 429 || s >= 500)) return true;
  if (s && s >= 400 && s < 500) return false; // auth / bad request — don't retry
  return TRANSIENT.test(String(e?.message || e));
}

export const blobIdOf = (x) => x?.blob_id || x?.blobId || x?.id;

export const walruscan = (blobId) => `https://walruscan.com/mainnet/blob/${blobId}`;

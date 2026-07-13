// Offline unit tests for the pure logic in lib.mjs. No network, no credentials.
import assert from "node:assert/strict";
import { slug, nsFor, classifyDistance, parseFacts, isTransient, blobIdOf, walruscan } from "../lib.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`); };

t("slug lowercases, strips punctuation, hyphenates spaces", () => {
  assert.equal(slug("Elara's Pendant"), "elaras-pendant");
  assert.equal(slug("the Fold"), "the-fold");
  assert.equal(slug("  Cost of the Fold  "), "cost-of-the-fold");
});

t("nsFor builds one namespace per entity", () => {
  assert.equal(nsFor({ story: "saltglass", type: "char", entity: "Elara" }), "saltglass::char::elara");
  assert.equal(nsFor({ story: "saltglass", type: "object", entity: "the Sunblade" }), "saltglass::object::the-sunblade");
});

t("nsFor builds coarse namespaces for accretive types", () => {
  assert.equal(nsFor({ story: "saltglass", type: "events" }), "saltglass::events");
  assert.equal(nsFor({ story: "saltglass", type: "timeline" }), "saltglass::timeline");
});

t("nsFor requires an entity for entity types", () => {
  assert.throws(() => nsFor({ story: "s", type: "char" }), /needs an entity/);
});

t("classifyDistance follows the dedup policy", () => {
  assert.equal(classifyDistance(0.10), "duplicate");
  assert.equal(classifyDistance(0.40), "related");
  assert.equal(classifyDistance(0.80), "unrelated");
});

t("parseFacts reads canon lines beginning with [canon:...]", () => {
  const raw = "[canon:char] Elara — alive (as of: Ch.1)\n[canon:char] Kane — warden (as of: Ch.1)\n";
  assert.deepEqual(parseFacts(raw), [
    "[canon:char] Elara — alive (as of: Ch.1)",
    "[canon:char] Kane — warden (as of: Ch.1)",
  ]);
});

t("parseFacts also accepts a JSON array (strings or {text})", () => {
  assert.deepEqual(parseFacts('["a","b"]'), ["a", "b"]);
  assert.deepEqual(parseFacts('[{"text":"a"},{"text":"b"}]'), ["a", "b"]);
});

t("isTransient retries 5xx/timeouts/abort, not 4xx", () => {
  assert.equal(isTransient({ status: 503 }), true);
  assert.equal(isTransient({ status: 429 }), true);
  assert.equal(isTransient({ message: "This operation was aborted" }), true);
  assert.equal(isTransient({ status: 401 }), false);
  assert.equal(isTransient({ status: 400 }), false);
});

t("blobIdOf reads varied SDK result shapes", () => {
  assert.equal(blobIdOf({ blob_id: "x" }), "x");
  assert.equal(blobIdOf({ blobId: "y" }), "y");
});

t("walruscan builds a mainnet blob url", () => {
  assert.equal(walruscan("abc"), "https://walruscan.com/mainnet/blob/abc");
});

console.log(`\n${n} checks passed`);

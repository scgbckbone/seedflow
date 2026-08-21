import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");

const readSource = (name) => readFile(path.join(source, name), "utf8");

test("client JavaScript parses", () => {
  execFileSync(process.execPath, ["--check", path.join(source, "app.js")], {
    stdio: "pipe"
  });
});

test("page is self-contained and accessible without external scripts", async () => {
  const html = await readSource("index.html");

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /class="graph-viewport"/);
  assert.match(html, /id="seed-graph"/);
  assert.match(html, /aria-labelledby="graph-title graph-description"/);
  assert.match(html, /<noscript>/);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
  assert.doesNotMatch(html, /class="(?:hero|site-header|formula-section|site-footer)"/);
});

test("graph exposes the technical construction", async () => {
  const app = await readSource("app.js");

  for (const fragment of [
    "STM32 TRNG self-test",
    "Requires eight successful STM32 TRNG reads;",
    "all are discarded.",
    "Without working TRNG access,",
    "COLDCARD cannot start.",
    "mcu_random[32]",
    "32-byte Hash_DRBG output XOR fresh",
    "32-byte STM32 TRNG output",
    "A failed, zero or repeated TRNG word",
    "aborts generation",
    "SE entropy → Hash_DRBG reseed",
    "Hash_DRBG.Reseed(",
    "SHA256d(SE1[32] || SE2[8]))",
    "STARTUP RNG INITIALIZATION",
    "SEED GENERATION",
    "Secure Element 1",
    "Secure Element 2",
    "Fresh startup entropy",
    "master-seed generation",
    "mcu_random[32] ||",
    "≥65 presses; raw timing before debounce",
    "CPU-cycle intervals (~8.33 ns)",
    "event = LE32(index) ||",
    "LE32(cycle gap) || key byte",
    "digest[32] = SHA256(",
    "b'CC\\\\x01' || METHOD_MASH ||",
    "event...)",
    "Only cycle gaps receive entropy credit",
    "≥50 die rolls or ≥128 coin flips",
    "method = METHOD_DICE or METHOD_COIN",
    "b'CC\\\\x01' || method ||",
    "ASCII results...)",
    "Reject face >30% or side >65%",
    "selected method ||",
    "b'CC\\\\x01S' || purpose ||",
    "device_entropy[32] ||",
    "selected digest[32])",
    "BIP39 mnemonic",
    "16 B → 12 words · 32 B → 24 words"
  ]) {
    assert.ok(app.includes(fragment), `missing graph expression: ${fragment}`);
  }
});

test("nodes link to source while edges remain purely visual", async () => {
  const app = await readSource("app.js");
  const nodeBlock = app.slice(app.indexOf("const NODES"), app.indexOf("const EDGES"));
  const edgeBlock = app.slice(app.indexOf("const EDGES"), app.indexOf("const graph"));
  const nodeCount = (nodeBlock.match(/\bid:/g) || []).length;
  const nodeSourceCount = (nodeBlock.match(/\bsource:/g) || []).length;
  const edgeCount = (edgeBlock.match(/\bfrom:/g) || []).length;

  assert.equal(nodeCount, 12);
  assert.equal(nodeSourceCount, nodeCount);
  assert.equal(edgeCount, 10);
  assert.equal((nodeBlock.match(/id: "se1(?:Reseed)?"/g) || []).length, 2);
  assert.equal((nodeBlock.match(/id: "se2(?:Reseed)?"/g) || []).length, 2);
  assert.doesNotMatch(nodeBlock, /id: "trng"/);
  assert.doesNotMatch(edgeBlock, /from: "trngGate"/);
  assert.match(edgeBlock, /from: "se1Reseed", to: "runtimeReseed"/);
  assert.match(edgeBlock, /from: "se2Reseed", to: "runtimeReseed"/);
  assert.doesNotMatch(edgeBlock, /\blabel:/);
  assert.doesNotMatch(edgeBlock, /\bsource:/);
  assert.doesNotMatch(edgeBlock, /\bpath:/);
  assert.doesNotMatch(nodeBlock, /id: "context"/);
  assert.doesNotMatch(nodeBlock, /id: "userHash"/);
  assert.doesNotMatch(nodeBlock, /id: "mashDigest"/);
  assert.doesNotMatch(nodeBlock, /id: "symbolDigest"/);
  assert.doesNotMatch(nodeBlock, /id: "passphrase"/);
  assert.doesNotMatch(nodeBlock, /id: "bip39"/);
  assert.doesNotMatch(nodeBlock, /id: "bip32"/);
  assert.doesNotMatch(nodeBlock, /user_entropy\[32\]/);
  assert.doesNotMatch(app, /userEntropy/);
  assert.doesNotMatch(app, /const PHASES/);
  assert.doesNotMatch(edgeBlock, /from: "context"/);
  assert.doesNotMatch(edgeBlock, /H 1515/);
  assert.doesNotMatch(edgeBlock, /control:\s*true/);
  assert.doesNotMatch(nodeBlock, /source:\s*SOURCE\.pushButton/);
  assert.match(app, /href: node\.source/);
  assert.doesNotMatch(app, /href: edge\.source/);
  assert.match(app, /href: lane\.source/);
  assert.match(app, /class: "edge-group"/);
  assert.doesNotMatch(app, /class: "edge-link/);
  assert.doesNotMatch(app, /class: "edge-label"/);
  assert.doesNotMatch(app, /class: "node-path"/);
  assert.match(app, /https:\/\/petertodd\.org\/2014\/push-button-rng/);
  assert.match(app, /https:\/\/coldcard\.com\/docs\/master-seed\/#create-a-new-master-seed/);
  assert.match(app, /dispatch\.c#L597-L602/);
  assert.match(app, /dispatch\.c#L604-L608/);
  assert.match(app, /ae\.c#L694-L714/);
  assert.match(app, /se2\.c#L1331-L1347/);
  assert.match(app, /shared\/seed\.py#L653/);
  assert.match(app, /shared\/seed\.py#L654/);
  assert.match(app, /shared\/mk4\.py#L39-L50/);
  assert.match(app, /shared\/mk4\.py#L43/);
  assert.match(app, /shared\/mk4\.py#L44/);
  assert.match(app, /shared\/main\.py#L52-L60/);
  assert.match(app, /random\.c#L159-L171/);
  assert.match(app, /shared\/numpad\.py#L61-L87/);
  assert.match(app, /COLDCARD_MK4\/rng\.c#L180-L210/);
  assert.match(app, /COLDCARD_MK4\/rng\.c#L105-L167/);
  assert.match(app, /COLDCARD_MK4\/modckcc\.c#L282-L288/);
  assert.match(app, /COLDCARD_MK4\/mpconfigboard\.h#L83-L84/);
  assert.match(app, /Coldcard\/micropython\/blob\/4107246f/);
  assert.match(app, /random_backend\.h#L26-L41/);
  assert.match(app, /random\.c#L20-L93/);
  assert.match(app, /label: "CALL SITE"/);
  assert.match(app, /label: "BOARD HOOK"/);
  assert.match(app, /label: "MPY INIT"/);
  assert.equal((app.match(/label: "RNG_GET IMPL"/g) || []).length, 1);
  assert.match(app, /label: "TRNG ADAPTER"/);
  assert.match(app, /label: "SEED CALL"/);
  assert.match(app, /label: "RESEED CALL"/);
  assert.match(app, /label: "BOOT CALL"/);
  assert.match(app, /label: "RESEED IMPL"/);
  assert.doesNotMatch(app, /label: "IMPLEMENTATION"/);
  assert.match(app, /https:\/\/github\.com\/Coldcard\/firmware/);
  assert.match(app, /https:\/\/github\.com\/switck\/libngu/);
});

test("build emits the complete Pages artifact", async () => {
  execFileSync(process.execPath, [path.join(root, "scripts", "build.mjs")], {
    cwd: root,
    stdio: "pipe"
  });

  for (const name of ["index.html", "styles.css", "app.js", "favicon.svg", "build.json"]) {
    const info = await stat(path.join(root, "dist", name));
    assert.ok(info.isFile(), `${name} was not emitted`);
  }
});

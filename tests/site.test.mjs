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
    "STM32 TRNG / rng_get()",
    "RNG->DR → 32-bit word",
    "DRDY ≤ 10 ms · ≤3 attempts",
    "seed error / zero / timeout → EFAULT",
    "Hash_DRBG + fresh STM32 TRNG",
    "TRNG init/auto-reseed: 32 × rng_get() = 128 B",
    "output[32] = Hash_DRBG-SHA256[32]",
    "XOR 8 × rng_get()",
    "zero / repeat / read failure → EFAULT",
    "Secure-element startup reseed",
    "n[32] = SHA256d(SE1[32] || SE2[8])",
    "ngu.random.reseed(n)",
    "runs during early application startup",
    "RUNTIME RNG INITIALIZATION",
    "MASTER-SEED GENERATION",
    "APPLICATION START REQUIRES STM32 TRNG",
    'titleLines: ["APPLICATION START", "REQUIRES STM32 TRNG"]',
    "DRDY must appear within 10 ms",
    "8 reads must reach hardware rng_get()",
    "missing TRNG or wrong linkage",
    "→ __fatal_error()",
    "Python and COLDCARD UI do not start",
    "SHA256d(mcu_random[32] ||",
    "65 presses → 64 gaps × 2 credited bits",
    "key bytes mixed · 0 credited bits",
    "pack('<IIB', count, Δticks, key)",
    "Dice Rolls: ≥50 · ASCII 1..6",
    "Coin Flips: ≥128 · ASCII 1|0",
    "SHA256(b'CC\\\\x01' || method",
    "b'CC\\\\x01S' || purpose",
    "SHA256d(context || device_entropy",
    "PBKDF2-HMAC-SHA512",
    "HMAC-SHA512(\\\"Bitcoin seed\\\""
  ]) {
    assert.ok(app.includes(fragment), `missing graph expression: ${fragment}`);
  }
});

test("every graph node and edge links directly to implementation source", async () => {
  const app = await readSource("app.js");
  const nodeBlock = app.slice(app.indexOf("const NODES"), app.indexOf("const EDGES"));
  const edgeBlock = app.slice(app.indexOf("const EDGES"), app.indexOf("const graph"));
  const nodeCount = (nodeBlock.match(/\bid:/g) || []).length;
  const nodeSourceCount = (nodeBlock.match(/\bsource:/g) || []).length;
  const edgeCount = (edgeBlock.match(/\bfrom:/g) || []).length;
  const edgeSourceCount = (edgeBlock.match(/\bsource:/g) || []).length;

  assert.equal(nodeCount, 18);
  assert.equal(nodeSourceCount, nodeCount);
  assert.equal(edgeCount, 17);
  assert.equal(edgeSourceCount, edgeCount);
  assert.equal((nodeBlock.match(/title: "Secure Element 1"/g) || []).length, 2);
  assert.equal((nodeBlock.match(/title: "Secure Element 2"/g) || []).length, 2);
  assert.match(edgeBlock, /from: "se1Reseed", to: "runtimeReseed"/);
  assert.match(edgeBlock, /from: "se2Reseed", to: "runtimeReseed"/);
  assert.doesNotMatch(edgeBlock, /H 1515/);
  assert.doesNotMatch(edgeBlock, /label:\s*"SHA256d?"/);
  assert.match(edgeBlock, /label:\s*"required"[^}]+control:\s*true/);
  assert.doesNotMatch(nodeBlock, /source:\s*SOURCE\.pushButton/);
  assert.doesNotMatch(edgeBlock, /source:\s*SOURCE\.pushButton/);
  assert.match(app, /href: node\.source/);
  assert.match(app, /href: edge\.source/);
  assert.match(app, /href: lane\.source/);
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
  assert.match(app, /label: "MICROPYTHON INIT"/);
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

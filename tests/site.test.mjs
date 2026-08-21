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
    "init = TRNG[128]",
    "generate[32] XOR TRNG_fresh[32]",
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

  assert.equal(nodeCount, 14);
  assert.equal(nodeSourceCount, nodeCount);
  assert.equal(edgeCount, 13);
  assert.equal(edgeSourceCount, edgeCount);
  assert.doesNotMatch(edgeBlock, /label:\s*"SHA256d?"/);
  assert.match(edgeBlock, /label:\s*"required"[^}]+control:\s*true/);
  assert.doesNotMatch(nodeBlock, /source:\s*SOURCE\.pushButton/);
  assert.doesNotMatch(edgeBlock, /source:\s*SOURCE\.pushButton/);
  assert.match(app, /href: node\.source/);
  assert.match(app, /href: edge\.source/);
  assert.match(app, /https:\/\/petertodd\.org\/2014\/push-button-rng/);
  assert.match(app, /https:\/\/coldcard\.com\/docs\/master-seed\/#create-a-new-master-seed/);
  assert.match(app, /dispatch\.c#L597-L602/);
  assert.match(app, /dispatch\.c#L604-L608/);
  assert.match(app, /shared\/numpad\.py#L61-L87/);
  assert.match(app, /COLDCARD_MK4\/rng\.c#L180-L210/);
  assert.match(app, /COLDCARD_MK4\/modckcc\.c#L282-L288/);
  assert.match(app, /label: "CALL SITE"/);
  assert.match(app, /label: "IMPLEMENTATION"/);
  assert.doesNotMatch(app, /BOARD HOOK|MICROPYTHON INIT/);
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

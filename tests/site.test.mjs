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
    "mcu[32] || se1[32]",
    "gap = ticks_diff(now, last)",
    "pack('<IIB', count, gap, key)",
    "D: ASCII 1..6",
    "C: ASCII 1|0",
    "b'CC\\\\x01' || method",
    "b'CC\\\\x01S' || purpose",
    "context || device_entropy",
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

  assert.equal(nodeCount, 15);
  assert.equal(nodeSourceCount, nodeCount);
  assert.equal(edgeCount, 14);
  assert.equal(edgeSourceCount, edgeCount);
  assert.doesNotMatch(nodeBlock, /source:\s*SOURCE\.pushButton/);
  assert.doesNotMatch(edgeBlock, /source:\s*SOURCE\.pushButton/);
  assert.match(app, /href: node\.source/);
  assert.match(app, /href: edge\.source/);
  assert.match(app, /https:\/\/petertodd\.org\/2014\/push-button-rng/);
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

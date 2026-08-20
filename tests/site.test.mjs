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
  assert.match(html, /id="seed-graph"/);
  assert.match(html, /aria-labelledby="graph-title graph-description"/);
  assert.match(html, /<noscript>/);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
});

test("formula preserves the audited construction", async () => {
  const app = await readSource("app.js");

  for (const fragment of [
    "Hash_DRBG_SHA256",
    "STM32_TRNG(128 bytes)",
    "SHA256d(SE1_boot[32] || SE2_boot[8])",
    "drbg.generate(32) XOR STM32_TRNG_fresh[32]",
    "SHA256d(mcu_random || SE1_fresh[32] || SE2_fresh[8])",
    "SHA256(\"CC\\\\x01\" || method || encoded_user_events)",
    "LE32(i) || LE32(timing_delta_i) || U8(key_code_i)",
    "PBKDF2-HMAC-SHA512",
    "HMAC-SHA512"
  ]) {
    assert.ok(app.includes(fragment), `missing formula fragment: ${fragment}`);
  }
});

test("graph edges all resolve to public source or documentation links", async () => {
  const app = await readSource("app.js");
  const edgeBlock = app.slice(app.indexOf("const EDGES"), app.indexOf("const FORMULA"));
  const edgeCount = (edgeBlock.match(/\bfrom:/g) || []).length;
  const sourceCount = (edgeBlock.match(/\bsource:/g) || []).length;

  assert.equal(edgeCount, 13);
  assert.equal(sourceCount, edgeCount);
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

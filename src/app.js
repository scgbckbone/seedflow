const SVG_NS = "http://www.w3.org/2000/svg";

const SOURCE = Object.freeze({
  seed: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L850",
  constants: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L39-L55",
  deviceEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L659",
  userEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L688-L837",
  hashDrbg: "https://github.com/switck/libngu/blob/master/ngu/random.c#L41-L91",
  secureElements: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/dispatch.c#L592-L608",
  seedWords: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L887-L968",
  bip39Words: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L318-L344",
  bip39Seed: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L443-L451",
  bip32: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L359-L386",
  bip32Children: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L359-L554",
  pushButton: "https://petertodd.org/2014/push-button-rng"
});

const TONES = Object.freeze({
  hardware: { color: "#ff8a00", glow: "rgb(255 138 0 / 25%)" },
  human: { color: "#8be28b", glow: "rgb(139 226 139 / 24%)" },
  process: { color: "#6ed5ff", glow: "rgb(110 213 255 / 24%)" },
  context: { color: "#c5a3ff", glow: "rgb(197 163 255 / 24%)" },
  result: { color: "#ffcc00", glow: "rgb(255 204 0 / 28%)" },
  standard: { color: "#f5f2de", glow: "rgb(245 242 222 / 18%)" }
});

const NODES = [
  {
    id: "trng", x: 25, y: 40, w: 250, h: 90,
    title: "STM32 TRNG → Hash_DRBG",
    expression: ["init = TRNG[128]", "generate[32] XOR TRNG_fresh[32]"],
    path: "libngu/ngu/random.c:41–91",
    tone: "hardware", source: SOURCE.hashDrbg
  },
  {
    id: "se1", x: 25, y: 150, w: 250, h: 90,
    title: "Secure Element 1",
    expression: "authenticated_random[32]",
    path: "firmware/dispatch.c:592–608",
    tone: "hardware", source: SOURCE.secureElements
  },
  {
    id: "se2", x: 25, y: 260, w: 250, h: 90,
    title: "Secure Element 2",
    expression: "authenticated_random[8]",
    path: "firmware/dispatch.c:592–608",
    tone: "hardware", source: SOURCE.secureElements
  },
  {
    id: "deviceHash", x: 330, y: 150, w: 200, h: 90,
    title: "SHA256d",
    expression: ["mcu[32] || se1[32]", "|| se2[8]"],
    path: "firmware/shared/seed.py:646–659",
    tone: "process", source: SOURCE.deviceEntropy
  },
  {
    id: "device", x: 590, y: 150, w: 210, h: 90,
    title: "device_entropy[32]",
    expression: "SHA256(SHA256(device_sources))",
    path: "firmware/shared/seed.py:646–659",
    tone: "result", source: SOURCE.deviceEntropy
  },
  {
    id: "user", x: 25, y: 410, w: 250, h: 100,
    title: "Required user events",
    expression: ["M: pack(<IIB, i, Δticks, key)", "D: ASCII 1..6 · C: ASCII 0|1"],
    path: "firmware/shared/seed.py:688–837",
    tone: "human", source: SOURCE.userEntropy,
    doc: SOURCE.pushButton, docLabel: "MASH: PBRNG PAPER"
  },
  {
    id: "userHash", x: 330, y: 415, w: 200, h: 90,
    title: "SHA256",
    expression: ["CC\\x01 || method", "|| encoded_events"],
    path: "firmware/shared/seed.py:688–837",
    tone: "process", source: SOURCE.userEntropy
  },
  {
    id: "context", x: 590, y: 590, w: 210, h: 90,
    title: "Context bytes",
    expression: ["CC\\x01S || purpose", "|| method"],
    path: "firmware/shared/seed.py:39–55",
    tone: "context", source: SOURCE.constants
  },
  {
    id: "mix", x: 800, y: 380, w: 235, h: 100,
    title: "SHA256d",
    expression: ["context || device_entropy", "|| user_entropy"],
    path: "firmware/shared/seed.py:646–850",
    tone: "process", source: SOURCE.seed
  },
  {
    id: "seed", x: 1100, y: 385, w: 215, h: 90,
    title: "seed_entropy[32]",
    expression: "final entropy value",
    path: "firmware/shared/seed.py:887–968",
    tone: "result", source: SOURCE.seedWords
  },
  {
    id: "words", x: 1380, y: 385, w: 195, h: 90,
    title: "BIP39 mnemonic",
    expression: "16 B → 12 words · 32 B → 24 words",
    path: "libngu/ngu/bip39.py:318–344",
    tone: "standard", source: SOURCE.bip39Words
  },
  {
    id: "passphrase", x: 1100, y: 610, w: 215, h: 90,
    title: "BIP39 passphrase",
    expression: "salt = mnemonic || passphrase",
    path: "libngu/ngu/bip39.py:443–451",
    tone: "human", source: SOURCE.bip39Seed
  },
  {
    id: "bip39", x: 1380, y: 610, w: 195, h: 90,
    title: "BIP39 seed[64]",
    expression: "PBKDF2-HMAC-SHA512 · 2048",
    path: "libngu/ngu/bip39.py:443–451",
    tone: "standard", source: SOURCE.bip39Seed
  },
  {
    id: "bip32", x: 1350, y: 755, w: 225, h: 90,
    title: "BIP32 root + children",
    expression: ["HMAC-SHA512(\"Bitcoin seed\",", "bip39_seed) → derive(path)"],
    path: "libngu/ngu/hdnode.c:359–554",
    tone: "result", source: SOURCE.bip32Children
  }
];

const EDGES = [
  { from: "trng", to: "deviceHash", fromPort: "right", toPort: "left", label: "32 B", labelX: 300, labelY: 107, source: SOURCE.hashDrbg, path: "libngu/ngu/random.c:41–91" },
  { from: "se1", to: "deviceHash", fromPort: "right", toPort: "left", label: "32 B", labelX: 302, labelY: 178, source: SOURCE.secureElements, path: "firmware/dispatch.c:592–608" },
  { from: "se2", to: "deviceHash", fromPort: "right", toPort: "left", label: "8 B", labelX: 300, labelY: 286, source: SOURCE.secureElements, path: "firmware/dispatch.c:592–608" },
  { from: "deviceHash", to: "device", fromPort: "right", toPort: "left", label: "SHA256d", labelX: 560, labelY: 178, source: SOURCE.deviceEntropy, path: "firmware/shared/seed.py:646–659" },
  { from: "device", to: "mix", fromPort: "bottom", toPort: "top", label: "device[32]", labelX: 805, labelY: 300, source: SOURCE.seed, path: "firmware/shared/seed.py:646–850" },
  { from: "user", to: "userHash", fromPort: "right", toPort: "left", label: "events", labelX: 302, labelY: 443, source: SOURCE.userEntropy, path: "firmware/shared/seed.py:688–837" },
  { from: "userHash", to: "mix", fromPort: "right", toPort: "left", label: "digest[32]", labelX: 665, labelY: 441, source: SOURCE.userEntropy, path: "firmware/shared/seed.py:688–837" },
  { from: "context", to: "mix", fromPort: "right", toPort: "bottom", label: "CC\\x01S | purpose | method", labelX: 820, labelY: 555, source: SOURCE.constants, path: "firmware/shared/seed.py:39–55" },
  { from: "mix", to: "seed", fromPort: "right", toPort: "left", label: "SHA256d", labelX: 1067, labelY: 412, source: SOURCE.seed, path: "firmware/shared/seed.py:646–850" },
  { from: "seed", to: "words", fromPort: "right", toPort: "left", label: "16|32 B", labelX: 1347, labelY: 412, source: SOURCE.seedWords, path: "firmware/shared/seed.py:887–968" },
  { from: "words", to: "bip39", fromPort: "bottom", toPort: "top", label: "mnemonic", labelX: 1478, labelY: 540, source: SOURCE.bip39Seed, path: "libngu/ngu/bip39.py:443–451" },
  { from: "passphrase", to: "bip39", fromPort: "right", toPort: "left", label: "salt", labelX: 1347, labelY: 638, source: SOURCE.bip39Seed, path: "libngu/ngu/bip39.py:443–451" },
  { from: "bip39", to: "bip32", fromPort: "bottom", toPort: "top", label: "64 B", labelX: 1470, labelY: 727, source: SOURCE.bip32, path: "libngu/ngu/hdnode.c:359–386" }
];

const graph = document.querySelector("#seed-graph");
const sourcePeek = document.querySelector("#source-peek");
const sourceKind = document.querySelector("#source-kind");
const sourcePath = document.querySelector("#source-path");
const nodeMap = new Map(NODES.map((node) => [node.id, node]));

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function setSourcePeek(kind, path, href) {
  sourceKind.textContent = kind;
  sourcePath.textContent = path;
  sourcePeek.href = href;
}

function anchor(node, port) {
  if (port === "left") return { x: node.x, y: node.y + node.h / 2 };
  if (port === "right") return { x: node.x + node.w, y: node.y + node.h / 2 };
  if (port === "top") return { x: node.x + node.w / 2, y: node.y };
  return { x: node.x + node.w / 2, y: node.y + node.h };
}

function connector(start, end, fromPort, toPort) {
  const horizontal = fromPort === "left" || fromPort === "right";
  const targetHorizontal = toPort === "left" || toPort === "right";

  if (horizontal && targetHorizontal) {
    const bend = Math.max(52, Math.abs(end.x - start.x) * 0.46);
    const direction = fromPort === "right" ? 1 : -1;
    const targetDirection = toPort === "left" ? -1 : 1;
    return `M ${start.x} ${start.y} C ${start.x + bend * direction} ${start.y}, ${end.x + bend * targetDirection} ${end.y}, ${end.x} ${end.y}`;
  }

  if (!horizontal && !targetHorizontal) {
    const bend = Math.max(50, Math.abs(end.y - start.y) * 0.46);
    const direction = fromPort === "bottom" ? 1 : -1;
    const targetDirection = toPort === "top" ? -1 : 1;
    return `M ${start.x} ${start.y} C ${start.x} ${start.y + bend * direction}, ${end.x} ${end.y + bend * targetDirection}, ${end.x} ${end.y}`;
  }

  if (horizontal) {
    const midX = start.x + (end.x - start.x) * 0.54;
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${end.x} ${start.y}, ${end.x} ${end.y}`;
  }

  const midY = start.y + (end.y - start.y) * 0.54;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${start.x} ${end.y}, ${end.x} ${end.y}`;
}

function renderDefinitions() {
  const defs = svgElement("defs");
  const marker = svgElement("marker", {
    id: "arrow", markerWidth: 8, markerHeight: 8, refX: 7, refY: 4,
    orient: "auto", markerUnits: "strokeWidth"
  });
  marker.append(svgElement("path", { d: "M 0 0 L 8 4 L 0 8 z", fill: "#696953" }));
  defs.append(marker);
  graph.append(defs);
}

function renderEdge(edge) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  const start = anchor(from, edge.fromPort);
  const end = anchor(to, edge.toPort);
  const path = connector(start, end, edge.fromPort, edge.toPort);
  const link = svgElement("a", {
    href: edge.source,
    target: "_blank",
    rel: "noreferrer",
    class: "edge-link",
    tabindex: "0",
    "aria-label": `${from.title} to ${to.title}: open implementation source`
  });

  const title = svgElement("title");
  title.textContent = `${from.title} → ${to.title} · ${edge.path}`;
  link.append(title);
  link.append(svgElement("path", { d: path, class: "edge-hit" }));
  link.append(svgElement("path", { d: path, class: "flow-edge", "marker-end": "url(#arrow)" }));

  const width = Math.max(48, edge.label.length * 6.3 + 16);
  const label = svgElement("g", { class: "edge-label" });
  label.append(svgElement("rect", {
    x: edge.labelX - width / 2,
    y: edge.labelY - 10,
    width,
    height: 20,
    rx: 5
  }));
  const text = svgElement("text", {
    x: edge.labelX,
    y: edge.labelY + 3.5,
    "text-anchor": "middle"
  });
  text.textContent = edge.label;
  label.append(text);
  link.append(label);

  link.addEventListener("pointerenter", () => setSourcePeek("EDGE", edge.path, edge.source));
  link.addEventListener("focus", () => setSourcePeek("EDGE", edge.path, edge.source));
  graph.append(link);
}

function renderNode(node) {
  const tone = TONES[node.tone];
  const link = svgElement("a", {
    href: node.source,
    target: "_blank",
    rel: "noreferrer",
    class: "flow-node",
    tabindex: "0",
    "aria-label": `${node.title}: open implementation source`
  });
  link.style.setProperty("--node-color", tone.color);
  link.style.setProperty("--node-glow", tone.glow);

  const title = svgElement("title");
  title.textContent = `${node.title} · ${node.path}`;
  link.append(title);
  link.append(svgElement("rect", {
    x: node.x, y: node.y, width: node.w, height: node.h, rx: 12
  }));

  const titleText = svgElement("text", {
    x: node.x + 17, y: node.y + 30, class: "node-title"
  });
  titleText.textContent = node.title;
  link.append(titleText);

  const expression = svgElement("text", {
    x: node.x + 17, y: node.y + 51, class: "node-expression"
  });
  const lines = Array.isArray(node.expression) ? node.expression : [node.expression];
  lines.forEach((line, index) => {
    const span = svgElement("tspan", {
      x: node.x + 17,
      dy: index === 0 ? 0 : 14
    });
    span.textContent = line;
    expression.append(span);
  });
  link.append(expression);

  const pathText = svgElement("text", {
    x: node.x + 17, y: node.y + node.h - 13, class: "node-path"
  });
  pathText.textContent = node.path;
  link.append(pathText);

  link.addEventListener("pointerenter", () => setSourcePeek("NODE", node.path, node.source));
  link.addEventListener("focus", () => setSourcePeek("NODE", node.path, node.source));
  graph.append(link);

  if (node.doc) renderDocLink(node);
}

function renderDocLink(node) {
  const width = 132;
  const x = node.x;
  const y = node.y + node.h + 8;
  const link = svgElement("a", {
    href: node.doc,
    target: "_blank",
    rel: "noreferrer",
    class: "doc-link",
    tabindex: "0",
    "aria-label": "Mash Keys: open Push-Button RNG reference"
  });
  const title = svgElement("title");
  title.textContent = "Mash Keys · Peter Todd's Push-Button RNG";
  link.append(title);
  link.append(svgElement("rect", { x, y, width, height: 18, rx: 5 }));
  const text = svgElement("text", { x: x + width / 2, y: y + 12.5, "text-anchor": "middle" });
  text.textContent = node.docLabel;
  link.append(text);
  graph.append(link);
}

renderDefinitions();
EDGES.forEach(renderEdge);
NODES.forEach(renderNode);

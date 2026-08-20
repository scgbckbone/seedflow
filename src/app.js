const SVG_NS = "http://www.w3.org/2000/svg";

const SOURCE = Object.freeze({
  firmware: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L850",
  constants: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L39-L55",
  deviceEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L659",
  userEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L688-L837",
  mash: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L730-L790",
  timing: "https://github.com/Coldcard/firmware/blob/master/shared/numpad.py#L61-L87",
  bootReseed: "https://github.com/Coldcard/firmware/blob/master/shared/mk4.py#L39-L71",
  hashDrbg: "https://github.com/switck/libngu/blob/master/ngu/random.c#L4-L91",
  stm32: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/rng.c#L39-L210",
  secureElements: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/dispatch.c#L592-L608",
  seedWords: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L887-L968",
  bip39Words: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L318-L344",
  bip39Seed: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L443-L451",
  bip32: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L359-L386",
  bip32Children: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L474-L554",
  pushButton: "https://petertodd.org/2014/push-button-rng",
  docs: "https://coldcard.com/docs/master-seed"
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
    id: "trng",
    x: 60,
    y: 55,
    w: 360,
    h: 100,
    title: "STM32 TRNG",
    subtitle: "Hash_DRBG + fresh output · 32 bytes",
    tone: "hardware",
    kind: "DEVICE SOURCE",
    copy: "A SHA-256 Hash_DRBG is initialized from STM32 hardware entropy, reseeded from both Secure Elements at boot, and its output is XORed with fresh STM32 words.",
    formula: "mcu_random =\n  Hash_DRBG.generate(32)\n  XOR STM32_TRNG_fresh[32]",
    source: SOURCE.hashDrbg,
    sourceLabel: "Open Hash_DRBG source"
  },
  {
    id: "se1",
    x: 60,
    y: 210,
    w: 360,
    h: 100,
    title: "Secure Element 1",
    subtitle: "fresh authenticated value · 32 bytes",
    tone: "hardware",
    kind: "DEVICE SOURCE",
    copy: "SE1 contributes a fresh 32-byte value for every generated seed. Its authenticated exchange detects modification on the MCU-to-SE path.",
    formula: "se1_random[32]",
    source: SOURCE.secureElements,
    sourceLabel: "Open Secure Element source"
  },
  {
    id: "se2",
    x: 60,
    y: 365,
    w: 360,
    h: 100,
    title: "Secure Element 2",
    subtitle: "fresh authenticated value · 8 bytes",
    tone: "hardware",
    kind: "DEVICE SOURCE",
    copy: "SE2 contributes a fresh authenticated 8-byte random value for every generated seed.",
    formula: "se2_random[8]",
    source: SOURCE.secureElements,
    sourceLabel: "Open Secure Element source"
  },
  {
    id: "deviceHash",
    x: 540,
    y: 210,
    w: 225,
    h: 100,
    title: "SHA256d",
    subtitle: "combine device sources",
    tone: "process",
    kind: "TRANSFORM",
    copy: "The three device values are concatenated and double-hashed. No single hardware source is used as the seed by itself.",
    formula: "SHA256(SHA256(\n  mcu || se1 || se2\n))",
    source: SOURCE.deviceEntropy,
    sourceLabel: "Open device-mixing source"
  },
  {
    id: "device",
    x: 885,
    y: 210,
    w: 335,
    h: 100,
    title: "Device entropy",
    subtitle: "combined hardware value · 32 bytes",
    tone: "result",
    kind: "INTERMEDIATE VALUE",
    copy: "This 32-byte digest carries the combined contribution of the STM32 generator and both Secure Elements into the final mix.",
    formula: "device_entropy[32]",
    source: SOURCE.deviceEntropy,
    sourceLabel: "Open firmware source"
  },
  {
    id: "user",
    x: 60,
    y: 535,
    w: 360,
    h: 112,
    title: "Required user input",
    subtitle: "Mash Keys · dice rolls · coin flips",
    tone: "human",
    kind: "HUMAN SOURCE",
    copy: "The user must choose one method. Mash Keys hashes press timing and key codes; dice and coin workflows hash the physical results entered.",
    formula: "method ∈ { M, D, C }\nevents = selected input",
    source: SOURCE.docs,
    sourceLabel: "Open user instructions"
  },
  {
    id: "userHash",
    x: 540,
    y: 541,
    w: 225,
    h: 100,
    title: "SHA-256",
    subtitle: "method-separated digest",
    tone: "process",
    kind: "TRANSFORM",
    copy: "The selected user input is hashed with its own method identifier. Mash, dice, and coin input cannot collide merely because their raw symbols match.",
    formula: "SHA256(\n  \"CC\\x01\" || method || events\n)",
    source: SOURCE.userEntropy,
    sourceLabel: "Open user-entropy source"
  },
  {
    id: "context",
    x: 60,
    y: 720,
    w: 360,
    h: 112,
    title: "Domain · purpose · method",
    subtitle: "CC\\x01S · M/T/C · M/D/C",
    tone: "context",
    kind: "CONTEXT",
    copy: "Explicit bytes identify the construction, its purpose, and the selected entropy method. This separates Master Seed, Temporary Seed, and Key C contexts.",
    formula: "domain  = \"CC\\x01S\"\npurpose = M | T | C\nmethod  = M | D | C",
    source: SOURCE.constants,
    sourceLabel: "Open identifiers"
  },
  {
    id: "mix",
    x: 885,
    y: 535,
    w: 335,
    h: 112,
    title: "SHA256d",
    subtitle: "final entropy mix",
    tone: "process",
    kind: "TRANSFORM",
    copy: "Device entropy and the selected user-entropy digest are combined with explicit domain, purpose, and method bytes, then double-hashed.",
    formula: "SHA256d(\n  context || device || user\n)",
    source: SOURCE.firmware,
    sourceLabel: "Open final-mix source"
  },
  {
    id: "seed",
    x: 885,
    y: 720,
    w: 335,
    h: 100,
    title: "Seed entropy",
    subtitle: "final value · 32 bytes",
    tone: "result",
    kind: "RESULT",
    copy: "This final 32-byte value becomes BIP39 entropy. A 12-word wallet uses its first 16 bytes; a 24-word wallet uses all 32 bytes.",
    formula: "seed_entropy[32]",
    source: SOURCE.seedWords,
    sourceLabel: "Open word-generation source"
  },
  {
    id: "words",
    x: 885,
    y: 875,
    w: 335,
    h: 100,
    title: "12 or 24 BIP39 words",
    subtitle: "entropy + BIP39 checksum",
    tone: "standard",
    kind: "STANDARD",
    copy: "BIP39 appends checksum bits to 128 or 256 bits of entropy and maps each 11-bit group into the 2,048-word English list.",
    formula: "12 words = BIP39(entropy[0:16])\n24 words = BIP39(entropy[0:32])",
    source: SOURCE.bip39Words,
    sourceLabel: "Open BIP39 word encoding"
  },
  {
    id: "passphrase",
    x: 60,
    y: 1015,
    w: 360,
    h: 100,
    title: "Optional passphrase",
    subtitle: "BIP39 salt input",
    tone: "human",
    kind: "OPTIONAL INPUT",
    copy: "The optional BIP39 passphrase is not mixed into the mnemonic. It is part of the salt used when the words are converted into the BIP39 seed.",
    formula: "salt = \"mnemonic\" || passphrase",
    source: SOURCE.bip39Seed,
    sourceLabel: "Open passphrase derivation"
  },
  {
    id: "bip39",
    x: 885,
    y: 1015,
    w: 335,
    h: 100,
    title: "BIP39 seed",
    subtitle: "PBKDF2-HMAC-SHA512 · 64 bytes",
    tone: "standard",
    kind: "STANDARD",
    copy: "The mnemonic and optional passphrase are processed with PBKDF2-HMAC-SHA512 for 2,048 iterations, producing a 64-byte BIP39 seed.",
    formula: "PBKDF2-HMAC-SHA512(\n  words, salt, 2048\n)",
    source: SOURCE.bip39Seed,
    sourceLabel: "Open BIP39 seed derivation"
  },
  {
    id: "bip32",
    x: 885,
    y: 1165,
    w: 335,
    h: 82,
    title: "BIP32 root → keypairs",
    subtitle: "deterministic wallet tree",
    tone: "result",
    kind: "WALLET KEYS",
    copy: "HMAC-SHA512 with the key “Bitcoin seed” creates the BIP32 root private key and chain code. Wallet paths derive the keypairs used by addresses and signatures.",
    formula: "HMAC-SHA512(\n  key=\"Bitcoin seed\",\n  message=bip39_seed\n)",
    source: SOURCE.bip32,
    sourceLabel: "Open BIP32 implementation"
  }
];

const EDGES = [
  {
    from: "trng", to: "deviceHash", fromPort: "right", toPort: "left",
    label: "32 bytes", labelX: 478, labelY: 146,
    source: SOURCE.hashDrbg,
    copy: "Hash_DRBG output is XORed with fresh STM32 output before entering the per-seed device mix."
  },
  {
    from: "se1", to: "deviceHash", fromPort: "right", toPort: "left",
    label: "32 bytes", labelX: 470, labelY: 246,
    source: SOURCE.secureElements,
    copy: "A fresh authenticated 32-byte SE1 value enters the device-source hash."
  },
  {
    from: "se2", to: "deviceHash", fromPort: "right", toPort: "left",
    label: "8 bytes", labelX: 475, labelY: 350,
    source: SOURCE.secureElements,
    copy: "A fresh authenticated 8-byte SE2 value enters the device-source hash."
  },
  {
    from: "deviceHash", to: "device", fromPort: "right", toPort: "left",
    label: "SHA256d", labelX: 822, labelY: 246,
    source: SOURCE.deviceEntropy,
    copy: "Double SHA-256 produces the 32-byte device-entropy value."
  },
  {
    from: "device", to: "mix", fromPort: "bottom", toPort: "top",
    label: "device", labelX: 1072, labelY: 425,
    source: SOURCE.firmware,
    copy: "The complete 32-byte device value is carried into the final domain-separated mix."
  },
  {
    from: "user", to: "userHash", fromPort: "right", toPort: "left",
    label: "events", labelX: 480, labelY: 578,
    source: SOURCE.userEntropy,
    copy: "The selected Mash Keys, dice, or coin events are fed into the method-specific SHA-256 state."
  },
  {
    from: "userHash", to: "mix", fromPort: "right", toPort: "left",
    label: "32-byte digest", labelX: 824, labelY: 578,
    source: SOURCE.userEntropy,
    copy: "The 32-byte user-entropy digest supplements the independently generated device value."
  },
  {
    from: "context", to: "mix", fromPort: "right", toPort: "bottom",
    label: "domain + purpose + method", labelX: 700, labelY: 738,
    source: SOURCE.constants,
    copy: "The domain, purpose, and method identifiers are prepended to the final hash input."
  },
  {
    from: "mix", to: "seed", fromPort: "bottom", toPort: "top",
    label: "SHA256d", labelX: 1070, labelY: 688,
    source: SOURCE.firmware,
    copy: "Double SHA-256 produces the final 32-byte seed-entropy value."
  },
  {
    from: "seed", to: "words", fromPort: "bottom", toPort: "top",
    label: "16 or 32 bytes", labelX: 1072, labelY: 850,
    source: SOURCE.seedWords,
    copy: "Twelve words use the first 16 bytes; twenty-four words use all 32 bytes."
  },
  {
    from: "words", to: "bip39", fromPort: "bottom", toPort: "top",
    label: "mnemonic", labelX: 1072, labelY: 1000,
    source: SOURCE.bip39Seed,
    copy: "The mnemonic is the password input to BIP39 seed derivation."
  },
  {
    from: "passphrase", to: "bip39", fromPort: "right", toPort: "left",
    label: "optional salt input", labelX: 662, labelY: 1052,
    source: SOURCE.bip39Seed,
    copy: "The optional passphrase is appended to “mnemonic” to form the PBKDF2 salt."
  },
  {
    from: "bip39", to: "bip32", fromPort: "bottom", toPort: "top",
    label: "64-byte seed", labelX: 1072, labelY: 1145,
    source: SOURCE.bip32,
    copy: "The 64-byte BIP39 seed becomes the message input to BIP32 root derivation."
  }
];

const FORMULA = `SHA256d(x) = SHA256(SHA256(x))

drbg = Hash_DRBG_SHA256(
    STM32_TRNG(128 bytes),
    personalization = "libngu.random"
)

drbg.reseed(
    SHA256d(SE1_boot[32] || SE2_boot[8])
)

mcu_random =
    drbg.generate(32) XOR STM32_TRNG_fresh[32]

device_entropy =
    SHA256d(mcu_random || SE1_fresh[32] || SE2_fresh[8])

user_entropy =
    SHA256("CC\\x01" || method || encoded_user_events)

seed_entropy =
    SHA256d(
        "CC\\x01S" ||
        purpose ||
        method ||
        device_entropy ||
        user_entropy
    )

Mash Keys encoded_user_events =
    for each accepted press i:
        LE32(i) || LE32(timing_delta_i) || U8(key_code_i)

12 words = BIP39(seed_entropy[0:16])
24 words = BIP39(seed_entropy[0:32])

bip39_seed =
    PBKDF2-HMAC-SHA512(
        password   = mnemonic_words,
        salt       = "mnemonic" || optional_passphrase,
        iterations = 2048
    )

bip32_root =
    HMAC-SHA512(
        key     = "Bitcoin seed",
        message = bip39_seed
    )`;

const graph = document.querySelector("#seed-graph");
const detailKind = document.querySelector("#detail-kind");
const detailTitle = document.querySelector("#detail-title");
const detailCopy = document.querySelector("#detail-copy");
const detailFormula = document.querySelector("#detail-formula code");
const detailSource = document.querySelector("#detail-source");
const formulaCode = document.querySelector("#formula-code");
const copyFormula = document.querySelector("#copy-formula");

const nodeMap = new Map(NODES.map((node) => [node.id, node]));

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
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
    const bend = Math.max(72, Math.abs(end.x - start.x) * 0.48);
    const direction = fromPort === "right" ? 1 : -1;
    const targetDirection = toPort === "left" ? -1 : 1;
    return `M ${start.x} ${start.y} C ${start.x + bend * direction} ${start.y}, ${end.x + bend * targetDirection} ${end.y}, ${end.x} ${end.y}`;
  }

  if (!horizontal && !targetHorizontal) {
    const bend = Math.max(64, Math.abs(end.y - start.y) * 0.48);
    const direction = fromPort === "bottom" ? 1 : -1;
    const targetDirection = toPort === "top" ? -1 : 1;
    return `M ${start.x} ${start.y} C ${start.x} ${start.y + bend * direction}, ${end.x} ${end.y + bend * targetDirection}, ${end.x} ${end.y}`;
  }

  if (horizontal) {
    const midX = start.x + (end.x - start.x) * 0.52;
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${end.x} ${start.y}, ${end.x} ${end.y}`;
  }

  const midY = start.y + (end.y - start.y) * 0.52;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${start.x} ${end.y}, ${end.x} ${end.y}`;
}

function showDetail(item, activeNode = null) {
  document.querySelectorAll(".flow-node.is-active").forEach((node) => node.classList.remove("is-active"));
  if (activeNode) activeNode.classList.add("is-active");

  detailKind.textContent = item.kind || "SOURCE PATH";
  detailTitle.textContent = item.title || `${nodeMap.get(item.from).title} → ${nodeMap.get(item.to).title}`;
  detailCopy.textContent = item.copy;
  detailFormula.textContent = item.formula || item.label || "Open the linked source for this transformation.";
  detailSource.href = item.source;
  detailSource.firstChild.textContent = `${item.sourceLabel || "Open source"} `;
}

function renderDefinitions() {
  const defs = svgElement("defs");
  const marker = svgElement("marker", {
    id: "arrow",
    markerWidth: 8,
    markerHeight: 8,
    refX: 7,
    refY: 4,
    orient: "auto",
    markerUnits: "strokeWidth"
  });
  marker.append(svgElement("path", { d: "M 0 0 L 8 4 L 0 8 z", fill: "#686852" }));
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
    "aria-label": `${from.title} to ${to.title}: open source`
  });

  const title = svgElement("title");
  title.textContent = `${from.title} → ${to.title} — open source`;
  link.append(title);
  link.append(svgElement("path", { d: path, class: "edge-hit" }));
  link.append(svgElement("path", { d: path, class: "flow-edge", "marker-end": "url(#arrow)" }));

  if (edge.label) {
    const width = Math.max(58, edge.label.length * 7.2 + 18);
    const label = svgElement("g", { class: "edge-label" });
    label.append(svgElement("rect", {
      x: edge.labelX - width / 2,
      y: edge.labelY - 12,
      width,
      height: 24,
      rx: 7
    }));
    const text = svgElement("text", {
      x: edge.labelX,
      y: edge.labelY + 4,
      "text-anchor": "middle"
    });
    text.textContent = edge.label;
    label.append(text);
    link.append(label);
  }

  link.addEventListener("pointerenter", () => showDetail(edge));
  link.addEventListener("focus", () => showDetail(edge));
  graph.append(link);
}

function renderNode(node, index) {
  const tone = TONES[node.tone];
  const group = svgElement("g", {
    class: "flow-node",
    tabindex: "0",
    role: "button",
    "aria-label": `${node.title}. Select for details.`
  });
  group.style.setProperty("--node-color", tone.color);
  group.style.setProperty("--node-glow", tone.glow);
  group.style.setProperty("animation-delay", `${index * 35}ms`);

  group.append(svgElement("rect", {
    x: node.x,
    y: node.y,
    width: node.w,
    height: node.h,
    rx: 16
  }));

  const title = svgElement("text", {
    x: node.x + 22,
    y: node.y + (node.h < 90 ? 35 : 41),
    class: "node-title"
  });
  title.textContent = node.title;
  group.append(title);

  const subtitle = svgElement("text", {
    x: node.x + 22,
    y: node.y + (node.h < 90 ? 61 : 70),
    class: "node-subtitle"
  });
  subtitle.textContent = node.subtitle;
  group.append(subtitle);

  const sourceMark = svgElement("text", {
    x: node.x + node.w - 24,
    y: node.y + 29,
    class: "node-link-mark",
    "text-anchor": "end"
  });
  sourceMark.textContent = "↗";
  group.append(sourceMark);

  group.addEventListener("pointerenter", () => showDetail(node, group));
  group.addEventListener("focus", () => showDetail(node, group));
  group.addEventListener("click", () => showDetail(node, group));
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showDetail(node, group);
    }
  });

  graph.append(group);
  return group;
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

renderDefinitions();
EDGES.forEach(renderEdge);
const renderedNodes = NODES.map(renderNode);
formulaCode.textContent = FORMULA;
showDetail(nodeMap.get("mix"), renderedNodes[NODES.findIndex((node) => node.id === "mix")]);

copyFormula.addEventListener("click", async () => {
  try {
    await copyText(FORMULA);
    copyFormula.textContent = "Copied";
  } catch {
    copyFormula.textContent = "Copy failed";
  }
  window.setTimeout(() => {
    copyFormula.textContent = "Copy formula";
  }, 1600);
});


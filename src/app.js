const SVG_NS = "http://www.w3.org/2000/svg";

const SOURCE = Object.freeze({
  seedMix: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L792-L837",
  deviceEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L659",
  userEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L688-L790",
  symbolEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L672-L728",
  mashEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L730-L790",
  mashTiming: "https://github.com/Coldcard/firmware/blob/master/shared/numpad.py#L61-L87",
  rngHardware: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/rng.c#L105-L167",
  rngSelftest: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/rng.c#L180-L210",
  rngSelftestCall: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/modckcc.c#L282-L288",
  rngBoardHook: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/mpconfigboard.h#L83-L84",
  micropythonInit: "https://github.com/Coldcard/micropython/blob/4107246f8a080807b62c3b4838e71e812ea68b6f/ports/stm32/main.c#L395",
  trngBackend: "https://github.com/switck/libngu/blob/master/ngu/random_backend.h#L26-L41",
  randomBytes: "https://github.com/switck/libngu/blob/master/ngu/random.c#L20-L93",
  secureElement1: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/ae.c#L694-L714",
  secureElement1Dispatch: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/dispatch.c#L597-L602",
  secureElement1Call: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L653",
  secureElement1ReseedCall: "https://github.com/Coldcard/firmware/blob/master/shared/mk4.py#L43",
  secureElement2: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/se2.c#L1331-L1347",
  secureElement2Dispatch: "https://github.com/Coldcard/firmware/blob/master/stm32/mk4-bootloader/dispatch.c#L604-L608",
  secureElement2Call: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L654",
  secureElement2ReseedCall: "https://github.com/Coldcard/firmware/blob/master/shared/mk4.py#L44",
  runtimeReseed: "https://github.com/Coldcard/firmware/blob/master/shared/mk4.py#L39-L50",
  runtimeReseedCall: "https://github.com/Coldcard/firmware/blob/master/shared/main.py#L52-L60",
  randomReseed: "https://github.com/switck/libngu/blob/master/ngu/random.c#L159-L171",
  seedWords: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L887-L898",
  bip39Words: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L318-L344",
  bip39Seed: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L443-L451",
  bip32: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L359-L386",
  bip32Children: "https://github.com/switck/libngu/blob/master/ngu/hdnode.c#L359-L554",
  pushButton: "https://petertodd.org/2014/push-button-rng",
  masterSeedDocs: "https://coldcard.com/docs/master-seed/#create-a-new-master-seed"
});

const TONES = Object.freeze({
  hardware: { color: "#ff8a00", glow: "rgb(255 138 0 / 25%)" },
  human: { color: "#8be28b", glow: "rgb(139 226 139 / 24%)" },
  process: { color: "#6ed5ff", glow: "rgb(110 213 255 / 24%)" },
  guard: { color: "#ff6868", glow: "rgb(255 104 104 / 25%)" },
  result: { color: "#ffcc00", glow: "rgb(255 204 0 / 28%)" },
  standard: { color: "#f5f2de", glow: "rgb(245 242 222 / 18%)" }
});

const LANES = [
  {
    label: "RUNTIME RNG INITIALIZATION",
    x: 390, y: 7, w: 270, h: 26,
    lineX: 660, lineY: 20,
    bandY: 0, bandH: 475, variant: "runtime",
    source: SOURCE.runtimeReseedCall,
    path: "firmware/shared/main.py:52–60"
  },
  {
    label: "MASTER-SEED GENERATION",
    x: 15, y: 462, w: 220, h: 26,
    lineX: 235, lineY: 475,
    bandY: 475, bandH: 425, variant: "generation",
    source: SOURCE.seedMix,
    path: "firmware/shared/seed.py:792–837"
  }
];

const NODES = [
  {
    id: "rngGate", x: 25, y: 20, w: 300, h: 190,
    title: "APPLICATION START REQUIRES STM32 TRNG",
    titleLines: ["APPLICATION START", "REQUIRES STM32 TRNG"],
    expression: [
      "DRDY must appear within 10 ms",
      "8 reads must reach hardware rng_get()",
      "missing TRNG or wrong linkage",
      "→ __fatal_error()",
      "Python and COLDCARD UI do not start"
    ],
    expressionSize: 10.1,
    path: "firmware/stm32/COLDCARD_MK4/rng.c:180–210",
    tone: "guard", source: SOURCE.rngSelftest,
    links: [
      {
        label: "CALL SITE", width: 70, href: SOURCE.rngSelftestCall,
        kind: "SOURCE", path: "firmware/modckcc.c:282–288"
      },
      {
        label: "BOARD HOOK", width: 82, href: SOURCE.rngBoardHook,
        kind: "SOURCE", path: "firmware/mpconfigboard.h:83–84"
      },
      {
        label: "MICROPYTHON INIT", width: 112, href: SOURCE.micropythonInit,
        kind: "SOURCE", path: "Coldcard/micropython · main.c:395"
      }
    ]
  },
  {
    id: "trng", x: 400, y: 40, w: 270, h: 125,
    title: "STM32 TRNG / rng_get()",
    expression: [
      "RNG->DR → 32-bit word",
      "DRDY ≤ 10 ms · ≤3 attempts",
      "seed error / zero / timeout → EFAULT"
    ],
    expressionSize: 10.1,
    path: "firmware/rng.c:105–167",
    tone: "hardware", source: SOURCE.rngHardware
  },
  {
    id: "mcuRandom", x: 750, y: 40, w: 365, h: 130,
    title: "Hash_DRBG + fresh STM32 TRNG",
    expression: [
      "TRNG init/auto-reseed: 32 × rng_get() = 128 B",
      "output[32] = Hash_DRBG-SHA256[32]",
      "             XOR 8 × rng_get()",
      "zero / repeat / read failure → EFAULT"
    ],
    expressionSize: 10.1,
    path: "libngu/ngu/random.c:20–93",
    tone: "process", source: SOURCE.randomBytes
  },
  {
    id: "se1", x: 400, y: 490, w: 270, h: 110,
    title: "Secure Element 1",
    expression: "authenticated_random[32]",
    path: "firmware/ae.c:694–714",
    tone: "hardware", source: SOURCE.secureElement1,
    links: [
      {
        label: "DISPATCH", width: 66, href: SOURCE.secureElement1Dispatch,
        kind: "SOURCE", path: "firmware/dispatch.c:597–602"
      },
      {
        label: "SEED CALL", width: 70, href: SOURCE.secureElement1Call,
        kind: "SOURCE", path: "firmware/shared/seed.py:653"
      }
    ]
  },
  {
    id: "se2", x: 400, y: 615, w: 270, h: 110,
    title: "Secure Element 2",
    expression: "authenticated_random[8]",
    path: "firmware/se2.c:1331–1347",
    tone: "hardware", source: SOURCE.secureElement2,
    links: [
      {
        label: "DISPATCH", width: 66, href: SOURCE.secureElement2Dispatch,
        kind: "SOURCE", path: "firmware/dispatch.c:604–608"
      },
      {
        label: "SEED CALL", width: 70, href: SOURCE.secureElement2Call,
        kind: "SOURCE", path: "firmware/shared/seed.py:654"
      }
    ]
  },
  {
    id: "runtimeReseed", x: 400, y: 250, w: 300, h: 145,
    title: "Secure-element startup reseed",
    expression: [
      "n[32] = SHA256d(SE1[32] || SE2[8])",
      "ngu.random.reseed(n)",
      "runs during early application startup"
    ],
    expressionSize: 10.1,
    path: "firmware/shared/mk4.py:39–50",
    tone: "process", source: SOURCE.runtimeReseed,
    links: [
      {
        label: "BOOT CALL", width: 70, href: SOURCE.runtimeReseedCall,
        kind: "SOURCE", path: "firmware/shared/main.py:52–60"
      },
      {
        label: "RESEED IMPL", width: 90, href: SOURCE.randomReseed,
        kind: "SOURCE", path: "libngu/ngu/random.c:159–171"
      }
    ]
  },
  {
    id: "se1Reseed", x: 25, y: 225, w: 270, h: 110,
    title: "Secure Element 1",
    expression: "authenticated_random[32]",
    path: "firmware/ae.c:694–714",
    tone: "hardware", source: SOURCE.secureElement1,
    links: [
      {
        label: "DISPATCH", width: 66, href: SOURCE.secureElement1Dispatch,
        kind: "SOURCE", path: "firmware/dispatch.c:597–602"
      },
      {
        label: "RESEED CALL", width: 82, href: SOURCE.secureElement1ReseedCall,
        kind: "SOURCE", path: "firmware/shared/mk4.py:43"
      }
    ]
  },
  {
    id: "se2Reseed", x: 25, y: 350, w: 270, h: 110,
    title: "Secure Element 2",
    expression: "authenticated_random[8]",
    path: "firmware/se2.c:1331–1347",
    tone: "hardware", source: SOURCE.secureElement2,
    links: [
      {
        label: "DISPATCH", width: 66, href: SOURCE.secureElement2Dispatch,
        kind: "SOURCE", path: "firmware/dispatch.c:604–608"
      },
      {
        label: "RESEED CALL", width: 82, href: SOURCE.secureElement2ReseedCall,
        kind: "SOURCE", path: "firmware/shared/mk4.py:44"
      }
    ]
  },
  {
    id: "device", x: 720, y: 500, w: 270, h: 100,
    title: "device_entropy[32]",
    expression: ["SHA256d(mcu_random[32] ||", "SE1[32] || SE2[8])"],
    path: "firmware/shared/seed.py:646–659",
    tone: "process", source: SOURCE.deviceEntropy
  },
  {
    id: "mash", x: 25, y: 490, w: 280, h: 145,
    title: "Mash Keys",
    expression: [
      "65 presses → 64 gaps × 2 credited bits",
      "key bytes mixed · 0 credited bits",
      "pack('<IIB', count, Δticks, key)"
    ],
    expressionSize: 10.1,
    path: "firmware/shared/seed.py:730–790",
    tone: "human", source: SOURCE.mashEntropy,
    links: [
      {
        label: "TIMING", width: 54, href: SOURCE.mashTiming,
        kind: "SOURCE", path: "firmware/shared/numpad.py:61–87"
      },
      {
        label: "MASTER SEED DOCS", width: 100, href: SOURCE.masterSeedDocs,
        kind: "DOCS", path: "coldcard.com/docs/master-seed"
      },
      {
        label: "PUSH-BUTTON RNG", width: 100, href: SOURCE.pushButton,
        kind: "REFERENCE", path: "petertodd.org/2014/push-button-rng"
      }
    ]
  },
  {
    id: "symbols", x: 25, y: 660, w: 280, h: 130,
    title: "Dice Rolls / Coin Flips",
    expression: [
      "Dice Rolls: ≥50 · ASCII 1..6",
      "Coin Flips: ≥128 · ASCII 1|0",
      "max frequency: dice 30% · coin 65%"
    ],
    expressionSize: 10.1,
    path: "firmware/shared/seed.py:672–728",
    tone: "human", source: SOURCE.symbolEntropy,
    links: [
      {
        label: "MASTER SEED DOCS", width: 100, href: SOURCE.masterSeedDocs,
        kind: "DOCS", path: "coldcard.com/docs/master-seed"
      }
    ]
  },
  {
    id: "userHash", x: 400, y: 750, w: 230, h: 100,
    title: "user_entropy[32]",
    expression: ["SHA256(b'CC\\x01' || method", "|| encoded_events)"],
    path: "firmware/shared/seed.py:688–790",
    tone: "process", source: SOURCE.userEntropy
  },
  {
    id: "mix", x: 1025, y: 550, w: 270, h: 110,
    title: "seed_entropy[32]",
    expression: [
      "SHA256d(b'CC\\x01S' || purpose",
      "|| method || device_entropy",
      "|| user_entropy)"
    ],
    path: "firmware/shared/seed.py:792–837",
    tone: "process", source: SOURCE.seedMix
  },
  {
    id: "words", x: 1325, y: 555, w: 250, h: 90,
    title: "BIP39 mnemonic",
    expression: "16 B → 12 words · 32 B → 24 words",
    path: "libngu/ngu/bip39.py:318–344",
    tone: "standard", source: SOURCE.bip39Words
  },
  {
    id: "passphrase", x: 1050, y: 690, w: 245, h: 90,
    title: "BIP39 passphrase",
    expression: "salt = mnemonic || passphrase",
    path: "libngu/ngu/bip39.py:443–451",
    tone: "human", source: SOURCE.bip39Seed
  },
  {
    id: "bip39", x: 1350, y: 690, w: 205, h: 90,
    title: "BIP39 seed[64]",
    expression: "PBKDF2-HMAC-SHA512 · 2048",
    path: "libngu/ngu/bip39.py:443–451",
    tone: "standard", source: SOURCE.bip39Seed
  },
  {
    id: "bip32", x: 1325, y: 805, w: 250, h: 90,
    title: "BIP32 root + children",
    expression: ["HMAC-SHA512(\"Bitcoin seed\",", "bip39_seed) → derive(path)"],
    path: "libngu/ngu/hdnode.c:359–554",
    tone: "result", source: SOURCE.bip32Children
  }
];

const EDGES = [
  { from: "rngGate", to: "trng", fromPort: "right", toPort: "left", label: "required", labelX: 362, labelY: 78, source: SOURCE.rngSelftest, path: "firmware/stm32/COLDCARD_MK4/rng.c:180–210", control: true },
  { from: "trng", to: "mcuRandom", fromPort: "right", toPort: "left", label: "rng_get()", labelX: 710, labelY: 72, source: SOURCE.trngBackend, path: "libngu/ngu/random_backend.h:26–41" },
  { from: "se1Reseed", to: "runtimeReseed", fromPort: "right", toPort: "left", label: "32 B", labelX: 347, labelY: 268, source: SOURCE.secureElement1ReseedCall, path: "firmware/shared/mk4.py:43" },
  { from: "se2Reseed", to: "runtimeReseed", fromPort: "right", toPort: "left", label: "8 B", labelX: 347, labelY: 397, source: SOURCE.secureElement2ReseedCall, path: "firmware/shared/mk4.py:44" },
  { from: "runtimeReseed", to: "mcuRandom", fromPort: "right", toPort: "left", label: "startup reseed[32]", labelX: 725, labelY: 214, source: SOURCE.randomReseed, path: "libngu/ngu/random.c:159–171", route: "M 700 322.5 C 730 322.5, 720 105, 750 105" },
  { from: "mcuRandom", to: "device", fromPort: "bottom", toPort: "top", label: "mcu_random[32]", labelX: 970, labelY: 348, source: SOURCE.deviceEntropy, path: "firmware/shared/seed.py:646–659" },
  { from: "se1", to: "device", fromPort: "right", toPort: "left", label: "32 B", labelX: 695, labelY: 518, source: SOURCE.secureElement1, path: "firmware/ae.c:694–714" },
  { from: "se2", to: "device", fromPort: "right", toPort: "left", label: "8 B", labelX: 695, labelY: 650, source: SOURCE.secureElement2, path: "firmware/se2.c:1331–1347", route: "M 670 670 C 700 670, 690 550, 720 550" },
  { from: "device", to: "mix", fromPort: "bottom", toPort: "top", label: "device_entropy[32]", labelX: 915, labelY: 626, source: SOURCE.seedMix, path: "firmware/shared/seed.py:792–837" },
  { from: "mash", to: "userHash", fromPort: "right", toPort: "left", label: "timing", labelX: 347, labelY: 640, source: SOURCE.mashEntropy, path: "firmware/shared/seed.py:730–790" },
  { from: "symbols", to: "userHash", fromPort: "right", toPort: "left", label: "ASCII", labelX: 347, labelY: 732, source: SOURCE.symbolEntropy, path: "firmware/shared/seed.py:672–728" },
  { from: "userHash", to: "mix", fromPort: "right", toPort: "left", label: "user_entropy[32]", labelX: 815, labelY: 820, source: SOURCE.seedMix, path: "firmware/shared/seed.py:792–837", route: "M 630 800 H 980 Q 1005 800 1005 775 V 630 Q 1005 605 1025 605" },
  { from: "mix", to: "words", fromPort: "right", toPort: "left", label: "16|32 B", labelX: 1310, labelY: 533, source: SOURCE.seedWords, path: "firmware/shared/seed.py:887–898" },
  { from: "words", to: "bip39", fromPort: "bottom", toPort: "top", label: "mnemonic", labelX: 1450, labelY: 668, source: SOURCE.bip39Seed, path: "libngu/ngu/bip39.py:443–451" },
  { from: "passphrase", to: "bip39", fromPort: "right", toPort: "left", label: "salt", labelX: 1323, labelY: 735, source: SOURCE.bip39Seed, path: "libngu/ngu/bip39.py:443–451" },
  { from: "bip39", to: "bip32", fromPort: "bottom", toPort: "top", label: "64 B", labelX: 1450, labelY: 792, source: SOURCE.bip32, path: "libngu/ngu/hdnode.c:359–386" }
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

  const guardMarker = svgElement("marker", {
    id: "guard-arrow", markerWidth: 8, markerHeight: 8, refX: 7, refY: 4,
    orient: "auto", markerUnits: "strokeWidth"
  });
  guardMarker.append(svgElement("path", {
    d: "M 0 0 L 8 4 L 0 8 z", fill: "#ff6868"
  }));
  defs.append(guardMarker);
  graph.append(defs);
}

function renderLane(lane) {
  const link = svgElement("a", {
    href: lane.source,
    target: "_blank",
    rel: "noreferrer",
    class: "lane-link",
    tabindex: "0",
    "aria-label": `${lane.label}: open implementation source`
  });
  const title = svgElement("title");
  title.textContent = `${lane.label} · ${lane.path}`;
  link.append(title);
  link.append(svgElement("rect", {
    x: 0, y: lane.bandY, width: 1600, height: lane.bandH,
    class: `lane-band lane-band-${lane.variant}`
  }));
  link.append(svgElement("rect", {
    x: lane.x, y: lane.y, width: lane.w, height: lane.h, rx: 6,
    class: "lane-header"
  }));
  link.append(svgElement("line", {
    x1: lane.lineX, y1: lane.lineY, x2: 1575, y2: lane.lineY,
    class: "lane-divider"
  }));
  const label = svgElement("text", {
    x: lane.x + 12, y: lane.y + 18, class: "lane-label"
  });
  label.textContent = lane.label;
  link.append(label);
  link.addEventListener("pointerenter", () => setSourcePeek("LIFECYCLE", lane.path, lane.source));
  link.addEventListener("focus", () => setSourcePeek("LIFECYCLE", lane.path, lane.source));
  graph.append(link);
}

function renderEdge(edge) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  const start = anchor(from, edge.fromPort);
  const end = anchor(to, edge.toPort);
  const path = edge.route || connector(start, end, edge.fromPort, edge.toPort);
  const link = svgElement("a", {
    href: edge.source,
    target: "_blank",
    rel: "noreferrer",
    class: edge.control ? "edge-link control-link" : "edge-link",
    tabindex: "0",
    "aria-label": `${from.title} to ${to.title}: open implementation source`
  });

  const title = svgElement("title");
  title.textContent = `${from.title} → ${to.title} · ${edge.path}`;
  link.append(title);
  link.append(svgElement("path", { d: path, class: "edge-hit" }));
  link.append(svgElement("path", {
    d: path,
    class: edge.control ? "flow-edge is-control" : "flow-edge",
    "marker-end": edge.control ? "url(#guard-arrow)" : "url(#arrow)"
  }));

  const width = Math.max(48, edge.label.length * 7 + 16);
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
  link.style.setProperty("--expression-size", `${node.expressionSize || 11.2}px`);

  const title = svgElement("title");
  title.textContent = `${node.title} · ${node.path}`;
  link.append(title);
  link.append(svgElement("rect", {
    x: node.x, y: node.y, width: node.w, height: node.h, rx: 12
  }));

  const titleText = svgElement("text", {
    x: node.x + 17, y: node.y + 30, class: "node-title"
  });
  const titleLines = node.titleLines || [node.title];
  titleLines.forEach((line, index) => {
    const span = svgElement("tspan", {
      x: node.x + 17,
      dy: index === 0 ? 0 : 20
    });
    span.textContent = line;
    titleText.append(span);
  });
  link.append(titleText);

  const expression = svgElement("text", {
    x: node.x + 17,
    y: node.y + 51 + (titleLines.length - 1) * 20,
    class: "node-expression"
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
    x: node.x + 17,
    y: node.y + node.h - (node.links ? 39 : 13),
    class: "node-path"
  });
  pathText.textContent = node.path;
  link.append(pathText);

  link.addEventListener("pointerenter", () => setSourcePeek("NODE", node.path, node.source));
  link.addEventListener("focus", () => setSourcePeek("NODE", node.path, node.source));
  graph.append(link);

  if (node.links) renderNodeLinks(node);
}

function renderNodeLinks(node) {
  const gap = 6;
  const totalWidth = node.links.reduce((sum, item) => sum + item.width, 0)
    + gap * (node.links.length - 1);
  let x = node.x + (node.w - totalWidth) / 2;
  const y = node.y + node.h - 27;

  node.links.forEach((item) => {
    const link = svgElement("a", {
      href: item.href,
      target: "_blank",
      rel: "noreferrer",
      class: "node-chip",
      tabindex: "0",
      "aria-label": `${node.title}: open ${item.label}`
    });
    const title = svgElement("title");
    title.textContent = `${node.title} · ${item.path}`;
    link.append(title);
    link.append(svgElement("rect", {
      x, y, width: item.width, height: 18, rx: 5
    }));
    const text = svgElement("text", {
      x: x + item.width / 2,
      y: y + 12.5,
      "text-anchor": "middle"
    });
    text.textContent = item.label;
    link.append(text);
    link.addEventListener("pointerenter", () => setSourcePeek(item.kind, item.path, item.href));
    link.addEventListener("focus", () => setSourcePeek(item.kind, item.path, item.href));
    graph.append(link);
    x += item.width + gap;
  });
}

renderDefinitions();
LANES.forEach(renderLane);
EDGES.forEach(renderEdge);
NODES.forEach(renderNode);

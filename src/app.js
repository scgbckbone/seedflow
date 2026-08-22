const SVG_NS = "http://www.w3.org/2000/svg";

const SOURCE = Object.freeze({
  seedMix: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L792-L837",
  deviceEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L646-L659",
  symbolEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L672-L728",
  mashEntropy: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L730-L790",
  mashTiming: "https://github.com/Coldcard/firmware/blob/master/shared/numpad.py#L61-L87",
  rngHardware: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/rng.c#L105-L167",
  rngSelftest: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/rng.c#L180-L210",
  rngSelftestCall: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/modckcc.c#L282-L288",
  rngBoardHook: "https://github.com/Coldcard/firmware/blob/master/stm32/COLDCARD_MK4/mpconfigboard.h#L83-L84",
  micropythonInit: "https://github.com/Coldcard/micropython/blob/4107246f8a080807b62c3b4838e71e812ea68b6f/ports/stm32/main.c#L395",
  trngBackend: "https://github.com/switck/libngu/blob/master/ngu/random_backend.h#L26-L41",
  randomBytes: "https://github.com/switck/libngu/blob/master/ngu/random.c#L73-L93",
  randomBytesSeedCall: "https://github.com/Coldcard/firmware/blob/master/shared/seed.py#L650",
  randomChecks: "https://github.com/switck/libngu/blob/master/ngu/random.c#L20-L39",
  drbgSeed: "https://github.com/switck/libngu/blob/master/ngu/random.c#L41-L60",
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
  drbgSetup: "https://github.com/switck/libngu/blob/master/ngu/random.c#L62-L71",
  bip39Words: "https://github.com/switck/libngu/blob/master/ngu/bip39.py#L318-L344",
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
    label: "STARTUP TRNG INITIALIZATION",
    x: 15, y: 7, w: 270, h: 26,
    lineX: 285, lineY: 20,
    bandY: 0, bandH: 330, variant: "runtime"
  },
  {
    label: "SEED GENERATION",
    x: 15, y: 317, w: 165, h: 26,
    lineX: 180, lineY: 330,
    bandY: 330, bandH: 570, variant: "generation"
  }
];

const NODES = [
  {
    id: "trngGate", x: 25, y: 40, w: 400, h: 190,
    title: "STM32 TRNG self-test",
    expression: [
      "Requires eight successful STM32 TRNG reads;",
      "all are discarded.",
      "Without working TRNG access,",
      "COLDCARD cannot start."
    ],
    expressionSize: 9.8,
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
        label: "MPY INIT", width: 66, href: SOURCE.micropythonInit,
        kind: "SOURCE", path: "Coldcard/micropython · main.c:395"
      }
    ]
  },
  {
    id: "mcuRandom", x: 25, y: 400, w: 300, h: 145,
    title: "mcu_random[32]",
    expression: [
      "32-byte Hash_DRBG output XOR fresh",
      "32-byte STM32 TRNG output",
      "A failed, zero or repeated TRNG word",
      "aborts generation"
    ],
    expressionSize: 10.1,
    path: "libngu/ngu/random.c:73–93",
    tone: "process", source: SOURCE.randomBytes,
    links: [
      {
        label: "SEED CALL", width: 60, href: SOURCE.randomBytesSeedCall,
        kind: "SOURCE", path: "firmware/shared/seed.py:650"
      },
      {
        label: "RNG_GET IMPL", width: 72, href: SOURCE.rngHardware,
        kind: "SOURCE", path: "firmware/rng.c:105–167"
      },
      {
        label: "TRNG ADAPTER", width: 74, href: SOURCE.trngBackend,
        kind: "SOURCE", path: "libngu/ngu/random_backend.h:26–41"
      },
      {
        label: "TRNG CHECKS", width: 68, href: SOURCE.randomChecks,
        kind: "SOURCE", path: "libngu/ngu/random.c:20–39"
      }
    ]
  },
  {
    id: "se1", x: 25, y: 560, w: 270, h: 110,
    title: "Secure Element 1",
    expression: ["32 bytes of fresh entropy for", "master-seed generation"],
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
    id: "se2", x: 25, y: 685, w: 270, h: 110,
    title: "Secure Element 2",
    expression: ["8 bytes of fresh entropy for", "master-seed generation"],
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
    id: "runtimeReseed", x: 800, y: 90, w: 365, h: 145,
    title: "SE entropy → Hash_DRBG reseed",
    expression: "Hash_DRBG.Reseed(SHA256d(SE1[32] || SE2[8]))",
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
      },
      {
        label: "DRBG_SETUP", width: 82, href: SOURCE.drbgSetup,
        kind: "SOURCE", path: "libngu/ngu/random.c:62–71"
      },
      {
        label: "DRBG SEED", width: 76, href: SOURCE.drbgSeed,
        kind: "SOURCE", path: "libngu/ngu/random.c:41–60"
      }
    ]
  },
  {
    id: "se1Reseed", x: 475, y: 40, w: 270, h: 110,
    title: "Secure Element 1",
    expression: "32 bytes of startup entropy",
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
    id: "se2Reseed", x: 475, y: 175, w: 270, h: 110,
    title: "Secure Element 2",
    expression: "8 bytes of startup entropy",
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
    id: "device", x: 500, y: 380, w: 280, h: 100,
    title: "device_entropy[32]",
    expression: [
      "SHA256d(mcu_random[32] ||",
      "         SE1[32] ||",
      "         SE2[8])"
    ],
    path: "firmware/shared/seed.py:646–659",
    tone: "process", source: SOURCE.deviceEntropy
  },
  {
    id: "mash", x: 500, y: 500, w: 280, h: 190,
    title: "Mash Keys",
    expression: [
      "≥65 presses; raw timing before debounce",
      "CPU-cycle intervals (~8.33 ns)",
      "event = LE32(index) ||",
      "        LE32(cycle gap) || key byte",
      "digest[32] = SHA256(b'CC\\x01' ||",
      "                    METHOD_MASH ||",
      "                    event...)",
      "Only cycle gaps receive entropy credit"
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
    id: "symbols", x: 500, y: 710, w: 280, h: 165,
    title: "Dice Rolls / Coin Flips",
    expression: [
      "≥50 die rolls or ≥128 coin flips",
      "method = METHOD_DICE or METHOD_COIN",
      "digest[32] = SHA256(b'CC\\x01' ||",
      "                    method ||",
      "                    ASCII results...)",
      "Reject face >30% or side >65%"
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
    id: "mix", x: 900, y: 535, w: 320, h: 145,
    title: "seed_entropy[32]",
    expression: [
      "SHA256d(b'CC\\x01S' ||",
      "        purpose ||",
      "        selected method ||",
      "        device_entropy[32] ||",
      "        selected digest[32])"
    ],
    expressionSize: 10.1,
    path: "firmware/shared/seed.py:792–837",
    tone: "result", source: SOURCE.seedMix
  },
  {
    id: "words", x: 1250, y: 560, w: 250, h: 90,
    title: "BIP39 mnemonic",
    expression: "16 B → 12 words · 32 B → 24 words",
    path: "libngu/ngu/bip39.py:318–344",
    tone: "result", source: SOURCE.bip39Words
  }
];

const EDGES = [
  { from: "se1Reseed", to: "runtimeReseed", fromPort: "right", toPort: "left" },
  { from: "se2Reseed", to: "runtimeReseed", fromPort: "right", toPort: "left" },
  { from: "runtimeReseed", to: "mcuRandom", fromPort: "bottom", toPort: "top", route: "M 982.5 235 V 305 H 470 V 380 H 175 V 400" },
  { from: "mcuRandom", to: "device", fromPort: "right", toPort: "left", route: "M 325 472.5 C 400 472.5 425 405 500 405" },
  { from: "se1", to: "device", fromPort: "right", toPort: "left", route: "M 295 615 C 390 615 405 430 500 430" },
  { from: "se2", to: "device", fromPort: "right", toPort: "left", route: "M 295 740 C 390 740 405 455 500 455" },
  { from: "device", to: "mix", fromPort: "right", toPort: "top", route: "M 780 430 H 1040 Q 1060 430 1060 450 V 535" },
  { from: "mash", to: "mix", fromPort: "right", toPort: "left", route: "M 780 595 H 900" },
  { from: "symbols", to: "mix", fromPort: "right", toPort: "bottom", route: "M 780 792.5 H 1040 Q 1060 792.5 1060 772.5 V 680" },
  { from: "mix", to: "words", fromPort: "right", toPort: "left", route: "M 1220 607.5 H 1250" }
];

const graph = document.querySelector("#seed-graph");
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

function renderLane(lane) {
  const group = svgElement("g", { class: "lane-heading" });
  group.append(svgElement("rect", {
    x: 0, y: lane.bandY, width: 1600, height: lane.bandH,
    class: `lane-band lane-band-${lane.variant}`
  }));
  group.append(svgElement("rect", {
    x: lane.x, y: lane.y, width: lane.w, height: lane.h, rx: 6,
    class: "lane-header"
  }));
  group.append(svgElement("line", {
    x1: lane.lineX, y1: lane.lineY, x2: 1575, y2: lane.lineY,
    class: "lane-divider"
  }));
  const label = svgElement("text", {
    x: lane.x + 12, y: lane.y + 18, class: "lane-label"
  });
  label.textContent = lane.label;
  group.append(label);
  graph.append(group);
}

function renderEdge(edge) {
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  const start = anchor(from, edge.fromPort);
  const end = anchor(to, edge.toPort);
  const path = edge.route || connector(start, end, edge.fromPort, edge.toPort);
  const group = svgElement("g", { class: "edge-group", "aria-hidden": "true" });
  group.append(svgElement("path", {
    d: path,
    class: "flow-edge",
    "marker-end": "url(#arrow)"
  }));
  graph.append(group);
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
    const indent = line.match(/^ */)[0].length;
    const span = svgElement("tspan", {
      x: node.x + 17 + indent * 6,
      dy: index === 0 ? 0 : 14
    });
    span.textContent = line.trimStart();
    expression.append(span);
  });
  link.append(expression);

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
    graph.append(link);
    x += item.width + gap;
  });
}

renderDefinitions();
LANES.forEach(renderLane);
EDGES.forEach(renderEdge);
NODES.forEach(renderNode);

"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { chromium } = require("playwright");
const { WebSocketServer } = require("ws");

const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, "overlays.json");
const CLIENT_PATH = path.join(ROOT, "client.html");

let config = loadConfig();
let browser = null;
let runtimes = new Map();
let shuttingDown = false;

function loadConfig() {
  const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  parsed.canvas = parsed.canvas || {};
  parsed.canvas.width = Number(parsed.canvas.width) || 800;
  parsed.canvas.height = Number(parsed.canvas.height) || 600;
  parsed.canvas.fps = Math.min(30, Math.max(4, Number(parsed.canvas.fps) || 15));
  parsed.port = Number(parsed.port) || 8791;
  parsed.overlays = Array.isArray(parsed.overlays) ? parsed.overlays : [];
  return parsed;
}

function json(res, code, payload) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);

  if (url.pathname === "/" || url.pathname === "/overlay") {
    const html = fs.readFileSync(CLIENT_PATH, "utf8");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(html);
    return;
  }

  if (url.pathname === "/health") {
    json(res, 200, {
      ok: true,
      service: "nihilguh-overlay-compositor",
      overlays: [...runtimes.values()].map((runtime) => ({
        id: runtime.item.id,
        label: runtime.item.label,
        url: runtime.item.url,
        ready: runtime.ready,
        lastError: runtime.lastError || null
      }))
    });
    return;
  }

  if (url.pathname === "/config") {
    json(res, 200, publicConfig());
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

const wss = new WebSocketServer({ server, path: "/ws" });

function publicConfig() {
  return {
    type: "hello",
    canvas: config.canvas,
    overlays: config.overlays
      .filter((item) => item && item.enabled !== false && item.url)
      .map((item, index) => ({
        id: String(item.id || `overlay-${index + 1}`),
        label: item.label || item.id || `Overlay ${index + 1}`,
        zIndex: Number(item.zIndex) || index + 1
      }))
  };
}

function send(ws, payload) {
  if (!ws || ws.readyState !== 1) return;
  try { ws.send(JSON.stringify(payload)); } catch (_) {}
}

function broadcast(payload) {
  const body = JSON.stringify(payload);
  for (const ws of wss.clients) {
    if (ws.readyState !== 1) continue;
    try { ws.send(body); } catch (_) {}
  }
}

wss.on("connection", (ws) => {
  send(ws, publicConfig());

  for (const runtime of runtimes.values()) {
    if (!runtime.lastFrame) continue;
    send(ws, {
      type: "frame",
      id: runtime.item.id,
      zIndex: runtime.zIndex,
      data: runtime.lastFrame
    });
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hash(buffer) {
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

async function forceTransparency(page) {
  try {
    await page.addStyleTag({
      content: `
        html, body {
          background: transparent !important;
          background-color: rgba(0,0,0,0) !important;
        }
        ::-webkit-scrollbar { display: none !important; }
      `
    });
  } catch (_) {}
}

function mediaInitScript() {
  (() => {
    const ids = new WeakMap();
    let seq = 0;

    function getId(el) {
      if (!ids.has(el)) ids.set(el, `media-${++seq}`);
      return ids.get(el);
    }

    function snapshot(el) {
      return {
        mediaId: getId(el),
        kind: String(el.tagName || "audio").toLowerCase(),
        src: el.currentSrc || el.src || "",
        volume: Number.isFinite(el.volume) ? el.volume : 1,
        muted: Boolean(el.muted),
        loop: Boolean(el.loop),
        currentTime: Number.isFinite(el.currentTime) ? el.currentTime : 0
      };
    }

    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const el = this;
      setTimeout(() => {
        if (typeof window.__overlayHubMediaPlay === "function") {
          window.__overlayHubMediaPlay(snapshot(el)).catch(() => {});
        }
      }, 30);
      return originalPlay.apply(this, args);
    };

    const originalPause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.pause = function (...args) {
      if (typeof window.__overlayHubMediaStop === "function") {
        window.__overlayHubMediaStop({ mediaId: getId(this) }).catch(() => {});
      }
      return originalPause.apply(this, args);
    };
  })();
}

async function createRuntime(item, index) {
  const id = String(item.id || `overlay-${index + 1}`);
  const zIndex = Number(item.zIndex) || index + 1;
  const context = await browser.newContext({
    viewport: {
      width: config.canvas.width,
      height: config.canvas.height
    },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();
  const runtime = {
    item: { ...item, id },
    zIndex,
    context,
    page,
    stopped: false,
    ready: false,
    lastHash: "",
    lastFrame: "",
    lastError: ""
  };

  runtimes.set(id, runtime);

  await page.exposeFunction("__overlayHubMediaPlay", (info) => {
    if (!info || !info.src) return;
    broadcast({
      type: "media-play",
      overlayId: id,
      mediaId: `${id}:${info.mediaId}`,
      kind: info.kind,
      src: info.src,
      volume: info.volume,
      muted: info.muted,
      loop: info.loop,
      currentTime: info.currentTime
    });
  });

  await page.exposeFunction("__overlayHubMediaStop", (info) => {
    if (!info || !info.mediaId) return;
    broadcast({
      type: "media-stop",
      mediaId: `${id}:${info.mediaId}`
    });
  });

  await page.addInitScript(mediaInitScript);

  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
      color: { r: 0, g: 0, b: 0, a: 0 }
    });
  } catch (_) {}

  page.on("console", (msg) => {
    if (String(item.debug || "").toLowerCase() === "true") {
      console.log(`[${id}] console:`, msg.text());
    }
  });

  page.on("pageerror", (error) => {
    runtime.lastError = String(error && error.message ? error.message : error);
    console.warn(`[${id}] page error: ${runtime.lastError}`);
  });

  page.on("framenavigated", async (frame) => {
    if (frame !== page.mainFrame()) return;
    await sleep(120);
    await forceTransparency(page);
  });

  console.log(`[${id}] abrindo ${item.url}`);
  try {
    await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await forceTransparency(page);
    runtime.ready = true;
    runtime.lastError = "";
    console.log(`[${id}] pronto`);
  } catch (error) {
    runtime.lastError = String(error && error.message ? error.message : error);
    console.warn(`[${id}] falha ao carregar: ${runtime.lastError}`);
  }

  captureLoop(runtime).catch((error) => {
    runtime.lastError = String(error && error.message ? error.message : error);
    console.warn(`[${id}] captura encerrada: ${runtime.lastError}`);
  });

  return runtime;
}

async function captureLoop(runtime) {
  const interval = Math.round(1000 / config.canvas.fps);

  while (!runtime.stopped && !shuttingDown) {
    const started = Date.now();

    try {
      const png = await runtime.page.screenshot({
        type: "png",
        omitBackground: true,
        animations: "allow",
        caret: "hide",
        scale: "css"
      });

      const currentHash = hash(png);
      if (currentHash !== runtime.lastHash) {
        runtime.lastHash = currentHash;
        runtime.lastFrame = `data:image/png;base64,${png.toString("base64")}`;
        broadcast({
          type: "frame",
          id: runtime.item.id,
          zIndex: runtime.zIndex,
          data: runtime.lastFrame
        });
      }
    } catch (error) {
      runtime.lastError = String(error && error.message ? error.message : error);
    }

    const elapsed = Date.now() - started;
    await sleep(Math.max(1, interval - elapsed));
  }
}

async function closeRuntimes() {
  const list = [...runtimes.values()];
  runtimes = new Map();
  for (const runtime of list) {
    runtime.stopped = true;
    try { await runtime.context.close(); } catch (_) {}
  }
}

async function reload() {
  console.log("Recarregando overlays.json...");
  try {
    const next = loadConfig();
    config = next;
    await closeRuntimes();
    const enabled = config.overlays.filter((item) => item && item.enabled !== false && item.url);
    for (let i = 0; i < enabled.length; i += 1) {
      await createRuntime(enabled[i], i);
    }
    broadcast(publicConfig());
  } catch (error) {
    console.error("Falha ao recarregar configuracao:", error);
  }
}

async function main() {
  browser = await chromium.launch({
    headless: true,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows"
    ]
  });

  const enabled = config.overlays.filter((item) => item && item.enabled !== false && item.url);
  for (let i = 0; i < enabled.length; i += 1) {
    await createRuntime(enabled[i], i);
  }

  server.listen(config.port, "127.0.0.1", () => {
    console.log("");
    console.log(`Overlay compositor: http://127.0.0.1:${config.port}/`);
    console.log(`WebSocket: ws://127.0.0.1:${config.port}/ws`);
    console.log(`Canvas: ${config.canvas.width}x${config.canvas.height} @ ${config.canvas.fps}fps`);
    console.log("");
  });

  let debounce = null;
  fs.watch(CONFIG_PATH, () => {
    clearTimeout(debounce);
    debounce = setTimeout(reload, 350);
  });
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Encerrando compositor...");
  try { server.close(); } catch (_) {}
  await closeRuntimes();
  try { if (browser) await browser.close(); } catch (_) {}
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

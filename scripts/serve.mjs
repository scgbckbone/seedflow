import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4173", 10);
const types = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    let target = path.resolve(root, relative || "index.html");

    if (!target.startsWith(`${root}${path.sep}`) && target !== root) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
      await access(target);
    } catch {
      target = path.join(root, "index.html");
    }

    response.writeHead(200, {
      "Content-Type": types.get(path.extname(target)) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(target).pipe(response);
  } catch (error) {
    response.writeHead(500).end("Server error");
    console.error(error);
  }
});

server.listen(port, host, () => {
  console.log(`Seedflow is available at http://${host}:${port}`);
});


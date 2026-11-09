#!/usr/bin/env node
/**
 * Zero-dependency production static preview server for Next.js `output: 'export'`.
 * Serves `./out` on http://localhost:3000 (or PORT env var) with security headers.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "out");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";

if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) {
  console.error(
    "[serve-static] Static export directory `./out` not found. Run `npm run build` first."
  );
  process.exit(1);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
};

function resolveStaticPath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const normalized = path.normalize(safePath).replace(/^(\.\.(\/|\\|$))+/, "");
  let candidate = path.join(OUT_DIR, normalized);

  if (!candidate.startsWith(OUT_DIR)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    candidate = path.join(candidate, "index.html");
  } else if (!fs.existsSync(candidate) && fs.existsSync(`${candidate}.html`)) {
    candidate = `${candidate}.html`;
  }

  return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate
    : null;
}

const server = http.createServer((req, res) => {
  const filePath = resolveStaticPath(req.url || "/");

  if (!filePath) {
    const notFoundPage = path.join(OUT_DIR, "404.html");
    res.writeHead(404, {
      ...SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    });
    if (fs.existsSync(notFoundPage)) {
      res.end(fs.readFileSync(notFoundPage));
    } else {
      res.end("404 Not Found");
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const isImmutable = filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`);

  res.writeHead(200, {
    ...SECURITY_HEADERS,
    "Content-Type": contentType,
    "Cache-Control": isImmutable
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`\n  AFOGRADE Static Export Server running at http://${HOST}:${PORT}`);
  console.log(`  Serving directory: ${OUT_DIR}`);
  console.log("  Press Ctrl+C to stop.\n");
});


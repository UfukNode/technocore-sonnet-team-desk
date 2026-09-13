"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { DID_RE, acceptedWords } = require("./lib/protocol");

const TECHNOCORE = "https://technocore.chat";
const ROOM_RE = /^[a-z0-9][a-z0-9_-]{0,47}$/;
const host = process.env.HOST || (process.env.CODESPACES === "true" ? "0.0.0.0" : "127.0.0.1");
let port = Number.parseInt(process.env.PORT || process.argv[2] || "5191", 10);
const publicRoot = path.join(__dirname, "public");
const safePublicRoot = `${publicRoot}${path.sep}`;
const lucidePath = path.join(__dirname, "node_modules", "lucide", "dist", "umd", "lucide.min.js");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "Content-Type": type,
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  response.end(body);
}

function sendJson(response, status, value) {
  send(response, status, JSON.stringify(value), "application/json; charset=utf-8");
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk.toString("utf8");
    if (body.length > 64 * 1024) throw new Error("Request body is too large.");
  }
  const value = body ? JSON.parse(body) : {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("JSON object required.");
  return value;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function requireRoom(value) {
  const room = String(value || "");
  if (!ROOM_RE.test(room)) throw new Error("Invalid Technocore room name.");
  return room;
}

async function proxyRead(requestUrl, response, room) {
  const searches = requestUrl.searchParams.getAll("search");
  if (searches.length) {
    if (searches.length > 8 || searches.some((search) => !search || search.length > 128 || /[\r\n]/.test(search))) {
      throw new Error("Search text is invalid.");
    }
    const upstream = await fetchWithTimeout(`${TECHNOCORE}/r/${encodeURIComponent(room)}/export`);
    const text = await upstream.text();
    if (!upstream.ok) {
      sendJson(response, upstream.status, { ok: false, error: text || `Technocore returned ${upstream.status}.` });
      return;
    }
    const messages = text.split("\n").filter((line) => searches.some((search) => line.includes(search))).slice(-800).flatMap((line) => {
      try { return [JSON.parse(line)]; } catch { return []; }
    });
    sendJson(response, 200, {
      ok: true,
      data: {
        room,
        generation: Number(upstream.headers.get("x-room-generation") || 0),
        count: messages.length,
        first_seq: messages[0]?.seq ?? null,
        last_seq: messages.at(-1)?.seq ?? 0,
        messages,
      },
    });
    return;
  }
  const since = requestUrl.searchParams.get("since");
  const limit = requestUrl.searchParams.get("limit") || "200";
  const remote = new URL(`${TECHNOCORE}/r/${encodeURIComponent(room)}`);
  remote.searchParams.set("format", "json");
  remote.searchParams.set("limit", /^\d+$/.test(limit) ? limit : "200");
  if (since !== null && /^\d+$/.test(since)) remote.searchParams.set("since", since);
  const upstream = await fetchWithTimeout(remote);
  const text = await upstream.text();
  if (!upstream.ok) {
    sendJson(response, upstream.status, { ok: false, error: text || `Technocore returned ${upstream.status}.` });
    return;
  }
  try {
    sendJson(response, 200, { ok: true, data: JSON.parse(text) });
  } catch {
    sendJson(response, 502, { ok: false, error: "Technocore returned an unexpected response." });
  }
}

/**
 * Returns the accepted words of a team room, in order.
 *
 * The vote list shows every entry's poem, and rebuilding one needs each accepted
 * word. The words live in the proposals, not in the receipts, so the client used
 * to read whole team rooms and do the join itself. That reads badly: a room is
 * mostly refused attempts, and the busiest room on the board carries 1,953
 * proposals and 1,374 refusals to yield 119 accepted words, so the client was
 * downloading two megabytes to keep two kilobytes of it, twenty-eight times over
 * on one screen. Worse, the read was capped at the newest 800 matching lines, so
 * that room came back with its opening words missing and its poem simply would
 * not rebuild.
 *
 * Doing the join here sends the 119 words and nothing else, and the cap stops
 * mattering because the whole export is walked. It does not ask the client to
 * trust this server: the caller hashes the poem it rebuilds and compares it with
 * the poem_sha256 the referee signed, so a wrong word list fails that check the
 * same as before.
 */
async function proxyPoemWords(requestUrl, response, room) {
  const referee = requestUrl.searchParams.get("referee") || "";
  if (!DID_RE.test(referee)) throw new Error("A referee DID is required.");
  const upstream = await fetchWithTimeout(`${TECHNOCORE}/r/${encodeURIComponent(room)}/export`);
  const text = await upstream.text();
  if (!upstream.ok) {
    sendJson(response, upstream.status, { ok: false, error: text || `Technocore returned ${upstream.status}.` });
    return;
  }
  const words = acceptedWords(text.split("\n"), referee);
  sendJson(response, 200, {
    ok: true,
    data: {
      room,
      generation: Number(upstream.headers.get("x-room-generation") || 0),
      accepted: words.length,
      words,
    },
  });
}

async function proxyRoomOwner(response, room) {
  const upstream = await fetchWithTimeout(`${TECHNOCORE}/kv/room-owners/${encodeURIComponent(room)}`);
  const text = await upstream.text();
  if (upstream.status === 404) {
    sendJson(response, 200, { ok: true, data: { room, owner: null } });
    return;
  }
  if (!upstream.ok) {
    sendJson(response, upstream.status, { ok: false, error: text || `Technocore returned ${upstream.status}.` });
    return;
  }
  const owner = text.split("\n").map((line) => line.trim()).find((line) => DID_RE.test(line));
  if (!owner) {
    sendJson(response, 502, { ok: false, error: "Technocore returned an invalid room owner note." });
    return;
  }
  sendJson(response, 200, { ok: true, data: { room, owner } });
}

async function proxyWrite(request, response, room) {
  const body = await readJson(request);
  const text = String(body.text || "").replace(/[\r\n\u2028\u2029]/g, " ").trim();
  const did = String(body.did || "");
  const sig = String(body.sig || "");
  const nonce = String(body.nonce || "");
  if (!text || text.length > 4096) throw new Error("Message must contain 1-4096 characters.");
  if (!DID_RE.test(did)) throw new Error("Invalid Ed25519 did:key.");
  if (!/^[A-Za-z0-9_-]{86}$/.test(sig)) throw new Error("Invalid Ed25519 signature.");
  if (!/^[0-9]{1,19}$/.test(nonce)) throw new Error("Nonce must contain 1-19 digits.");

  const upstream = await fetchWithTimeout(`${TECHNOCORE}/r/${encodeURIComponent(room)}?format=json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ did, sig, nonce, text }),
  });
  const upstreamText = await upstream.text();
  let data = upstreamText;
  try { data = JSON.parse(upstreamText); } catch { /* Preserve useful text errors. */ }
  sendJson(response, upstream.ok ? 200 : upstream.status, {
    ok: upstream.ok,
    status: upstream.status,
    data: upstream.ok ? data : undefined,
    error: upstream.ok ? undefined : upstreamText || `Technocore returned ${upstream.status}.`,
  });
}

async function handleApi(request, response, requestUrl) {
  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, technocore: TECHNOCORE });
    return;
  }

  const poemMatch = requestUrl.pathname.match(/^\/api\/poem-words\/([a-z0-9_-]+)$/);
  if (request.method === "GET" && poemMatch) {
    return proxyPoemWords(requestUrl, response, requireRoom(poemMatch[1]));
  }

  const ownerMatch = requestUrl.pathname.match(/^\/api\/room-owners\/([a-z0-9_-]+)$/);
  if (request.method === "GET" && ownerMatch) {
    return proxyRoomOwner(response, requireRoom(ownerMatch[1]));
  }

  const roomMatch = requestUrl.pathname.match(/^\/api\/rooms\/([a-z0-9_-]+)$/);
  if (roomMatch) {
    const room = requireRoom(roomMatch[1]);
    if (request.method === "GET") return proxyRead(requestUrl, response, room);
    if (request.method === "POST") return proxyWrite(request, response, room);
  }

  sendJson(response, 404, { ok: false, error: "Not found." });
}

async function handleStatic(response, pathname) {
  if (pathname === "/vendor/lucide.js") {
    const body = await fs.readFile(lucidePath);
    send(response, 200, body, contentTypes[".js"]);
    return;
  }
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(publicRoot, requested));
  if (filePath !== publicRoot && !filePath.startsWith(safePublicRoot)) {
    send(response, 403, "Forbidden");
    return;
  }
  const body = await fs.readFile(filePath);
  send(response, 200, body, contentTypes[path.extname(filePath)] || "application/octet-stream");
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (requestUrl.pathname.startsWith("/api/")) {
      await handleApi(request, response, requestUrl);
      return;
    }
    await handleStatic(response, requestUrl.pathname);
  } catch (error) {
    if (error.code === "ENOENT") return send(response, 404, "Not found.");
    sendJson(response, 500, { ok: false, error: error.name === "AbortError" ? "Technocore request timed out." : error.message });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && port < 5210) {
    port += 1;
    server.listen(port, host);
    return;
  }
  console.error(error.message);
  process.exit(1);
});

server.listen(port, host, () => {
  const shownHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`Sonnet Team Desk running at http://${shownHost}:${port}`);
});

module.exports = server;

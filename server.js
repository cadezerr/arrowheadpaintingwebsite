// Arrowhead Painting website server (GoDaddy Node.js Hosting)
// Uses only Node's built-in modules, so there's nothing to install.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("./src/server/email");

const port = process.env.PORT || 3000;
const dist = path.join(__dirname, "dist");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// Old WordPress addresses -> new pages, so existing links and Google results keep working
const redirects = { "/our-services": "/services/", "/about": "/who-we-are/", "/contact-us": "/contact/" };

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}
function json(res, status, obj) {
  send(res, status, JSON.stringify(obj), { "content-type": types[".json"] });
}

function serveFile(res, file, status = 200) {
  fs.readFile(file, (err, data) => {
    if (err) return notFound(res);
    const ext = path.extname(file);
    send(res, status, data, {
      "content-type": types[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
  });
}
function notFound(res) {
  fs.readFile(path.join(dist, "404.html"), (err, data) => {
    send(res, 404, err ? "Not found" : data, { "content-type": types[".html"] });
  });
}

function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return notFound(res); }
  const target = path.normalize(path.join(dist, rel));
  if (!target.startsWith(dist)) return notFound(res);

  fs.stat(target, (err, st) => {
    if (!err && st.isFile()) return serveFile(res, target);
    if (!err && st.isDirectory()) {
      if (!pathname.endsWith("/")) return send(res, 301, "", { location: pathname + "/" });
      return serveFile(res, path.join(target, "index.html"));
    }
    // /services -> /services/
    fs.stat(path.join(target, "index.html"), (e2, st2) => {
      if (!e2 && st2.isFile()) return send(res, 301, "", { location: pathname + "/" });
      notFound(res);
    });
  });
}

// ---- Quote request form ----
// Set CONTACT_FORM_RECIPIENT_EMAIL in the GoDaddy Node.js Hosting settings (Secrets).
const recent = new Map(); // simple per-IP rate limit: 5 requests / 10 minutes
const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

function readJson(req, limit = 20_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

async function handleContact(req, res) {
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (hits.length >= 5) {
    return json(res, 429, { error: "Too many requests. Please call (913) 472-8077 instead." });
  }
  hits.push(now);
  recent.set(ip, hits);

  let b;
  try { b = await readJson(req); } catch { return json(res, 400, { error: "Please fill in every required field." }); }
  if (b.website) return json(res, 200, { success: true }); // spam bot filled the hidden field

  const firstName = clean(b.firstName, 80);
  const lastName = clean(b.lastName, 80);
  const email = clean(b.email, 200);
  const phone = clean(b.phone, 40);
  const projectType = clean(b.projectType, 60);
  const city = clean(b.city, 80);
  const message = String(b.message ?? "").trim().slice(0, 5000);

  if (!firstName || !lastName || !email || !phone || !projectType || !message) {
    return json(res, 400, { error: "Please fill in every required field." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: "Please enter a valid email address." });
  }

  const recipient = process.env.CONTACT_FORM_RECIPIENT_EMAIL;
  if (!recipient) {
    console.error("email.contact_form.recipient_unset");
    return json(res, 500, { error: "Your request didn't go through. Please call (913) 472-8077." });
  }

  try {
    await sendEmail({
      to: recipient,
      replyTo: email,
      subject: `Quote request: ${projectType} – ${firstName} ${lastName}`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Project: ${projectType}`,
        `City: ${city || "(not given)"}`,
        "",
        message,
      ].join("\n"),
    });
    json(res, 200, { success: true });
  } catch (err) {
    console.error("email.send.failed", err);
    json(res, 500, { error: "Your request didn't go through. Please call (913) 472-8077 or try again." });
  }
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (pathname === "/api/contact") {
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    return handleContact(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");

  const trimmed = pathname.replace(/\/+$/, "");
  if (redirects[trimmed]) return send(res, 301, "", { location: redirects[trimmed] });

  serveStatic(req, res, pathname);
});

server.listen(port, () => console.log(`Arrowhead Painting site listening on ${port}`));

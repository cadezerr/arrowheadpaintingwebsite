// Arrowhead Painting website server (GoDaddy Node.js Hosting)
// Uses only Node's built-in modules, so there's nothing to install.
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
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
  ".woff": "font/woff",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

// Old WordPress addresses -> new pages, so existing links and Google results keep working
const redirects = {
  "/our-services": "/services/",
  "/who-we-are": "/about/",
  "/contact-us": "/contact/",
  "/free-estimate": "/contact/",
  "/guides": "/blog/",
  "/equipment": "/about/",
  "/gallery": "/our-work/",
  "/warranty": "/process-warranty/",
  "/service-areas/mission-roeland-park": "/service-areas/mission/",
  "/service-areas/blue-springs-belton": "/service-areas/blue-springs/",
  "/service-areas/northland": "/service-areas/north-kansas-city/",
  "/service-areas/kansas-city-mo": "/service-areas/kansas-city/",
  "/locations": "/service-areas/",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}
function json(res, status, obj) {
  send(res, status, JSON.stringify(obj), { "content-type": types[".json"] });
}

const compressible = new Set([".html", ".css", ".js", ".json", ".xml", ".txt", ".svg"]);

function serveFile(req, res, file, status = 200) {
  fs.readFile(file, (err, data) => {
    if (err) return notFound(req, res);
    const ext = path.extname(file);
    const headers = {
      "content-type": types[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : /\.(webp|png|jpg|woff2?|mp4|webm)$/.test(ext) ? "public, max-age=2592000" : "public, max-age=3600",
      "x-content-type-options": "nosniff",
      vary: "Accept-Encoding",
    };
    headers["accept-ranges"] = "bytes";
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range && !compressible.has(ext)) {
      const size = data.length;
      let start = range[1] ? parseInt(range[1], 10) : size - parseInt(range[2], 10);
      let end = range[1] && range[2] ? parseInt(range[2], 10) : size - 1;
      if (isNaN(start) || start < 0 || start >= size || end < start) {
        return send(res, 416, "", { "content-range": `bytes */${size}` });
      }
      end = Math.min(end, size - 1);
      headers["content-range"] = `bytes ${start}-${end}/${size}`;
      return send(res, 206, data.subarray(start, end + 1), headers);
    }
    if (compressible.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      headers["content-encoding"] = "gzip";
      return send(res, status, zlib.gzipSync(data), headers);
    }
    send(res, status, data, headers);
  });
}
function notFound(req, res) {
  if (fs.existsSync(path.join(dist, "404.html"))) return serveFile(req, res, path.join(dist, "404.html"), 404);
  send(res, 404, "Not found", { "content-type": types[".txt"] });
}

function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return notFound(req, res); }
  const target = path.normalize(path.join(dist, rel));
  if (!target.startsWith(dist)) return notFound(req, res);

  fs.stat(target, (err, st) => {
    if (!err && st.isFile()) return serveFile(req, res, target);
    if (!err && st.isDirectory()) {
      if (!pathname.endsWith("/")) return send(res, 301, "", { location: pathname + "/" });
      return serveFile(req, res, path.join(target, "index.html"));
    }
    // /services -> /services/
    fs.stat(path.join(target, "index.html"), (e2, st2) => {
      if (!e2 && st2.isFile()) return send(res, 301, "", { location: pathname + "/" });
      notFound(req, res);
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
  const service = clean(b.service, 80);
  const zip = clean(b.zip, 10);
  const timeframe = clean(b.timeframe, 60);
  const page = clean(b.page, 200);
  const message = String(b.message ?? "").trim().slice(0, 5000);

  if (!firstName || !lastName || !email || !phone || !service || !zip || !timeframe) {
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
      subject: `Estimate request: ${service} – ${firstName} ${lastName} (${zip})`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Service: ${service}`,
        `ZIP: ${zip}`,
        `Timeframe: ${timeframe || "(not given)"}`,
        `Sent from: ${page || "/"}`,
        "",
        message || "(no details given)",
      ].join("\n"),
    });
    json(res, 200, { success: true });
  } catch (err) {
    console.error("email.send.failed", err);
    json(res, 500, { error: "Your request didn't go through. Please call (913) 472-8077 or try again." });
  }
}

const CANONICAL_HOST = "arrowheadpaintingkc.com";
const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  const proto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  // Enforce HTTPS and the bare domain (only on the real domain, so preview URLs keep working)
  if (host === CANONICAL_HOST || host === "www." + CANONICAL_HOST) {
    if (proto === "http" || host !== CANONICAL_HOST) {
      return send(res, 301, "", { location: `https://${CANONICAL_HOST}${req.url}` });
    }
    res.setHeader("strict-transport-security", "max-age=31536000");
  }
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "strict-origin-when-cross-origin");

  // Google Search Console HTML-file verification (set GOOGLE_VERIFICATION_FILE=googleXXXX.html)
  const gvf = process.env.GOOGLE_VERIFICATION_FILE;
  if (gvf && pathname === "/" + gvf) return send(res, 200, `google-site-verification: ${gvf}`, { "content-type": "text/html; charset=utf-8" });

  if (pathname === "/api/contact") {
    if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
    return handleContact(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");

  const trimmed = pathname.replace(/\/+$/, "");
  if (redirects[trimmed]) return send(res, 301, "", { location: redirects[trimmed] });
  // Old WordPress pages, posts, and categories
  if (/^\/(sitemap_index|page-sitemap|post-sitemap|category-sitemap)\.xml$/.test(trimmed)) return send(res, 301, "", { location: "/sitemap.xml" });
  if (["/test", "/home-2"].includes(trimmed)) return send(res, 301, "", { location: "/" });
  if (["/blog-2", "/feed"].includes(trimmed) || /^\/(construction|category|guides|equipment|tag|author)\//.test(pathname)) return send(res, 301, "", { location: "/blog/" });

  serveStatic(req, res, pathname);
});

server.listen(port, () => console.log(`Arrowhead Painting site listening on ${port}`));

// Builds the site: combines each page in src/pages with the shared
// header, footer, and call band, and writes the result to dist/.
// Runs automatically on GoDaddy via `npm run build`.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

const read = (p) => fs.readFileSync(path.join(src, p), "utf8");
const header = read("partials/header.html");
const footer = read("partials/footer.html");
const callBand = read("partials/call-band.html");

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(path.join(src, "assets"), path.join(dist, "assets"), { recursive: true });

const pages = fs.readdirSync(path.join(src, "pages")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  let body = read(path.join("pages", file));
  const m = body.match(/^<!--meta\s+(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`${file} is missing its <!--meta {...} --> line`);
  const meta = JSON.parse(m[1]);
  body = body.slice(m[0].length).replace("<!--#call-band-->", callBand);

  let head = header
    .replace(/\{\{title\}\}/g, escapeAttr(meta.title))
    .replace(/\{\{description\}\}/g, escapeAttr(meta.description))
    .replace(/\{\{path\}\}/g, meta.path);
  for (const key of ["home", "about", "services", "contact"]) {
    head = head.replace(`{{current-${key}}}`, meta.page === key ? 'aria-current="page"' : "");
  }

  // index.html -> dist/index.html; services.html -> dist/services/index.html
  const name = path.basename(file, ".html");
  const out = name === "index" || name === "404" ? path.join(dist, `${name}.html`) : path.join(dist, name, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, head + body + footer);
  console.log("built", path.relative(root, out));
}

// sitemap and robots for search engines
const urls = pages.filter((f) => f !== "404.html").map((f) => {
  const n = path.basename(f, ".html");
  return `https://arrowheadpaintingkc.com${n === "index" ? "/" : `/${n}/`}`;
});
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`
);
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://arrowheadpaintingkc.com/sitemap.xml\n");

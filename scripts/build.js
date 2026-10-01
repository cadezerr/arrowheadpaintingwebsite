// Builds the site into dist/.
//   - Pages live in src/pages (nested folders become nested URLs).
//   - Each page starts with a <!--meta {...} --> JSON block (title, description, path, ...).
//   - Shared pieces live in src/partials and are pulled in with <!--#include name-->.
//   - <!--#img name|alt|sizes|class|eager--> outputs a responsive WebP image.
//   - <!--#reviews tag|count--> outputs review cards from src/data/reviews.json.
//   - <!--#ba n|caption--> outputs a before/after slider for img/ba-n-before / -after.
// Runs automatically on GoDaddy via `npm run build`. No packages needed.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const SITE = "https://arrowheadpaintingkc.com";

const BUSINESS = {
  name: "Arrowhead Painting KC",
  phone: "(913) 472-8077",
  tel: "+19134728077",
  email: "Info@arrowheadpaintingkc.com",
  reviewUrl: "https://g.page/r/CV7Pk7KhPc-oEAE/review",
  googleUrl: "https://www.google.com/search?q=arrowhead+painting+kc",
  rating: "5.0",
  reviewCount: "61",
};

const read = (p) => fs.readFileSync(path.join(src, p), "utf8");
// Version stamp so browsers always load the latest CSS/JS after an update
const crypto = require("crypto");
const VERSION = crypto.createHash("md5").update(read("assets/styles.css") + read("assets/site.js")).digest("hex").slice(0, 8);
const images = JSON.parse(read("data/images.json"));
const reviews = JSON.parse(read("data/reviews.json"));
const processes = JSON.parse(read("data/processes.json"));
const climate = JSON.parse(read("data/climate.json"));

const ICONS = {
  humidity: '<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/>',
  temp: '<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/><path d="M12 9v7"/>',
  wood: '<path d="M3 7h18v10H3z"/><path d="M7 7v10M3 12h4m6-5c-1 2-1 8 0 10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  wind: '<path d="M3 8h12a3 3 0 10-3-3M3 12h17a3 3 0 11-3 3M3 16h8"/>',
  rain: '<path d="M7 15a4 4 0 01-.5-8A5.5 5.5 0 0117 6a4 4 0 01.5 9z"/><path d="M8 18l-1 3m5-3l-1 3m5-3l-1 3"/>',
  shield: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
  google: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  paint: '<path d="M4 4h12v5H4zM16 6h3v5h-8v3"/><path d="M10 14h2v7h-2z"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1 0 2-.8 2-2 0-1.5-1-2-1-3s1-2 2.5-2H18a3 3 0 003-3c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  chat: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
  tools: '<path d="M14 6l4 4-9 9H5v-4z"/><path d="M13 7l4 4"/>',
  home: '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
};
function icon(name) {
  return `<span class="card-icon"><svg viewBox="0 0 24 24">${ICONS[name] || ICONS.star}</svg></span>`;
}
function iconFor(title) {
  const t = title.toLowerCase();
  if (/humid/.test(t)) return "humidity";
  if (/temperature/.test(t)) return "temp";
  if (/wood/.test(t)) return "wood";
  if (/uv|sun/.test(t)) return "sun";
  if (/wind/.test(t)) return "wind";
  if (/moisture|rain/.test(t)) return "rain";
  return "shield";
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function partial(name) {
  const file = path.join(src, "partials", `${name}.html`);
  if (!fs.existsSync(file)) throw new Error(`Missing partial: ${name}`);
  return fs.readFileSync(file, "utf8");
}

function img(name, alt, sizes = "100vw", cls = "", eager = false) {
  const m = images[name];
  if (!m) throw new Error(`Unknown image: ${name}`);
  const largest = m.sizes[m.sizes.length - 1];
  const srcset = m.sizes.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(", ");
  const h = Math.round((m.h * largest) / m.w);
  const style = m.pos ? ` style="object-position:${m.pos}"` : "";
  return `<img src="/assets/img/${name}-${m.sizes[0]}.webp" srcset="${srcset}" sizes="${sizes}" width="${largest}" height="${h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}${style}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}
function imgUrl(name) {
  const m = images[name];
  return `${SITE}/assets/img/${name}-${m.sizes[m.sizes.length - 1]}.webp`;
}

const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
const stars = `<span class="stars" aria-label="5 out of 5 stars">${STAR.repeat(5)}</span>`;

function reviewCards(tag, count) {
  const list = reviews.filter((r) => tag === "all" || r.tags.includes(tag)).slice(0, Number(count) || 99);
  return list
    .map(
      (r) => `<figure class="review">
  ${stars}
  <blockquote><p>${esc(r.text)}</p></blockquote>
  <figcaption><strong>${esc(r.name)}</strong><span>Google review · ${esc(r.when)}</span></figcaption>
</figure>`
    )
    .join("\n");
}

function beforeAfter(n, caption) {
  return `<figure class="ba" data-ba>
  <div class="ba-frame">
    ${img(`ba-${n}-after`, `After: ${caption}`, "(min-width: 900px) 860px, 100vw", "ba-after")}
    <div class="ba-before-wrap">${img(`ba-${n}-before`, `Before: ${caption}`, "(min-width: 900px) 860px, 100vw", "ba-before")}</div>
    <span class="ba-tag ba-tag-before">Before</span><span class="ba-tag ba-tag-after">After</span>
    <div class="ba-handle" aria-hidden="true"><span></span></div>
    <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after: ${esc(caption)}">
  </div>
  <figcaption>${esc(caption)}</figcaption>
</figure>`;
}

function timeline(key, extraClass = "") {
  const p = processes[key];
  if (!p) throw new Error(`Unknown process: ${key}`);
  const steps = p.steps
    .map(([t, d], i) => `<li class="reveal"><span class="tl-dot">${i + 1}</span><div><h3><span class="tl-step">Step ${i + 1}:</span> ${esc(t)}</h3><p>${esc(d)}</p></div></li>`)
    .join("\n");
  return `<section class="section tl-section ${extraClass}">
  <div class="wrap tl-grid">
    <div class="tl-photo reveal${images[p.photo] && images[p.photo].w > images[p.photo].h ? " tl-land" : ""}"><div class="photo">${img(p.photo, p.alt, "(min-width: 960px) 40vw, 100vw")}</div></div>
    <div>
      <p class="kicker">How It Works</p>
      <h2>${esc(p.title)}</h2>
      <ol class="tl">${steps}</ol>
      <div class="actions"><a class="btn btn-red btn-lg" href="/contact/">Request A Free Estimate</a></div>
    </div>
  </div>
</section>`;
}

function climateSection(key) {
  const c = climate[key];
  if (!c) throw new Error(`Unknown climate block: ${key}`);
  const cards = c.items.map(([t, d]) => `<div class="card reveal">${icon(iconFor(t))}<h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("\n");
  return `<section class="section climate-sec">
  <div class="climate-deco" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="kicker">${esc(c.kicker)}</p>
      <h2>${esc(c.title)}</h2>
      <p class="lede">${esc(c.intro)}</p>
    </div>
    <div class="cards climate-cards">${cards}</div>
    <div class="center mt-2"><a class="btn btn-red btn-lg" href="/contact/">Request A Free Estimate</a></div>
  </div>
</section>`;
}

function expand(html) {
  return html
    .replace(/<!--#timeline ([\w-]+)(?:\|([\w -]+))?-->/g, (_, k, c) => timeline(k, c || ""))
    .replace(/<!--#climate ([\w-]+)-->/g, (_, k) => climateSection(k))
    .replace(/<!--#icon ([\w-]+)-->/g, (_, k) => icon(k))
    .replace(/<!--#include ([\w-]+)-->/g, (_, n) => expand(partial(n)))
    .replace(/<!--#img ([^>]*?)-->/g, (_, a) => {
      const [name, alt, sizes, cls, eager] = a.split("|");
      return img(name.trim(), alt || "", sizes || undefined, cls || "", eager === "eager");
    })
    .replace(/<!--#reviews ([^>]*?)-->/g, (_, a) => {
      const [tag, count] = a.split("|");
      return reviewCards(tag.trim(), count);
    })
    .replace(/<!--#ba ([^>]*?)-->/g, (_, a) => {
      const [n, caption] = a.split("|");
      return beforeAfter(n.trim(), caption || "");
    })
    .replace(/\{\{stars\}\}/g, stars)
    .replace(/\{\{phone\}\}/g, BUSINESS.phone)
    .replace(/\{\{tel\}\}/g, BUSINESS.tel)
    .replace(/\{\{email\}\}/g, BUSINESS.email)
    .replace(/\{\{reviewUrl\}\}/g, BUSINESS.reviewUrl)
    .replace(/\{\{googleUrl\}\}/g, BUSINESS.googleUrl)
    .replace(/\{\{rating\}\}/g, BUSINESS.rating)
    .replace(/\{\{reviewCount\}\}/g, BUSINESS.reviewCount);
}

// ---------- Title Case for headings, buttons, and labels ----------
function titleWord(w) {
  if (/@|^https?:/.test(w)) return w;
  return w.replace(/^([("'“‘]*)([a-z])/, (_, pre, c) => pre + c.toUpperCase());
}
function titleText(html) {
  // only touch text between tags, never tag markup or entities
  return html.replace(/(^|>)([^<]+)/g, (_, gt, text) => gt + text.replace(/(^|\s)(\S+)/g, (m, sp, w) => (w.startsWith("&") || w.includes("@") ? sp + w : sp + titleWord(w))));
}
function titleCaseHtml(html) {
  html = html.replace(/(<(h[1-4]|summary|figcaption class="tc")\b[^>]*>)([\s\S]*?)(<\/\2>)/g, (_, open, tag, inner, close) => open + titleText(inner) + close);
  html = html.replace(/(<(a|button|p|span|li|strong)\b[^>]*class="[^"]*\b(btn|kicker|link-arrow|filter|svc-badge|photo-tag|tier-flag|footer-h|g-cap)\b[^"]*"[^>]*>)([\s\S]*?)(<\/\2>)/g, (_, open, tag, cls, inner, close) => open + titleText(inner) + close);
  return html;
}

// ---------- Structured data ----------
const AREAS = ["Overland Park", "Leawood", "Olathe", "Lenexa", "Shawnee", "Mission", "Roeland Park", "Prairie Village", "Lee's Summit", "Blue Springs", "Belton", "Raymore", "Grandview", "Greenwood", "Kansas City", "Parkville", "Liberty", "Gladstone"];
const businessLd = {
  "@context": "https://schema.org",
  "@type": "HousePainter",
  "@id": `${SITE}/#business`,
  name: BUSINESS.name,
  alternateName: "Arrowhead Painting",
  url: `${SITE}/`,
  telephone: BUSINESS.tel,
  email: BUSINESS.email,
  logo: `${SITE}/assets/img/logo.png`,
  image: imgUrl("hero-charcoal-home"),
  description: "Premium exterior painting, interior painting, wood rot and siding repair, and light commercial painting across the Kansas City metro. Warranty-backed work with white-glove service.",
  founder: { "@type": "Person", name: "Cade Zerr" },
  address: { "@type": "PostalAddress", addressLocality: "Lenexa", addressRegion: "KS", addressCountry: "US" },
  areaServed: AREAS.map((a) => ({ "@type": "City", name: a })),
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "16:00" },
  ],
  sameAs: ["https://www.facebook.com/arrowheadpaintingkc/", "https://www.instagram.com/arrowheadpaintingkc/", "https://www.tiktok.com/@arrowheadpaintingkc", "https://nextdoor.com/pages/arrowhead-painting-kc-overland-park-ks/"],
  knowsAbout: ["Exterior house painting", "Interior painting", "Wood rot repair", "Siding repair", "James Hardie siding", "LP SmartSide", "Cabinet painting", "Commercial painting", "Color consultation"],
};

function pageLd(meta, url) {
  const out = [businessLd];
  if (meta.crumbs) {
    out.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [["Home", "/"], ...meta.crumbs].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + p })),
    });
  }
  if (meta.service) {
    out.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: meta.service,
      serviceType: meta.service,
      provider: { "@id": `${SITE}/#business` },
      areaServed: meta.area ? { "@type": "City", name: meta.area } : { "@type": "AdministrativeArea", name: "Kansas City metropolitan area" },
      url,
    });
  }
  if (meta.faq) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    });
  }
  if (meta.article) {
    out.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: meta.h1 || meta.title,
      description: meta.description,
      datePublished: meta.article.date,
      dateModified: meta.article.date,
      image: imgUrl(meta.og || "hero-charcoal-home"),
      author: { "@type": "Person", name: "Cade Zerr", url: `${SITE}/about/` },
      publisher: { "@id": `${SITE}/#business` },
      mainEntityOfPage: url,
    });
  }
  return out.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
}

function faqHtml(faq) {
  return `<div class="faq">${faq
    .map(([q, a]) => `<details><summary><span>${esc(q)}</span></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`)
    .join("\n")}</div>`;
}

function crumbsHtml(crumbs) {
  const items = [["Home", "/"], ...crumbs];
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map(([n, p], i) => (i === items.length - 1 ? `<li aria-current="page">${titleText(esc(n))}</li>` : `<li><a href="${p}">${titleText(esc(n))}</a></li>`))
    .join("")}</ol></nav>`;
}

// ---------- Build ----------
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(path.join(src, "assets"), path.join(dist, "assets"), { recursive: true });
fs.copyFileSync(path.join(src, "assets/img/icon-32.png"), path.join(dist, "favicon.png"));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith(".html") ? [path.join(dir, e.name)] : []));
}

const header = partial("header");
const footer = partial("footer");
const sitemap = [];
const blogPosts = [];

const files = walk(path.join(src, "pages"));
const pages = files.map((file) => {
  let body = fs.readFileSync(file, "utf8");
  const m = body.match(/^<!--meta\s+(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`${path.relative(src, file)} is missing its <!--meta {...} --> block`);
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { throw new Error(`${path.relative(src, file)}: bad meta JSON: ${e.message}`); }
  if (meta.article) blogPosts.push({ ...meta });
  return { file, meta, body: body.slice(m[0].length) };
});
blogPosts.sort((a, b) => b.article.date.localeCompare(a.article.date));

for (const { file, meta, body } of pages) {
  const url = SITE + meta.path;
  let html = body
    .replace("<!--#faq-->", meta.faq ? faqHtml(meta.faq) + '<p class="mt-2"><a class="link-arrow" href="/faqs/">See All FAQs</a></p>' : "")
    .replace("<!--#crumbs-->", meta.crumbs ? crumbsHtml(meta.crumbs) : "")
    .replace("<!--#blog-list-->", () =>
      blogPosts
        .map(
          (p) => `<article class="post-card reveal">
  <a href="${p.path}" class="post-card-img">${img(p.og, p.ogAlt || p.h1, "(min-width: 900px) 33vw, 100vw")}</a>
  <div class="post-card-body">
    <p class="post-meta"><time datetime="${p.article.date}">${new Date(p.article.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time> · ${p.article.read} min read</p>
    <h3><a href="${p.path}">${esc(p.h1)}</a></h3>
    <p>${esc(p.description)}</p>
  </div>
</article>`
        )
        .join("\n")
    );

  let head = header
    .replace(/\{\{title\}\}/g, esc(meta.title))
    .replace(/\{\{description\}\}/g, esc(meta.description))
    .replace(/\{\{canonical\}\}/g, url)
    .replace(/\{\{ogImage\}\}/g, imgUrl(meta.og || "hero-charcoal-home"))
    .replace(/\{\{ogType\}\}/g, meta.article ? "article" : "website")
    .replace(/\{\{robots\}\}/g, meta.noindex ? "noindex, follow" : "index, follow")
    .replace("{{jsonld}}", pageLd(meta, url))
    .replace("{{preload}}", meta.preload ? `<link rel="preload" as="image" href="/assets/img/${meta.preload}-800.webp" imagesrcset="${images[meta.preload].sizes.map((w) => `/assets/img/${meta.preload}-${w}.webp ${w}w`).join(", ")}" imagesizes="100vw" fetchpriority="high">` : "");
  head = head.replace(/\{\{current-([\w-]+)\}\}/g, (_, k) => (meta.nav === k ? ' aria-current="page"' : ""));

  const out = titleCaseHtml(expand(head + html + footer)).replace('/assets/styles.css"', `/assets/styles.css?v=${VERSION}"`).replace('/assets/site.js"', `/assets/site.js?v=${VERSION}"`);
  const left = out.match(/<!--#[\w-]+[^>]*-->|\{\{[\w-]+\}\}/);
  if (left) throw new Error(`${path.relative(src, file)}: unexpanded placeholder ${left[0]}`);

  const rel = path.relative(path.join(src, "pages"), file);
  const name = rel.replace(/\.html$/, "");
  const outFile = name === "index" || name === "404" ? path.join(dist, `${name}.html`) : name.endsWith("/index") ? path.join(dist, name + ".html") : path.join(dist, name, "index.html");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);
  if (!meta.noindex) sitemap.push({ loc: url, pri: meta.path === "/" ? "1.0" : meta.priority || "0.7" });
}

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .sort((a, b) => b.pri.localeCompare(a.pri))
    .map((s) => `  <url><loc>${s.loc}</loc><priority>${s.pri}</priority></url>`)
    .join("\n")}\n</urlset>\n`
);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages into dist/`);

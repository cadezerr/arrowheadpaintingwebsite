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
const images = JSON.parse(read("data/images.json"));
const reviews = JSON.parse(read("data/reviews.json"));
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

function expand(html) {
  return html
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
  sameAs: ["https://www.facebook.com/arrowheadpaintingkc/", "https://www.instagram.com/arrowheadpaintingkc/"],
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
    .map(([n, p], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${p}">${esc(n)}</a></li>`))
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
    .replace("<!--#faq-->", meta.faq ? faqHtml(meta.faq) : "")
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

  const out = expand(head + html + footer);
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

# Arrowhead Painting KC: SEO Launch Checklist & Backlink Strategy

## 1. Launch (the step that makes Google see the new site)
The domain arrowheadpaintingkc.com still points to the old WordPress site (hosted on Flywheel). Until the domain points to the GoDaddy Node.js app, Google will keep showing the old site.

1. In GoDaddy Node.js Hosting, open the Arrowhead app > Settings/Domains > add `arrowheadpaintingkc.com` and `www.arrowheadpaintingkc.com`.
2. Update DNS (GoDaddy > Domains > DNS) to the records the app shows (usually an A record for `@` and a CNAME for `www`). Remove the old Flywheel records.
3. Make sure the free SSL certificate is issued (HTTPS). The site automatically sends `http://` and `www.` visitors to `https://arrowheadpaintingkc.com`.
4. Every old WordPress URL (`/who-we-are/`, `/gallery/`, `/home-2/`, old posts and categories, old sitemaps) permanently redirects (301) to the matching new page, so existing Google rankings carry over.
5. Cancel the Flywheel plan only after the new site is live on the domain.

## 2. Google Search Console
1. Go to search.google.com/search-console > Add property > **Domain** > `arrowheadpaintingkc.com`.
2. Google gives a TXT record. In GoDaddy DNS, add it (Type TXT, Host `@`). Click Verify. (Domain verification covers http, https, and www.)
   - Alternative: choose **URL prefix**, pick the "HTML tag" method, and add the code as a GoDaddy app environment variable `GOOGLE_SITE_VERIFICATION` (just the content value). Or pick "HTML file" and set `GOOGLE_VERIFICATION_FILE` to the file name (e.g. `google1234abcd.html`). Redeploy.
3. Sitemaps > submit `https://arrowheadpaintingkc.com/sitemap.xml`.
4. URL Inspection > enter the home page > Request indexing. Repeat for Exterior Painting, Wood Rot Repair, Interior Painting, and the top city pages.
5. Also add the site to **Bing Webmaster Tools** (it can import from Search Console in one click).

## 3. Google Business Profile
- Website link: `https://arrowheadpaintingkc.com/` (add `?utm_source=gbp` if you want to track it).
- Primary category: Painter. Secondary: House painter, Painting contractor, Siding contractor (if offered).
- Services: Exterior painting, Interior painting, Wood rot repair, Siding repair, Cabinet painting, Commercial painting, Deck staining, Drywall repair.
- Service areas: all 17 cities on the site.
- Post weekly: one project photo + city + service ("Exterior repaint in Olathe, SuperPaint, 3-year warranty").
- Ask every customer for a review that mentions their city and the service.

## 4. Backlink strategy (in priority order)
**Citations and directories (week 1–2)** – Use the exact same name, phone, and website everywhere:
- Google Business Profile, Bing Places, Apple Business Connect
- Facebook, Instagram, TikTok, Nextdoor (link to the website in every bio)
- PCA member directory (pcapainted.org)
- Better Business Bureau, Yelp, Angi, HomeAdvisor, Houzz, Thumbtack, Porch, BuildZoom
- Sherwin-Williams and Benjamin Moore contractor locators (ask your store rep)
- Chambers of commerce: Overland Park, Olathe, Lenexa, Lee's Summit (membership includes a directory link)

**Relationship links (month 1–3)**
- Realtors and property managers: offer pre-listing paint/rot inspections; ask for a "preferred vendor" link on their site.
- Partner trades (roofers, gutter, window, siding, home inspectors): swap "trusted partner" links.
- Paint and material suppliers: ask to be featured as a local contractor (case study with photos).
- Customer churches and businesses you've painted (Pisgah Church, Community Covenant, Mercury Gymnastics): ask for a thank-you post or vendor link.

**Community and PR (ongoing)**
- Sponsor a youth sports team, school event, or HOA newsletter (sponsor pages link out).
- Volunteer project (e.g., paint a veteran's or neighbor's home) and pitch it to KC news, Patch, and city newsletters.
- Answer homeowner questions on Nextdoor and Reddit r/kansascity; link to the matching blog post when it truly helps.
- Before/after features for local blogs and home shows (Kansas City Home Show booth listings include links).

**Content that earns links**
- Keep publishing 1–2 blog posts a month answering real customer questions.
- A local "Kansas City exterior paint color guide" with real project photos is a strong link magnet for realtors and designers.

**Avoid**: buying links, link farms, hidden links or text, and copied content on city pages. These can get the site penalized.

## 5. What's already built into the site
- `sitemap.xml` (45 pages with last-modified dates) and `robots.txt` pointing to it
- No `noindex` tags except the 404 page
- Canonical tag, unique title and meta description on every page
- One H1 per page and a clean heading order
- Alt text on every image
- Schema: HousePainter (local business), WebSite, WebPage, Breadcrumbs, Services, FAQ, Blog posts
- 1200×630 social sharing (OG) image on every page, plus Twitter card tags
- Internal links between services, cities, blog posts, and FAQs
- Compressed WebP images with responsive sizes, lazy loading, cache-busting, and gzip
- HTTPS + bare-domain redirects, HSTS, and 301s from every old WordPress URL
- Clean, lowercase URL slugs

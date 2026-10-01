# Generates the Locations pages, the Locations dropdown menu, and the footer
# location links from the list below. Every city page uses the same template;
# only the city name, state, county, and ZIP codes change.
#
# Edit the list, then run:  python3 scripts/make-areas.py
import json, os

ROOT = os.path.join(os.path.dirname(__file__), "..", "src")
OUT = os.path.join(ROOT, "pages", "service-areas")
os.makedirs(OUT, exist_ok=True)

CITIES = [
    # slug, name, state, county, zips, photo
    ("overland-park", "Overland Park", "KS", "Johnson County", ["66204", "66207", "66210", "66212", "66213", "66214", "66221", "66223"], "ext-charcoal-two-story"),
    ("leawood", "Leawood", "KS", "Johnson County", ["66206", "66209", "66211", "66224"], "ext-lake-home"),
    ("olathe", "Olathe", "KS", "Johnson County", ["66061", "66062"], "ext-greige-back"),
    ("lenexa", "Lenexa", "KS", "Johnson County", ["66215", "66219", "66220", "66227"], "ext-gray-stucco-ranch"),
    ("shawnee", "Shawnee", "KS", "Johnson County", ["66203", "66216", "66217", "66218", "66226"], "ext-charcoal-modern"),
    ("mission", "Mission", "KS", "Johnson County", ["66202"], "ext-navy-garage-doors"),
    ("roeland-park", "Roeland Park", "KS", "Johnson County", ["66205"], "ext-two-story-front"),
    ("prairie-village", "Prairie Village", "KS", "Johnson County", ["66208"], "ext-green-two-story"),
    ("kansas-city", "Kansas City", "MO", "Jackson County", ["64112", "64113", "64114", "64145"], "hero-charcoal-home"),
    ("north-kansas-city", "North Kansas City", "MO", "the Northland", ["64118", "64119", "64151", "64153", "64154", "64155", "64156", "64157", "64158", "64163", "64164"], "drone-white-side"),
    ("parkville", "Parkville", "MO", "Platte County", ["64152"], "ext-cream-backyard"),
    ("lees-summit", "Lee's Summit", "MO", "Jackson County", ["64063", "64064", "64065", "64081", "64082", "64086"], "ext-two-story-front"),
    ("greenwood", "Greenwood", "MO", "Jackson County", ["64034"], "ext-gray-stucco-side"),
    ("blue-springs", "Blue Springs", "MO", "Jackson County", ["64014", "64015"], "ext-mustard-split"),
    ("grandview", "Grandview", "MO", "Jackson County", ["64030"], "ext-white-chimney"),
    ("belton", "Belton", "MO", "Cass County", ["64012"], "ext-charcoal-back-deck"),
    ("raymore", "Raymore", "MO", "Cass County", ["64083"], "ext-lake-home-2"),
]

def label(n, st):
    return "North Kansas City &amp; Northland, MO" if n == "North Kansas City" else f"{n}, {st}"


PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>'


def page(slug, name, state, county, zips, photo):
    meta = {
        "title": f"{name}, {state} Painting Contractor | Arrowhead Painting KC",
        "description": f"Your trusted {name} painting contractor. Exterior and interior painting, wood rot repair, and color consultations with up to a 7-year warranty.",
        "path": f"/service-areas/{slug}/",
        "nav": "locations",
        "og": photo,
        "service": "House painting",
        "area": name,
        "crumbs": [["Locations", "/service-areas/"], [name, f"/service-areas/{slug}/"]],
        "priority": "0.7",
        "faq": [
            [f"Do you serve all of {name}?", f"Yes. We paint homes throughout {name}{' and the surrounding Northland' if slug == 'north-kansas-city' else ''}."],
            [f"How do I get a painting estimate in {name}?", "Call us at (913) 472-8077 or request a free estimate online. We'll call to schedule a time to walk your property, then send you a written, itemized quote."],
            ["Do you repair wood rot before painting?", "Yes. We replace rotted siding, trim, fascia, and door frames with cedar, LP SmartSide, James Hardie, AZEK, or PVC before we paint, so your new finish lasts."],
            ["Is your work warrantied?", "Every project comes with a written warranty: up to 7 years on exteriors and 2 years on interiors."],
        ],
    }
    zl = "".join(f"<li>{z}</li>" for z in zips)
    nearby = "".join(f'<li><a href="/service-areas/{s}/">{label(n, st)}</a></li>' for s, n, st, *_ in CITIES if s != slug)
    return f'''<!--meta {json.dumps(meta, ensure_ascii=False)} -->

<section class="page-hero">
  <div class="hero-media"><!--#img {photo}|A {name}-area home painted by Arrowhead Painting|100vw||eager--></div>
  <div class="wrap">
    <div class="page-hero-in hero-in">
      <!--#crumbs-->
      <p class="kicker" style="color:#ff6b80">{name}, {state}</p>
      <h1>Your Trusted {name} Painting Contractor</h1>
      <p class="lede">Exterior and interior painting, wood repair, and color consultations for {name} homeowners, delivered with white-glove service and backed by a written warranty.</p>
      <div class="hero-actions">
        <a class="btn btn-red btn-lg" href="/contact/">Request A Free Estimate</a>
        <a class="btn btn-ghost-light btn-lg" href="tel:{{{{tel}}}}">Call {{{{phone}}}}</a>
      </div>
    </div>
  </div>
  <div class="hero-peak" aria-hidden="true"></div>
</section>

<!--#include badges-->

<section class="section-tight">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="kicker">Our Services In {name}</p>
      <h2>Everything Your Home Needs</h2>
    </div>
  </div>
  <!--#include services-marquee-->
</section>

<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">Painting In {name}</p>
      <h2>Craftsmanship Built To Last For {name} Homes</h2>
      <!--#include intro-->
      <p class="muted">Proudly serving homeowners throughout {name}{" and the Northland" if slug == "north-kansas-city" else ""}.</p>
      <div class="actions"><a class="btn btn-red" href="/contact/">Request A Free Estimate</a></div>
    </div>
    <div class="reveal"><div class="photo photo-tall"><!--#img {photo}|Recent Arrowhead Painting exterior project near {name}|(min-width: 900px) 45vw, 100vw--></div></div>
  </div>
</section>

<!--#climate general-->

<!--#include why-choose-->

<section class="section bg-mist">
  <div class="wrap narrow">
    <div class="section-head center reveal"><p class="kicker">FAQ</p><h2>Painting In {name}: Common Questions</h2></div>
    <!--#faq-->
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="reveal" style="font-size:clamp(1.8rem,3vw,2.4rem)">Other Locations We Serve</h2>
    <ul class="pill-links">{nearby}</ul>
  </div>
</section>

<!--#include cta-->
'''


# remove old combined-area pages
for f in os.listdir(OUT):
    if f.endswith(".html") and f != "index.html" and f[:-5] not in [c[0] for c in CITIES]:
        os.remove(os.path.join(OUT, f))

for c in CITIES:
    open(os.path.join(OUT, c[0] + ".html"), "w").write(page(*c))

# Locations mega menu (header)
items = "\n".join(f'            <li><a href="/service-areas/{s}/">{PIN}<span>{label(n, st)}</span></a></li>' for s, n, st, *_ in CITIES)
open(os.path.join(ROOT, "partials", "locations-menu.html"), "w").write(f'''<div class="sub mega">
          <ul class="mega-grid">
{items}
          </ul>
          <a class="mega-all" href="/service-areas/">View All Locations</a>
        </div>
''')

# Hub page
cards = "\n".join(f'      <a class="area-card reveal" href="/service-areas/{s}/"><h3>{label(n, st)}</h3><p>Painting contractor in {n}</p></a>' for s, n, st, _, z, _ in CITIES)
allzips = sorted({z for c in CITIES for z in c[4]})
hub_meta = {"title": "Locations | Kansas City House Painters | Arrowhead Painting KC",
            "description": "Arrowhead Painting KC serves Overland Park, Leawood, Olathe, Lenexa, Shawnee, Prairie Village, Lee's Summit, Blue Springs, Kansas City, and more.",
            "path": "/service-areas/", "nav": "locations", "og": "brand-yard-sign", "crumbs": [["Locations", "/service-areas/"]], "priority": "0.8"}
open(os.path.join(OUT, "index.html"), "w").write(f'''<!--meta {json.dumps(hub_meta, ensure_ascii=False)} -->

<section class="page-hero plain">
  <div class="wrap">
    <div class="page-hero-in hero-in">
      <!--#crumbs-->
      <h1>Locations We Serve</h1>
      <p class="lede">Arrowhead Painting proudly serves homeowners and businesses across the Kansas City metro, on both sides of State Line.</p>
      <div class="hero-actions"><a class="btn btn-red btn-lg" href="/contact/">Request A Free Estimate</a></div>
    </div>
  </div>
  <div class="hero-peak" aria-hidden="true"></div>
</section>

<section class="section">
  <div class="wrap">
    <div class="area-grid">
{cards}
    </div>
  </div>
</section>

<section class="section bg-mist">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">Don't See Your City?</p>
      <h2>Give Us A Call</h2>
      <p class="lede">We serve homeowners all across the Kansas City metro. If your city isn't listed, reach out and we'll let you know if we can help.</p>
      <div class="actions"><a class="btn btn-red" href="/contact/">Request A Free Estimate</a><a class="btn btn-outline" href="tel:{{{{tel}}}}">Call {{{{phone}}}}</a></div>
    </div>
    <div class="reveal"><div class="photo photo-wide"><!--#img brand-yard-sign|Arrowhead Painting yard sign at a Kansas City project|(min-width: 900px) 45vw, 100vw--></div></div>
  </div>
</section>

<!--#include cta-->
''')
print("cities:", len(CITIES), "zips:", len(allzips))

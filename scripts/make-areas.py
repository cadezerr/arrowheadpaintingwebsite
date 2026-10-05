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
    # slug, name, state, county, zips, photo, photo2
    ("overland-park", "Overland Park", "KS", "Johnson County", ["66204", "66207", "66210", "66212", "66213", "66214", "66221", "66223"], "ext-gray-gables", "ext-gray-gables-2"),
    ("leawood", "Leawood", "KS", "Johnson County", ["66206", "66209", "66211", "66224"], "ext-brick-wide", "ext-gray-flag-2"),
    ("olathe", "Olathe", "KS", "Johnson County", ["66061", "66062"], "ext-arch-window", "ext-white-chimney"),
    ("lenexa", "Lenexa", "KS", "Johnson County", ["66215", "66219", "66220", "66227"], "ext-gray-stone", "ext-gray-garage-2"),
    ("shawnee", "Shawnee", "KS", "Johnson County", ["66203", "66216", "66217", "66218", "66226"], "ext-stone-arch", "ext-greige-back"),
    ("mission", "Mission", "KS", "Johnson County", ["66202"], "ext-white-brown-garage", "ext-gray-front-3"),
    ("roeland-park", "Roeland Park", "KS", "Johnson County", ["66205"], "ext-two-story-front", "ext-gray-garage-3"),
    ("prairie-village", "Prairie Village", "KS", "Johnson County", ["66208"], "ext-green-two-story", "ext-brick-flag"),
    ("kansas-city", "Kansas City", "MO", "Jackson County", ["64112", "64113", "64114", "64145"], "ext-brick-two-story", "ext-black-trim"),
    ("north-kansas-city", "North Kansas City", "MO", "the Northland", ["64118", "64119", "64151", "64153", "64154", "64155", "64156", "64157", "64158", "64163", "64164"], "drone-white-side", "ext-gray-sign"),
    ("parkville", "Parkville", "MO", "Platte County", ["64152"], "ext-cream-backyard", "ext-lake-home"),
    ("lees-summit", "Lee's Summit", "MO", "Jackson County", ["64063", "64064", "64065", "64081", "64082", "64086"], "ext-taupe-wide", "ext-gray-steep-2"),
    ("greenwood", "Greenwood", "MO", "Jackson County", ["64034"], "ext-gray-three-car", "ext-gray-hottub"),
    ("blue-springs", "Blue Springs", "MO", "Jackson County", ["64014", "64015"], "ext-gray-front-4", "ext-gray-crepe-2"),
    ("grandview", "Grandview", "MO", "Jackson County", ["64030"], "ext-gray-crepe", "ext-pool-rear"),
    ("belton", "Belton", "MO", "Cass County", ["64012"], "ext-sage-front", "ext-lake-home-2"),
    ("raymore", "Raymore", "MO", "Cass County", ["64083"], "ext-stucco-gold", "ext-charcoal-back-deck"),
]

def label(n, st):
    return "North Kansas City &amp; Northland, MO" if n == "North Kansas City" else f"{n}, {st}"


PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>'


LOCAL = {
    "overland-park": "from established neighborhoods in north Overland Park to the newer subdivisions south of 135th Street",
    "leawood": "from Leawood's established neighborhoods to the larger, newer homes in south Leawood",
    "olathe": "across one of Johnson County's fastest-growing cities, from older Olathe neighborhoods to brand-new subdivisions",
    "lenexa": "from homes near Lenexa City Center to the established neighborhoods east of I-435",
    "shawnee": "from older homes near downtown Shawnee to the newer neighborhoods in western Shawnee",
    "mission": "in Mission's established, tree-lined neighborhoods",
    "roeland-park": "in Roeland Park's established neighborhoods along the State Line corridor",
    "prairie-village": "in Prairie Village's classic, mature neighborhoods",
    "kansas-city": "from Brookside and Waldo to south Kansas City and the Northland",
    "north-kansas-city": "throughout North Kansas City and Northland communities like Gladstone and Liberty",
    "parkville": "in Parkville's hillside neighborhoods above the Missouri River",
    "lees-summit": "from downtown Lee's Summit to the newer subdivisions across the city",
    "greenwood": "in Greenwood and the surrounding eastern Jackson County area",
    "blue-springs": "throughout Blue Springs and eastern Jackson County",
    "grandview": "throughout Grandview and south Kansas City",
    "belton": "throughout Belton and northern Cass County",
    "raymore": "in Raymore's growing neighborhoods and across Cass County",
}

def svc_cards(name):
    items = [
        ("/exterior-painting/", f"{name} Exterior Painting", f"Exterior house painting for {name} homes: siding, trim, soffits, fascia, doors, and garage doors, with thorough prep and premium paint."),
        ("/interior-painting/", f"{name} Interior Painting", f"Interior painting in {name} for walls, ceilings, trim, doors, and stairwells, with furniture and floors fully protected."),
        ("/wood-rot-repair/", f"{name} Wood Rot Repair", f"Wood rot repair in {name}: rotted trim, fascia, soffits, door frames, and window sills replaced and painted to match."),
        ("/wood-rot-repair/", f"{name} Siding Repair & Carpentry", f"Siding repair and replacement in {name} with James Hardie, LP SmartSide, cedar, AZEK, or PVC, installed by our carpenters."),
        ("/interior-painting/", f"{name} Cabinet Painting", f"Kitchen and bathroom cabinet painting in {name}, cleaned, sanded, primed, and finished with a durable enamel."),
        ("/commercial-painting/", f"{name} Commercial Painting", f"Commercial painting in {name} for offices, retail, churches, rentals, and HOAs, scheduled around your business."),
    ]
    return "\n".join(f'      <a class="card card-link reveal" href="{h}"><h3>{t}</h3><p>{d}</p></a>' for h, t, d in items)


def page(slug, name, state, county, zips, photo, photo2):
    short = "North KC" if slug == "north-kansas-city" else name
    title = f"{name} Painters | House Painting & Wood Repair | Arrowhead"
    if len(title) > 66: title = f"{name} Painters | House Painting & Wood Rot Repair"
    if len(title) > 68: title = f"{name} House Painters | Arrowhead Painting"
    meta = {
        "title": title,
        "description": (lambda d: d if len(d) <= 160 else f"Top-rated {name} house painters for exterior painting, interior painting, and wood rot repair in {name}, {state}. Free estimates.")(f"Top-rated {name} house painters. Exterior painting, interior painting, wood rot repair, siding repair, and cabinet painting in {name}, {state}. Free estimates."),
        "path": f"/service-areas/{slug}/",
        "nav": "locations",
        "og": photo,
        "service": "House painting",
        "area": name,
        "crumbs": [["Locations", "/service-areas/"], [name, f"/service-areas/{slug}/"]],
        "priority": "0.7",
        "faq": [
            [f"Who are the best house painters in {name}?", f"Arrowhead Painting is a family-owned painting company rated 5.0 stars on Google and 100% recommended on Facebook. We paint homes {LOCAL[slug]}, with thorough prep, in-house wood repair, and a written warranty on every project."],
            [f"Do you offer exterior house painting in {name}?", f"Yes. Exterior painting is our specialty. We power wash, repair wood rot, caulk every seam, and paint siding, trim, soffits, fascia, doors, and garage doors on {name} homes, with exterior warranties of 3, 5, or 7 years."],
            [f"Do you do interior painting in {name}?", f"Yes. We paint walls, ceilings, trim, doors, stairwells, and cabinets in {name} homes, with furniture and floors fully protected and a 2-year written warranty."],
            [f"Do you repair wood rot and siding in {name}?", "Yes. We replace rotted siding, trim, fascia, soffits, door frames, and window sills with cedar, LP SmartSide, James Hardie, AZEK, or PVC, then paint everything to match."],
            [f"How much does it cost to paint a house in {name}?", f"Every home is different, so we give every {name} homeowner a free, customized, itemized estimate after walking the property together. Price depends on size, siding type, repairs, and the paint you choose."],
            [f"How do I get a painting estimate in {name}?", "Call us at (913) 472-8077 or request a free estimate online. We'll schedule a time to walk your property, then send you a written, itemized quote."],
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
      <p class="kicker" >{name}, {state}</p>
      <h1>Your Trusted {name} Painting Contractor</h1>
      <p class="lede">Top-rated {name} house painters for exterior painting, interior painting, wood rot repair, and siding repair, delivered with white-glove service and backed by a written warranty.</p>
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
      <p>Looking for experienced {name} painters? Arrowhead Painting provides exterior house painting, interior painting, wood rot repair, siding replacement, and cabinet painting for homeowners {LOCAL[slug]}. Whether you need a full exterior repaint, a few rooms refreshed, or rotted trim replaced before it spreads, our {name} painting contractors handle it from start to finish.</p>
      <div class="actions"><a class="btn btn-red" href="/contact/">Request A Free Estimate</a></div>
    </div>
    <div class="reveal"><div class="photo photo-tall"><!--#img {photo2}|Recent Arrowhead Painting exterior project near {name}|(min-width: 900px) 45vw, 100vw--></div></div>
  </div>
</section>

<section class="section bg-mist" id="services">
  <div class="wrap">
    <div class="section-head center reveal">
      <p class="kicker">{name} Painting Services</p>
      <h2>House Painters Serving {name}, {state}</h2>
    </div>
    <div class="cards">
{svc_cards(name)}
    </div>
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
cards = "\n".join(f'      <a class="area-card reveal" href="/service-areas/{s}/"><h3>{label(n, st)}</h3><p>Painting contractor in {n}</p></a>' for s, n, st, _, z, _, _ in CITIES)
seo = "\n".join(f'''      <div><h3><a href="/service-areas/{s}/" style="color:inherit">{n} Painters</a></h3><ul><li><a href="/service-areas/{s}/#services">{n} Exterior Painting</a></li><li><a href="/service-areas/{s}/#services">{n} Interior Painting</a></li><li><a href="/service-areas/{s}/#services">{n} Wood Rot Repair</a></li><li><a href="/service-areas/{s}/#services">{n} Siding Repair</a></li><li><a href="/service-areas/{s}/#services">{n} Cabinet Painting</a></li></ul></div>''' for s, n, st, *_ in CITIES)
allzips = sorted({z for c in CITIES for z in c[4]})
hub_meta = {"title": "Locations | Kansas City House Painters | Arrowhead Painting KC",
            "description": "Arrowhead Painting KC serves Overland Park, Leawood, Olathe, Lenexa, Shawnee, Prairie Village, Lee's Summit, Blue Springs, Kansas City, and more.",
            "path": "/service-areas/", "nav": "locations", "og": "kc-map", "crumbs": [["Locations", "/service-areas/"]], "priority": "0.8"}
open(os.path.join(OUT, "index.html"), "w").write(f'''<!--meta {json.dumps(hub_meta, ensure_ascii=False)} -->

<section class="page-hero plain">
  <div class="wrap">
    <div class="page-hero-in hero-in">
      <!--#crumbs-->
      <h1>Locations We Serve</h1>
      <p class="lede">Arrowhead Painting proudly serves homeowners and businesses across the Kansas City Metro, on both sides of State Line.</p>
      <div class="hero-actions"><a class="btn btn-red btn-lg" href="/contact/">Request A Free Estimate</a></div>
    </div>
  </div>
  <div class="hero-peak" aria-hidden="true"></div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="sr">Cities We Serve</h2>
    <div class="area-grid">
{cards}
    </div>
  </div>
</section>

<section class="section bg-mist">
  <div class="wrap">
    <div class="section-head reveal"><p class="kicker">Services By City</p><h2>Painting Services Across The Kansas City Metro</h2>
      <p class="lede">Arrowhead Painting is a Kansas City house painting company serving both sides of State Line. Find exterior painters, interior painters, and wood rot repair near you.</p></div>
    <div class="seo-links">
{seo}
    </div>
  </div>
</section>

<section class="section bg-mist">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">Don't See Your City?</p>
      <h2>Give Us A Call</h2>
      <p class="lede">We serve homeowners all across the Kansas City Metro. If your city isn't listed, reach out and we'll let you know if we can help.</p>
      <div class="actions"><a class="btn btn-red" href="/contact/">Request A Free Estimate</a><a class="btn btn-outline" href="tel:{{{{tel}}}}">Call {{{{phone}}}}</a></div>
    </div>
    <div class="reveal"><div class="photo photo-map"><!--#img kc-map|Map of the Kansas City Metro cities served by Arrowhead Painting|(min-width: 900px) 45vw, 100vw--></div></div>
  </div>
</section>

<!--#include cta-->
''')
print("cities:", len(CITIES), "zips:", len(allzips))

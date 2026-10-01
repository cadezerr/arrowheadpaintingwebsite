# Generates src/pages/service-areas/*.html from the data below.
# Edit the copy here and re-run:  python3 scripts/make-areas.py
import json, os
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "pages", "service-areas")
os.makedirs(OUT, exist_ok=True)

AREAS = [
 dict(slug="overland-park", name="Overland Park", state="KS", county="Johnson County",
  zips=["66204","66207","66210","66212","66213","66214","66221","66223"],
  photo="ext-charcoal-two-story", ba="1",
  intro="Overland Park is where we paint more homes than anywhere else. From the 1960s and '70s ranches and split-levels north of I-435 to the newer two-stories in south OP, we know the siding, trim details, and common problem spots on just about every style of home here.",
  local="Many north Overland Park homes still have original wood lap siding and hardboard trim that has been painted several times. When the paint fails, that wood soaks up water and rots at the bottom edges. On newer homes south of 135th Street, we see more fiber cement and LP SmartSide, where good caulk and the right coating keep the finish looking sharp for years.",
  faq=[["Do you paint homes in both north and south Overland Park?","Yes. We work across all of Overland Park, including ZIP codes 66204, 66207, 66210, 66212, 66213, 66214, 66221, and 66223."],
       ["Do I need HOA approval to change my exterior color?","Many Overland Park neighborhoods have HOAs with color guidelines. We'll help you pick colors and can provide paint names, codes, and samples to submit for approval."]]),
 dict(slug="leawood", name="Leawood", state="KS", county="Johnson County",
  zips=["66206","66209","66211","66224"],
  photo="ext-lake-home", ba="3",
  intro="Leawood homeowners expect a high level of finish, and so do we. Larger homes, detailed trim, stucco, stone accents, and tall elevations call for careful prep, the right equipment, and a crew that respects your landscaping and property.",
  local="Many Leawood homes combine stucco, cedar, and fiber cement on one exterior, and each needs its own prep and coating. Cedar trim and decorative details are especially prone to rot where water collects. We repair those areas with matching material before painting so the finish is as solid as it looks.",
  faq=[["Can you match my HOA's approved colors?","Yes. We work with HOA color palettes regularly and can provide samples and paint specifications for your board's approval."],
       ["Do you paint stucco homes in Leawood?","Yes. We clean, repair hairline cracks, and coat stucco with products made for masonry so it breathes and holds color."]]),
 dict(slug="olathe", name="Olathe", state="KS", county="Johnson County",
  zips=["66061","66062"],
  photo="ext-greige-back", ba="5",
  intro="Olathe has a big mix of homes, from established neighborhoods near downtown to newer subdivisions on the west and south sides. We paint all of them, and many Olathe projects include wood rot repair on trim, garage door jambs, and siding near the ground.",
  local="Builder-grade trim on many Olathe homes from the 1990s and 2000s is starting to fail at the joints and bottom edges. Catching it during a repaint, and replacing it with PVC or LP SmartSide where it makes sense, keeps the problem from spreading.",
  faq=[["Which Olathe ZIP codes do you serve?","We paint homes throughout Olathe, including 66061 and 66062."],
       ["How long does an exterior repaint take on an Olathe home?","Most homes take 3 to 6 working days depending on size and how much wood repair is needed. We'll give you a schedule with your quote."]]),
 dict(slug="lenexa", name="Lenexa", state="KS", county="Johnson County",
  zips=["66215","66219","66220","66227"],
  photo="ext-gray-stucco-ranch", ba="2",
  intro="Lenexa is home base for Arrowhead Painting, and plenty of our neighbors here have trusted us with their homes. From older neighborhoods off 87th Street to newer homes near the City Center and west Lenexa, we know how these houses age.",
  local="We see a lot of hardboard and engineered siding in Lenexa that holds up well when it's sealed but swells and breaks down once water gets behind the paint. Thorough caulking and a quality topcoat are the best protection, and we replace any boards that are already soft.",
  faq=[["Are you based in Lenexa?","Yes. Arrowhead Painting KC is based in Lenexa, so homes here are right in our backyard."],
       ["Which Lenexa ZIP codes do you serve?","All of Lenexa, including 66215, 66219, 66220, and 66227."]]),
 dict(slug="shawnee", name="Shawnee", state="KS", county="Johnson County",
  zips=["66203","66216","66217","66218","66226"],
  photo="ext-charcoal-modern", ba="7",
  intro="Shawnee's rolling, tree-covered neighborhoods are beautiful, but shade and moisture are hard on exteriors. Mildew, slow-drying siding, and rot on the shady sides of the house are common, and they're exactly what our prep and repair process is built to handle.",
  local="Homes in western Shawnee near the river and Mill Creek areas often have heavy tree cover. We wash thoroughly to remove mildew, check shaded walls closely for soft wood, and recommend coatings that resist dirt and mildew buildup.",
  faq=[["Do you serve all of Shawnee?","Yes, including ZIP codes 66203, 66216, 66217, 66218, and 66226."],
       ["What can I do about mildew on my siding?","We power wash and treat mildew before painting. Upgrading to a premium coating like Emerald Rain Refresh helps the surface stay cleaner longer."]]),
 dict(slug="mission-roeland-park", name="Mission, Roeland Park & Prairie Village", short="Mission & Roeland Park", state="KS", county="northeast Johnson County",
  zips=["66202","66205","66208"],
  photo="ext-navy-garage-doors", ba="6",
  intro="The classic post-war homes in Mission, Roeland Park, and Prairie Village have real character: wood siding, brick, detailed trim, and decades of paint layers. Painting them well takes patience and the right prep.",
  local="Older homes in northeast Johnson County often have several layers of paint, some possibly containing lead. We scrape and prepare carefully, repair or replace rotted wood siding and trim, and use primers that lock everything down before the finish coats.",
  faq=[["Do you paint older homes in Prairie Village and Mission?","Yes. Many of our favorite projects are mid-century homes in 66202, 66205, and 66208."],
       ["Can you replace original wood siding that's rotted?","Yes. We replace damaged boards with matching wood or a more durable material like LP SmartSide or James Hardie, then prime and paint so it blends in."]]),
 dict(slug="lees-summit", name="Lee's Summit", state="MO", county="Jackson County",
  zips=["64063","64064","64065","64081","64082","64086","64034"],
  extra_names=["Greenwood"],
  photo="ext-two-story-front", ba="4",
  intro="We paint homes all over Lee's Summit, from the neighborhoods around downtown to the lakes area and the newer subdivisions on the south and west sides, plus nearby Greenwood.",
  local="Lots of Lee's Summit homes were built in the late 1990s and 2000s with engineered siding and trim that is now hitting its first or second repaint. That's the ideal time to catch failing caulk and early rot before it turns into bigger repairs.",
  faq=[["Do you serve Lee's Summit and Greenwood?","Yes, including 64063, 64064, 64065, 64081, 64082, 64086, and Greenwood (64034)."],
       ["Do you paint lake homes around Lake Lotawana and Lakewood?","Yes. Lake homes take extra care with access and protecting docks and landscaping, and we plan for that in your quote."]]),
 dict(slug="blue-springs-belton", name="Blue Springs, Belton & Raymore", short="Blue Springs, Belton & Raymore", state="MO", county="eastern Jackson and Cass counties",
  zips=["64014","64015","64012","64083","64030"],
  extra_names=["Grandview"],
  photo="ext-mustard-split", ba="5",
  intro="East and south of Kansas City, we paint homes in Blue Springs, Belton, Raymore, and Grandview. Wide-open lots mean full sun and wind exposure, and that's tough on paint, caulk, and trim.",
  local="Split-levels and ranches with wood or hardboard siding are common here, and full sun on south and west walls fades color and breaks down caulk faster. A durable coating and elastomeric caulk make a real difference in how long the job lasts.",
  faq=[["Which areas east and south of KC do you serve?","Blue Springs (64014, 64015), Belton (64012), Raymore (64083), and Grandview (64030)."],
       ["My house gets full afternoon sun. Which paint should I choose?","Higher-end coatings like Duration and Emerald Rain Refresh hold color better in full sun. We'll talk through options for your home during the estimate."]]),
 dict(slug="northland", name="the Northland", title_name="The Northland", short="The Northland", state="MO", county="Clay and Platte counties",
  zips=["64118","64119","64151","64152","64153","64154","64155","64156","64157","64158","64163","64164"],
  extra_names=["Parkville","Gladstone","Liberty","North Kansas City"],
  photo="ext-cream-backyard", ba="4",
  intro="North of the river, we paint homes across the Northland: Parkville, Gladstone, the Line Creek and Platte Woods areas, and the fast-growing neighborhoods out toward KCI.",
  local="Northland homes range from 1960s ranches with original wood siding to brand-new construction with LP SmartSide and fiber cement. Older homes usually need wood repair before painting. Newer homes benefit from upgrading builder-grade caulk and paint before problems start.",
  faq=[["Which Northland ZIP codes do you serve?","64118, 64119, 64151, 64152 (Parkville), 64153, 64154, 64155, 64156, 64157, 64158, 64163, and 64164."],
       ["Is it worth repainting a newer home?","Builder-grade paint and caulk often start to fail within 5 to 8 years. Repainting with a quality coating and caulk protects your siding and trim before rot can start."]]),
 dict(slug="kansas-city-mo", name="South Kansas City", title_name="Kansas City, MO", short="Kansas City, MO", state="MO", county="Jackson County",
  zips=["64112","64113","64114","64145"],
  extra_names=["Brookside","Waldo","Martin City"],
  photo="ext-green-two-story", ba="6",
  intro="In Kansas City, Missouri, we paint homes from the Country Club Plaza and Brookside down through Waldo and south KC. These neighborhoods are full of older homes with detailed trim, wood siding, and character worth protecting.",
  local="Older homes in Brookside, Waldo, and around the Plaza often have original wood siding, multiple paint layers, and decorative trim. Careful scraping, priming, and wood repair are what make a repaint on these homes last.",
  faq=[["Which Kansas City, MO neighborhoods do you serve?","We paint homes in 64112, 64113, 64114, and 64145, including Brookside, Waldo, and south Kansas City, plus the Northland."],
       ["Do you work on older homes with lots of trim detail?","Yes. Detailed trim takes more time to prep and paint, and we price and schedule for it so it's done right."]]),
]

def page(a):
    disp = a.get("title_name", a["name"])
    names = [disp] + a.get("extra_names", [])
    title = f"House Painters in {disp}, {a['state']} | Arrowhead Painting KC"
    if len(title) > 65:
        title = f"{a.get('short', disp)} House Painters | Arrowhead Painting"
    desc = f"Exterior painting, wood rot repair, and interior painting in {disp}, {a['state']}. 5.0★ rated, up to a 7-year warranty. Free estimates."
    meta = {"title": title, "description": desc, "path": f"/service-areas/{a['slug']}/", "nav": "about", "og": a["photo"],
            "service": "House painting", "area": disp, "crumbs": [["Service areas", "/service-areas/"], [a.get("short", disp), f"/service-areas/{a['slug']}/"]],
            "priority": "0.7", "faq": a["faq"]}
    zips = "".join(f"<li>{z}</li>" for z in a["zips"])
    others = "".join(f'<li><a href="/service-areas/{o["slug"]}/">{o.get("short", o.get("title_name", o["name"]))}</a></li>' for o in AREAS if o is not a)
    also = f" We also serve {', '.join(a['extra_names'])}." if a.get("extra_names") else ""
    return f'''<!--meta {json.dumps(meta, ensure_ascii=False)} -->

<section class="page-hero">
  <div class="hero-media"><!--#img {a["photo"]}|Home in the Kansas City area freshly painted by Arrowhead Painting|100vw||eager--></div>
  <div class="wrap">
    <div class="page-hero-in hero-in">
      <!--#crumbs-->
      <h1>House painters in {disp}, {a["state"]}</h1>
      <p class="lede">Exterior painting, wood rot repair, and interior painting for {disp} homeowners, backed by up to a 7-year warranty and {{{{rating}}}}-star reviews from your neighbors.</p>
      <div class="hero-actions">
        <a class="btn btn-red btn-lg" href="/contact/">Get a free estimate</a>
        <a class="btn btn-ghost-light btn-lg" href="tel:{{{{tel}}}}">Call {{{{phone}}}}</a>
      </div>
    </div>
  </div>
  <div class="hero-peak" aria-hidden="true"></div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">Painting in {a.get("short", disp)}</p>
      <h2>Local painters who know {disp} homes</h2>
      <p>{a["intro"]}</p>
      <p>{a["local"]}</p>
      <h3 class="mt-2">ZIP codes we serve</h3>
      <ul class="zips">{zips}</ul>
      <p class="muted">Located in {a["county"]}.{also}</p>
    </div>
    <div class="reveal"><!--#ba {a["ba"]}|A recent Kansas City area exterior repaint--></div>
  </div>
</section>

<section class="section bg-mist">
  <div class="wrap">
    <div class="section-head reveal"><p class="kicker">Services in {a.get("short", disp)}</p><h2>What we do for {disp} homeowners</h2></div>
    <div class="cards cards-4">
      <a class="card area-card reveal" href="/exterior-painting/"><h3>Exterior painting</h3><p>Full repaints with power washing, caulk, primer, and Sherwin-Williams paint.</p></a>
      <a class="card area-card reveal" href="/wood-rot-repair/"><h3>Wood rot repair</h3><p>Siding, trim, fascia, and door frames replaced with cedar, LP, Hardie, or PVC.</p></a>
      <a class="card area-card reveal" href="/interior-painting/"><h3>Interior painting</h3><p>Walls, ceilings, trim, doors, and cabinets with a 2-year warranty.</p></a>
      <a class="card area-card reveal" href="/commercial-painting/"><h3>Commercial</h3><p>Offices, retail, rentals, and HOA buildings on your schedule.</p></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head-row reveal"><div class="section-head"><p class="kicker">Reviews</p><h2>What Kansas City homeowners say</h2></div><a class="btn btn-outline" href="/reviews/">All reviews</a></div>
    <div class="reviews-grid"><!--#reviews featured|3--></div>
  </div>
</section>

<section class="section bg-mist">
  <div class="wrap narrow">
    <div class="section-head center reveal"><p class="kicker">FAQ</p><h2>Painting in {disp}</h2></div>
    <!--#faq-->
  </div>
</section>

<section class="section-tight">
  <div class="wrap">
    <h2 class="reveal" style="font-size:clamp(1.8rem,3vw,2.4rem)">Nearby areas we serve</h2>
    <ul class="pill-links">{others}</ul>
  </div>
</section>

<!--#include cta-->
'''

for a in AREAS:
    open(os.path.join(OUT, a["slug"] + ".html"), "w").write(page(a))

# hub page
cards = "\n".join(f'''      <a class="area-card reveal" href="/service-areas/{a["slug"]}/"><h3>{a.get("short", a.get("title_name", a["name"]))}</h3><p>{", ".join(a["zips"])}</p></a>''' for a in AREAS)
allzips = sorted({z for a in AREAS for z in a["zips"]})
hub_meta = {"title": "Service Areas | Kansas City House Painters | Arrowhead",
  "description": "Serving Overland Park, Leawood, Olathe, Lenexa, Shawnee, Mission, Prairie Village, Lee's Summit, Blue Springs, the Northland, and Kansas City, MO.",
  "path": "/service-areas/", "nav": "about", "og": "brand-yard-sign", "crumbs": [["Service areas", "/service-areas/"]], "priority": "0.8"}
hub = f'''<!--meta {json.dumps(hub_meta, ensure_ascii=False)} -->

<section class="page-hero plain">
  <div class="wrap">
    <div class="page-hero-in hero-in">
      <!--#crumbs-->
      <h1>Areas we serve</h1>
      <p class="lede">Arrowhead Painting KC paints homes and businesses across the Kansas City metro on both sides of State Line, from Johnson County to Lee's Summit and the Northland.</p>
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
      <p class="kicker">Every ZIP code we serve</p>
      <h2>Not sure if we cover your street?</h2>
      <p class="lede">If your ZIP code is on this list, we'd love to take a look at your project. If it isn't, give us a call anyway.</p>
      <ul class="zips">{"".join(f"<li>{z}</li>" for z in allzips)}</ul>
      <div class="actions"><a class="btn btn-red" href="/contact/">Get a free estimate</a><a class="btn btn-outline" href="tel:{{{{tel}}}}">Call {{{{phone}}}}</a></div>
    </div>
    <div class="reveal"><div class="photo photo-tall"><!--#img brand-yard-sign|Arrowhead Painting yard sign at a Kansas City project|(min-width: 900px) 45vw, 100vw--></div></div>
  </div>
</section>

<!--#include cta-->
'''
open(os.path.join(OUT, "index.html"), "w").write(hub)
print("areas:", len(AREAS), "zips:", len(allzips))

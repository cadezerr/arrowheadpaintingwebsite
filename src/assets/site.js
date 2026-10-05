// Arrowhead Painting — site interactions (no libraries)
(function () {
  "use strict";
  var doc = document.documentElement;
  // Anything already visible on load stays visible (no flash when JS starts)
  (function () {
    var vh0 = window.innerHeight;
    document.querySelectorAll(".reveal").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh0 && r.bottom > 0) el.classList.add("in", "no-anim");
    });
  })();
  doc.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Header shadow + mobile call bar on scroll ----
  var header = document.querySelector("[data-header]");
  var bar = document.querySelector("[data-mobile-bar]");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (bar) bar.classList.toggle("show", y > 420);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  var menuBtn = document.querySelector("[data-menu-btn]");
  var nav = document.querySelector("[data-nav]");
  function setMenu(open) {
    if (open && header) nav.style.top = Math.round(header.getBoundingClientRect().bottom) + "px";
    nav.classList.toggle("open", open);
    if (!open) document.querySelectorAll(".has-sub.open").forEach(function (o) { o.classList.remove("open"); var t = o.querySelector("[data-sub-toggle]"); if (t) t.setAttribute("aria-expanded", "false"); });
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1020 && nav.classList.contains("open")) setMenu(false); });
  }

  // ---- Dropdown toggles (tap on mobile, keyboard on desktop) ----
  document.querySelectorAll("[data-sub-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest(".has-sub");
      var open = !li.classList.contains("open");
      document.querySelectorAll(".has-sub.open").forEach(function (o) { if (o !== li) { o.classList.remove("open"); o.querySelector("[data-sub-toggle]").setAttribute("aria-expanded", "false"); } });
      li.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) {
    if (window.innerWidth > 1020 && !e.target.closest(".has-sub")) {
      document.querySelectorAll(".has-sub.open").forEach(function (o) { o.classList.remove("open"); });
    }
  });

  // ---- Hero video: start smoothly with no visible hand-off ----
  // The still image underneath is the video's exact first frame. We wait until
  // enough video is buffered to play without stalling, swap to the video while
  // it's still on frame 1 (looks identical), then start playback a frame later.
  var hv = document.querySelector(".hero-video");
  if (hv && !reduce) {
    var started = false;
    var playIt = function () { var p = hv.play && hv.play(); if (p && p.catch) p.catch(function () {}); };
    var go = function () {
      if (started) return; started = true;
      hv.classList.add("is-playing");
      requestAnimationFrame(function () { requestAnimationFrame(playIt); });
    };
    if (hv.readyState >= 4) go();
    else {
      hv.addEventListener("canplaythrough", go, { once: true });
      // Phones that don't buffer until play() is called: start anyway, reveal once moving
      setTimeout(function () {
        if (started) return;
        if (hv.readyState >= 3) { go(); return; }
        hv.addEventListener("playing", function () { if (!started) { started = true; hv.classList.add("is-playing"); } }, { once: true });
        playIt();
      }, 900);
    }
  }

  // ---- Warranty tabs ----
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll("[role=tab]"));
    function pick(t, focus) {
      tabs.forEach(function (o) {
        var on = o === t;
        o.setAttribute("aria-selected", on ? "true" : "false");
        o.tabIndex = on ? 0 : -1;
        document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pick(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true); }
      });
    });
  });

  if (!reduce) {
    // ---- Give reveals some variety + stagger grids ----
    var vhNow = window.innerHeight;
    function onScreen(el) { var r = el.getBoundingClientRect(); return r.top < vhNow && r.bottom > 0; }
    document.querySelectorAll(".split, .split-wide, .reviews-personal, .tl-grid").forEach(function (sp) {
      if (onScreen(sp)) return;
      var kids = Array.prototype.filter.call(sp.children, function (k) { return k.classList.contains("reveal"); });
      if (kids.length === 2) {
        var rev = sp.classList.contains("reverse");
        kids[0].classList.add(rev ? "r-right" : "r-left");
        kids[1].classList.add(rev ? "r-left" : "r-right");
      }
    });
    document.querySelectorAll(".cards, .overview, .gallery, .ba-grid, .posts, .services, .why-list, .faq-jump, .reviews-grid").forEach(function (g) {
      if (onScreen(g)) return;
      var i = 0;
      Array.prototype.forEach.call(g.children, function (k) {
        if (!k.classList.contains("reveal")) k.classList.add("reveal");
        if (!k.classList.contains("r-left") && !k.classList.contains("r-right")) k.classList.add(i % 2 ? "r-up" : "r-zoom");
        k.style.transitionDelay = (i % 6) * 90 + "ms";
        i++;
      });
    });
    document.querySelectorAll(".badges img").forEach(function (b, i) { if (onScreen(b)) return; b.classList.add("reveal", "r-up"); b.style.transitionDelay = i * 110 + "ms"; });
    document.querySelectorAll(".tl li.reveal").forEach(function (li, i) { li.classList.add("r-right"); });

    // ---- Scroll progress, parallax, timeline draw ----
    var prog = document.createElement("div"); prog.className = "scroll-progress"; prog.setAttribute("aria-hidden", "true"); document.body.appendChild(prog);
    var heroMedia = document.querySelector(".hero .hero-media, .page-hero .hero-media");
    var tls = document.querySelectorAll(".tl");
    var stackPhotos = document.querySelectorAll(".photo-stack .photo:nth-child(2)");
    var ticking = false;
    var isPhone = window.matchMedia("(max-width: 760px)").matches;
    function frame() {
      ticking = false;
      var y = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
      prog.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
      if (heroMedia && !isPhone && y < vh * 1.2) heroMedia.style.transform = "translate3d(0," + (y * 0.2).toFixed(1) + "px,0)";
      tls.forEach(function (tl) {
        var r = tl.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
        tl.style.setProperty("--tlp", p.toFixed(3));
      });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    window.addEventListener("resize", frame);
    frame();

    // ---- Cursor glow on the home hero ----
    var hero = document.querySelector(".hero");
    if (hero && window.matchMedia("(pointer: fine)").matches) {
      var mx = null, my = null;
      function glow() {
        if (mx === null) return;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", (mx - r.left).toFixed(0) + "px");
        hero.style.setProperty("--my", (my - r.top).toFixed(0) + "px");
      }
      document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; glow(); }, { passive: true });
      window.addEventListener("scroll", glow, { passive: true });
    }
  }

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---- Before / after sliders ----
  document.querySelectorAll("[data-ba]").forEach(function (fig) {
    var frame = fig.querySelector(".ba-frame");
    var range = fig.querySelector(".ba-range");
    function set(v) { frame.style.setProperty("--pos", v + "%"); }
    range.addEventListener("input", function () { set(range.value); });
    set(range.value);
    // gentle one-time hint when the slider first scrolls into view
    if (!reduce && "IntersectionObserver" in window) {
      var hinted = false;
      new IntersectionObserver(function (en, obs) {
        if (en[0].isIntersecting && !hinted) {
          hinted = true; obs.disconnect();
          var t0 = null;
          function step(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / 1400, 1);
            var v = 50 + Math.sin(p * Math.PI * 2) * 14 * (1 - p);
            set(v); range.value = v;
            if (p < 1) requestAnimationFrame(step); else { set(50); range.value = 50; }
          }
          requestAnimationFrame(step);
        }
      }, { threshold: 0.6 }).observe(frame);
    }
  });

  // ---- Review rail arrows ----
  document.querySelectorAll("[data-rail]").forEach(function (wrap) {
    var rail = wrap.querySelector(".reviews-rail");
    wrap.querySelectorAll("[data-rail-dir]").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = rail.querySelector(".review");
        var dx = card ? card.getBoundingClientRect().width + 22 : 360;
        rail.scrollBy({ left: dx * Number(b.getAttribute("data-rail-dir")), behavior: reduce ? "auto" : "smooth" });
      });
    });
  });

  // ---- Gallery filters ----
  var filters = document.querySelectorAll("[data-filter]");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-filter");
      filters.forEach(function (o) { o.setAttribute("aria-pressed", o === f ? "true" : "false"); });
      document.querySelectorAll("[data-gallery] [data-cat]").forEach(function (item) {
        item.hidden = !(cat === "all" || item.getAttribute("data-cat").split(" ").indexOf(cat) > -1);
      });
    });
  });

  // ---- Lightbox ----
  var lb = document.querySelector("[data-lightbox]");
  if (lb) {
    var lbImg = lb.querySelector("[data-lb-img]");
    var lbCap = lb.querySelector("[data-lb-cap]");
    var list = [], idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + list.length) % list.length;
      var im = list[idx].querySelector("img");
      var srcs = im.getAttribute("srcset").split(",").map(function (s) { return s.trim().split(" ")[0]; });
      lbImg.src = srcs[srcs.length - 1];
      lbImg.alt = im.alt;
      lbCap.textContent = im.alt;
    }
    function open(btn) {
      list = Array.prototype.filter.call(btn.closest("[data-gallery]").querySelectorAll("[data-zoom]"), function (b) { return !b.closest("[hidden]"); });
      lastFocus = btn;
      show(list.indexOf(btn));
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lb.querySelector("[data-lb-close]").focus();
    }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    document.addEventListener("click", function (e) {
      var z = e.target.closest("[data-zoom]");
      if (z) { e.preventDefault(); open(z); }
    });
    lb.querySelector("[data-lb-close]").addEventListener("click", close);
    lb.querySelector("[data-lb-prev]").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector("[data-lb-next]").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  // ---- Services marquee: duplicate cards for a seamless loop ----
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (c) {
      var d = c.cloneNode(true);
      d.setAttribute("aria-hidden", "true");
      d.setAttribute("tabindex", "-1");
      track.appendChild(d);
    });
  });

  // ---- Hide floating estimate tab on the contact page ----
  if (location.pathname.indexOf("/contact") === 0) {
    var fe = document.querySelector("[data-float-estimate]");
    if (fe) fe.hidden = true;
  }

  // ---- Count-up numbers in the stats bar ----
  var counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10), t0 = null;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * e).toFixed(dec);
          if (p < 1) requestAnimationFrame(tick);
        }
        el.textContent = (0).toFixed(dec);
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // ---- Footer year ----
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Quote form ----
  document.querySelectorAll("[data-quote-form]").forEach(function (form) {
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type=submit]");
    var label = submit.textContent;
    form.addEventListener("input", function (e) { if (e.target.checkValidity()) e.target.classList.remove("invalid"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.checkValidity(); });
      bad.forEach(function (el) { el.classList.add("invalid"); });
      if (bad.length) {
        status.className = "form-status err";
        status.textContent = "Please fill in the highlighted fields.";
        bad[0].focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.page = location.pathname;
      submit.disabled = true;
      submit.textContent = "Sending…";
      status.className = "form-status";
      status.textContent = "";
      fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, body: b }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.body && res.body.error);
          form.innerHTML = '<div class="form-done"><h3>Request received</h3><p>Thanks, ' + (data.firstName || "") + '! We\'ll typically typically reach out within one business day to set up your free estimate. Need us sooner? Call <a href="tel:+19134728077">(913) 472-8077</a>.</p></div>';
        })
        .catch(function (err) {
          status.className = "form-status err";
          status.textContent = (err && err.message) || "Your request didn't go through. Please call (913) 472-8077 or try again.";
          submit.disabled = false;
          submit.textContent = label;
        });
    });
  });
})();

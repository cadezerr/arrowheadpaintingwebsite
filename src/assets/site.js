// Arrowhead Painting — site interactions (no libraries)
(function () {
  "use strict";
  var doc = document.documentElement;
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
          form.innerHTML = '<div class="form-done"><h3>Request received</h3><p>Thanks, ' + (data.firstName || "") + '! We\'ll reach out within one business day to set up your free estimate. Need us sooner? Call <a href="tel:+19134728077">(913) 472-8077</a>.</p></div>';
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

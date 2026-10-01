// Mobile menu toggle and quote form submission
(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById("quote-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var submit = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var data = Object.fromEntries(new FormData(form).entries());
    submit.disabled = true;
    submit.textContent = "Sending…";
    status.textContent = "";
    status.className = "form-status";

    fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body && res.body.error);
        form.reset();
        status.textContent = "Request sent. We'll get back to you within one business day.";
        status.className = "form-status ok";
      })
      .catch(function (err) {
        status.textContent = (err && err.message) || "Your request didn't go through. Please call (913) 472-8077 or try again.";
        status.className = "form-status err";
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "Send quote request";
      });
  });
})();

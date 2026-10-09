/* House of Sironko: small site scripts (vanilla JS, no dependencies). */
(function () {
  "use strict";

  var WHATSAPP = "256752700906";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waOpen(lines) {
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header state on scroll
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    var label = toggle.querySelector(".label");
    if (label) label.textContent = open ? "Close" : "Menu";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); toggle.focus(); }
    });
  }

  // Scroll reveal (content is visible without JS; hidden only under .js .reveal)
  var reveals = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Background videos: play only while on screen (saves data and battery on phones)
  var vids = document.querySelectorAll("video.stock-video");
  if (reduceMotion) {
    vids.forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); });
  } else if ("IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.05 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  // Category chips: highlight the section in view
  var chips = document.querySelectorAll(".chips a[href^='#']");
  if (chips.length && "IntersectionObserver" in window) {
    var map = {};
    chips.forEach(function (c) { map[c.getAttribute("href").slice(1)] = c; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          chips.forEach(function (c) { c.classList.remove("is-active"); });
          var chip = map[en.target.id];
          if (chip) {
            chip.classList.add("is-active");
            var bar = chip.closest("ul");
            if (bar) bar.scrollTo({ left: chip.offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Contact enquiry form: no server. Builds a WhatsApp message with the details typed in.
  var form = document.getElementById("enquiry-form");
  if (form) {
    var select = form.querySelector("#service");
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("service");
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = ["Hello House of Sironko! I'd like to place an order.", ""];
      form.querySelectorAll("[data-label]").forEach(function (el) {
        var v = el.tagName === "SELECT" ? el.options[el.selectedIndex].text : String(el.value || "").trim();
        if (v) lines.push(el.getAttribute("data-label") + ": " + v);
      });
      waOpen(lines);
    });
  }

  // Event guest calculator (guide only)
  var est = document.getElementById("estimator");
  if (est) {
    var BIRD = 25000, TRAY = 13000;
    var g = document.getElementById("g-guests"), sh = document.getElementById("g-share"), bf = document.getElementById("g-bfast");
    function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function calc() {
      var guests = Math.max(0, parseInt(g.value, 10) || 0);
      var birds = Math.ceil(guests * parseFloat(sh.value) / 6);
      var trays = bf.checked ? Math.ceil(guests / 15) : 0;
      var cost = birds * BIRD + trays * TRAY;
      var usd = cost / 3700; usd = usd >= 100 ? Math.round(usd / 5) * 5 : Math.round(usd);
      document.getElementById("o-birds").textContent = birds;
      document.getElementById("o-trays").textContent = trays;
      document.getElementById("o-cost").textContent = "UGX " + fmt(cost);
      document.getElementById("o-usd").textContent = "≈ US$" + fmt(usd) + " · indicative";
      return { guests: guests, birds: birds, trays: trays, cost: cost };
    }
    est.addEventListener("input", calc);
    est.addEventListener("change", calc);
    calc();
    est.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = calc();
      waOpen(["Hello House of Sironko! I'm planning an event.", "", "Guests: " + r.guests, "Estimated chickens: " + r.birds, "Trays of eggs: " + r.trays, "Estimate from your website: UGX " + fmt(r.cost), "", "Please send me a quote and available dates."]);
    });
  }

})();

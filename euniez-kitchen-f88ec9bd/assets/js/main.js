/* Eunie's Kitchen: small site scripts (vanilla JS, no dependencies). */
(function () {
  "use strict";

  var WHATSAPP = "256774681493";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".label").textContent = "Menu";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".label").textContent = open ? "Close" : "Menu";
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); }
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

  // Pause background videos when off-screen (saves data and battery on phones)
  var vids = document.querySelectorAll("video.stock-video");
  vids.forEach(function (v) {
    v.addEventListener("playing", function () { v.classList.add("is-playing"); });
    if (!v.paused && v.readyState > 2) v.classList.add("is-playing");
  });
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

  // Menu page: highlight the current category chip while scrolling
  var chips = document.querySelectorAll(".menu-nav a[href^='#']");
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
    var firstId = Object.keys(map)[0], first = document.getElementById(firstId);
    window.addEventListener("scroll", function () {
      if (first && window.scrollY < first.offsetTop - 300) {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        var bar = chips[0].closest("ul"); if (bar && bar.scrollLeft) bar.scrollLeft = 0;
      }
    }, { passive: true });
  }

  // Enquiry form: no server. Builds a WhatsApp message with the details typed in.
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
    var branch = params.get("branch");
    var branchSel = form.querySelector("#branch");
    if (branch && branchSel) {
      for (var j = 0; j < branchSel.options.length; j++) {
        if (branchSel.options[j].value === branch) { branchSel.selectedIndex = j; break; }
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var lines = [
        "Hello Eunie's Kitchen! I found you on your website.",
        "",
        "Name: " + (d.get("name") || ""),
        "Phone: " + (d.get("phone") || ""),
        "I'd like: " + (select ? select.options[select.selectedIndex].text : "")
      ];
      if (d.get("branch")) lines.push("Branch: " + d.get("branch"));
      if (d.get("date")) lines.push("Date: " + d.get("date"));
      if (d.get("guests")) lines.push("Guests: " + d.get("guests"));
      if (d.get("message")) lines.push("", String(d.get("message")));
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }
})();

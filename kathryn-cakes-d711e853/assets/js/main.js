/* Kathryn Cakes: small site scripts (vanilla JS, no dependencies). */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var WHATSAPP = "256774688199";
  var GREETING = "Hello Kathryn Cakes! I found you on your website. Here is my cake order:";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    var l = toggle.querySelector(".nt-label"); if (l) l.textContent = open ? "Close" : "Menu";
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); toggle.focus(); } });
  }

  // Scroll reveal (content is visible without JS; hidden only under .js .reveal)
  var reveals = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.04 });
    reveals.forEach(function (el) { io.observe(el); });
    // Safety net: anything still hidden once the page bottom is reached gets shown
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 40) {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
      }
    }, { passive: true });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Background videos: play only while on screen, never with reduced motion
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

  // Gallery filter
  var fbar = document.querySelector(".filter-bar");
  if (fbar) {
    var figs = document.querySelectorAll("[data-cat]");
    fbar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      fbar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var cat = b.getAttribute("data-filter");
      figs.forEach(function (f) { f.hidden = !(cat === "all" || (" " + f.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") > -1); });
    });
  }

  // Enquiry form: no server. Builds a WhatsApp message from every labelled field.
  var form = document.getElementById("enquiry-form");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    ["service", "occasion", "flavour"].forEach(function (key) {
      var val = params.get(key); if (!val) return;
      var sel = form.querySelector("[name='" + key + "']");
      if (sel && sel.tagName === "SELECT") {
        for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === val) { sel.selectedIndex = i; break; } }
      }
    });
    if ((params.get("occasion") || params.get("flavour")) && window.location.hash !== "#enquiry") {
      var target = document.getElementById("enquiry");
      if (target) setTimeout(function () { target.scrollIntoView(); }, 60);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [GREETING, ""];
      form.querySelectorAll("[data-label]").forEach(function (el) {
        var label = el.getAttribute("data-label"), val = "";
        if (el.tagName === "FIELDSET") {
          var picked = [];
          el.querySelectorAll("input:checked").forEach(function (c) { picked.push(c.value); });
          val = picked.join(", ");
        } else if (el.tagName === "SELECT") {
          val = el.value ? el.options[el.selectedIndex].text : "";
        } else {
          val = (el.value || "").trim();
        }
        if (val) lines.push(label + ": " + val);
      });
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      var msg = document.getElementById("form-msg");
      if (msg) msg.textContent = "WhatsApp is opening with your message. Just press send.";
    });
  }
})();

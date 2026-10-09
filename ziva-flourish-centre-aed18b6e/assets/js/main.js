/* Ziva Flourish Centre: small site scripts (no dependencies). */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "256770491804";

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        toggle.focus();
      }
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Enquiry form: there is no server, so the form composes a WhatsApp
  // message (or an email) with the details filled in and opens it.
  var form = document.getElementById("enquiry-form");
  if (form) {
    // Pre-select the service when arriving from a link like contact.html?service=bakery
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("service");
    var select = form.querySelector("#service");
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }

    function buildMessage() {
      var data = new FormData(form);
      var service = select ? select.options[select.selectedIndex].text : "";
      var lines = [
        "Hello Ziva Flourish Centre, I would like to make an enquiry.",
        "",
        "Name: " + (data.get("name") || ""),
        "Phone: " + (data.get("phone") || ""),
        "Interested in: " + service
      ];
      if (data.get("date")) lines.push("Preferred date: " + data.get("date"));
      if (data.get("message")) lines.push("", String(data.get("message")));
      return lines.join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var via = e.submitter && e.submitter.value === "email" ? "email" : "whatsapp";
      var text = buildMessage();
      if (via === "email") {
        window.location.href = "mailto:thezivaflourish@gmail.com?subject=" +
          encodeURIComponent("Website enquiry") + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
    });
  }
})();

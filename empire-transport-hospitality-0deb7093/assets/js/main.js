/* The Empire Transport & Hospitality Services: site behaviour (vanilla JS). Loaded at the end of <body>. */
(function () {
  'use strict';
  var WA = '256759448758';
  document.documentElement.classList.add('js');

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Fixed header: transparent over the dark hero, solid once you scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // Scroll reveal: content is visible without JS; it is only hidden under .js .reveal
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (el) { io.observe(el); });
    var sweep = function () {
      var h = window.innerHeight;
      els.forEach(function (el) { if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < h) el.classList.add('is-visible'); });
    };
    var t = null;
    window.addEventListener('scroll', function () { if (!t) t = setTimeout(function () { t = null; sweep(); }, 200); }, { passive: true });
    window.addEventListener('load', sweep);
  }
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  function openWA(text) {
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  }
  function today(input) { if (input) input.min = new Date().toISOString().slice(0, 10); }

  // Hero booking card -> WhatsApp
  var form = document.getElementById('book');
  if (form) {
    today(form.elements.date);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements, err = form.querySelector('.form-error');
      var name = f.name.value.trim(), from = f.from.value.trim(), to = f.to.value.trim();
      if (!name || !from || !to) { err.hidden = false; return; }
      err.hidden = true;
      var svc = form.querySelector('input[name="service"]:checked');
      var lines = [
        'Hello Empire Transport & Hospitality, I would like to book:',
        'Service: ' + (svc ? svc.value : ''),
        'From: ' + from,
        'To: ' + to
      ];
      if (f.date.value) lines.push('Date: ' + f.date.value);
      if (f.time.value) lines.push('Time: ' + f.time.value);
      lines.push('Passengers: ' + (f.pax.value || 1));
      if (f.flight.value.trim()) lines.push('Flight: ' + f.flight.value.trim());
      lines.push('Name: ' + name, '', 'Please send me a quote. Thank you!');
      openWA(lines.join('\n'));
    });
  }

  // Contact page booking form -> WhatsApp; ?service=airport-pickup etc. pre-selects
  var enq = document.getElementById('enquiry');
  if (enq) {
    today(enq.elements.date);
    var sel = enq.querySelector('#f-service');
    var pre = new URLSearchParams(window.location.search).get('service');
    if (pre && sel) {
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === pre) { sel.selectedIndex = i; break; } }
    }
    var val = function (n) { var el = enq.elements[n]; return el && el.value ? String(el.value).trim() : ''; };
    enq.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!enq.reportValidity()) return;
      var service = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : 'Not sure yet';
      var lines = [
        'Hello Empire Transport & Hospitality! I found you on your website.',
        '',
        'Name: ' + val('name'),
        'Phone / WhatsApp: ' + val('phone'),
        'Service: ' + service
      ];
      if (val('from')) lines.push('From / pickup: ' + val('from'));
      if (val('to')) lines.push('To / drop-off: ' + val('to'));
      if (val('date')) lines.push('Date: ' + val('date'));
      if (val('time')) lines.push('Time: ' + val('time'));
      if (val('pax')) lines.push('Passengers: ' + val('pax'));
      if (val('flight')) lines.push('Flight number: ' + val('flight'));
      if (val('message')) lines.push('', val('message'));
      lines.push('', 'Please send me a quote. Thank you!');
      openWA(lines.join('\n'));
    });
  }
})();

/* HomeCare by JoyfulHome: small site scripts, no dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var WHATSAPP = '256700143143';
  var root = document.documentElement;
  root.classList.add('js');

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (document.body.classList.contains('nav-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }

  // Scroll reveal: content is visible without JS; it is only hidden under .js .reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { items.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
    // Anything already passed (e.g. jumping to an anchor) shows straight away
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }

  // Pause background videos for reduced motion
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Booking form -> WhatsApp message with the details typed in
  var form = document.getElementById('enquiry-form');
  if (form) {
    var select = form.querySelector('#f-service');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('service');
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }
    var plan = params.get('plan');
    if (plan) {
      var radio = form.querySelector('input[name="hours"][value="' + plan + '"]');
      if (radio) radio.checked = true;
    }

    function val(name) { var el = form.elements[name]; return el && el.value ? String(el.value).trim() : ''; }
    function message() {
      var service = select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
      var hours = form.querySelector('input[name="hours"]:checked');
      var lines = [
        'Hello JoyfulHome! I found you on your website and would like to book care.',
        '',
        'Name: ' + val('name'),
        'Phone: ' + val('phone'),
        'Care needed: ' + service
      ];
      if (hours) lines.push('Hours: ' + hours.value);
      if (val('stage')) lines.push('Due date / baby’s age: ' + val('stage'));
      if (val('start')) lines.push('Care to start: ' + val('start'));
      if (val('area')) lines.push('Area: ' + val('area'));
      if (val('message')) lines.push('', val('message'));
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message());
      var w = window.open(url, '_blank');
      if (w) { w.opener = null; } else { window.location.href = url; }
    });
  }
})();

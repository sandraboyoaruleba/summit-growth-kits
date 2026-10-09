/* Christian Kids Hub: small site scripts, no dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var WHATSAPP = '256773078755';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
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
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }

  // Pause background videos for reduced motion
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Registration form -> WhatsApp message with the details typed in
  var form = document.getElementById('enquiry-form');
  if (form) {
    var select = form.querySelector('#f-service');
    var preset = new URLSearchParams(window.location.search).get('service');
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }
    function val(name) { var el = form.elements[name]; return el && el.value ? String(el.value).trim() : ''; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var service = select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
      var lines = [
        'Hello Christian Kids Hub! I found you on your website.',
        '',
        'Parent: ' + val('parent'),
        'Phone: ' + val('phone'),
        'Interested in: ' + service
      ];
      if (val('child')) lines.push('Child: ' + val('child') + (val('age') ? ' (age ' + val('age') + ')' : ''));
      else if (val('age')) lines.push('Child’s age: ' + val('age'));
      if (val('school')) lines.push('School: ' + val('school'));
      if (val('area')) lines.push('Home area: ' + val('area'));
      if (val('notes')) lines.push('', val('notes'));
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (err) {} } else { window.location.href = url; }
    });
  }
})();

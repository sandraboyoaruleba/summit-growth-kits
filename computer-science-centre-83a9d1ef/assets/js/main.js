(function () {
  'use strict';
  var WA = '256788403753';

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // Job form -> WhatsApp
  var form = document.getElementById('jobForm');
  if (form) {
    var d = form.elements.date;
    if (d) d.min = new Date().toISOString().slice(0, 10);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements, err = form.querySelector('.form-error');
      var name = f.name.value.trim(), details = f.details.value.trim();
      if (!name || !details) { err.hidden = false; return; }
      err.hidden = true;
      var svc = form.querySelector('input[name="service"]:checked');
      var lines = [
        'Hello Computer Science Centre,',
        'Service: ' + (svc ? svc.value : ''),
        'Job: ' + details,
        'Name: ' + name
      ];
      if (f.date.value) lines.push('Needed by: ' + f.date.value);
      lines.push('', 'I will attach my file(s) here. Please confirm the price and when it will be ready. Thank you!');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

(function () {
  'use strict';
  var WA = '256751437004';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Year
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // WhatsApp enquiry form
  var form = document.getElementById('request');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var err = form.querySelector('.form-error');
      if (!f.name.value.trim()) { err.hidden = false; f.name.focus(); return; }
      err.hidden = true;
      var lines = [
        'Hello DLVS, I would like a quotation.',
        'Name: ' + f.name.value.trim(),
        f.phone.value.trim() ? 'Phone: ' + f.phone.value.trim() : '',
        'Service: ' + f.service.value,
        f.location.value.trim() ? 'Land location: ' + f.location.value.trim() : '',
        f.size.value.trim() ? 'Approx. size: ' + f.size.value.trim() : '',
        f.details.value.trim() ? 'Details: ' + f.details.value.trim() : ''
      ].filter(Boolean);
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

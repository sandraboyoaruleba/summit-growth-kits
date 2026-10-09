/* Solargen Ventures — vanilla JS, no dependencies */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        toggle.focus();
      }
    });
  }

  // Scroll reveal (content is visible without JS; hidden only under .js)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // WhatsApp enquiry form -> prefilled wa.me message
  var form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var lines = [
        'Hello Solargen! I would like to get connected to the Bussi mini-grid.',
        '',
        'Name: ' + (d.get('name') || ''),
        'Phone: ' + (d.get('phone') || ''),
        'Connection type: ' + (d.get('type') || ''),
        'Phase: ' + (d.get('phase') || '-'),
        'Village / location: ' + (d.get('area') || '-'),
        '',
        (d.get('message') || '')
      ];
      var url = 'https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n').trim());
      window.open(url, '_blank', 'noopener');
    });
  }
})();

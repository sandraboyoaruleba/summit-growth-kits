/* Takonomia Capital – site behaviour (vanilla JS) */
(function () {
  'use strict';
  var WA = '256778595028'; // Solomon Kato (alt: 256753869152, Mugoya Daniel)
  var waLink = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };

  document.documentElement.classList.add('js');
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
      header.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }

  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  }

  // Listing "Enquire" links prefill the form
  var form = document.getElementById('enquiryForm');
  document.querySelectorAll('.l-link').forEach(function (a) {
    a.addEventListener('click', function () {
      if (form) form.elements.message.value = 'I am interested in: ' + a.getAttribute('data-item') + '.';
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = form.elements;
      if (!el.name.value.trim()) { el.name.classList.add('invalid'); el.name.focus(); return; }
      el.name.classList.remove('invalid');
      var msg = [
        'Hello Takonomia Capital,',
        'My name is ' + el.name.value.trim() + '.',
        'I would like to: ' + el.need.value + '.',
        el.where.value.trim() ? 'Preferred location: ' + el.where.value.trim() : '',
        el.budget.value.trim() ? 'Budget (UGX): ' + el.budget.value.trim() : '',
        el.message.value.trim() ? 'Details: ' + el.message.value.trim() : '',
        '(Sent from the Takonomia Capital website)'
      ].filter(Boolean).join('\n');
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();

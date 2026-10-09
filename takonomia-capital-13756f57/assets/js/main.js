/* Takonomia Capital: site behaviour (vanilla JS, no dependencies). Loaded at the end of <body>. */
(function () {
  'use strict';
  var WA = '256778595028'; // Solomon Kato (alt: 256753869152, Mugoya Daniel)
  var waLink = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  function openWa(url) {
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }
  }

  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Fixed header: transparent over the hero, solid after scrolling
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 40); };
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

  // Reveal: content is visible without JS; it is only hidden under .js .reveal
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Listing filters (listings.html)
  var chips = [].slice.call(document.querySelectorAll('.filters .chip'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { var on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      document.querySelectorAll('#list-grid .listing').forEach(function (card) {
        card.hidden = !(f === 'all' || card.getAttribute('data-type') === f);
        card.classList.add('is-visible');
      });
    });
  });

  // Enquiry form (contact.html): ?service= pre-selects, ?item= pre-fills the message
  var form = document.getElementById('enquiryForm');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('service');
    var sel = form.elements.need;
    if (preset && sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === preset) { sel.selectedIndex = i; break; }
      }
    }
    var item = params.get('item');
    if (item) form.elements.message.value = 'I am interested in: ' + item + ' (sample listing on your website).';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = form.elements;
      var missing = [el.name, el.phone].filter(function (f) { return !f.value.trim(); });
      [el.name, el.phone].forEach(function (f) { f.classList.toggle('invalid', !f.value.trim()); });
      if (missing.length) { missing[0].focus(); return; }
      var msg = [
        'Hello Takonomia Capital,',
        'My name is ' + el.name.value.trim() + '.',
        'Phone / WhatsApp: ' + el.phone.value.trim(),
        'I would like to: ' + sel.options[sel.selectedIndex].text + '.',
        el.where.value.trim() ? 'Preferred location: ' + el.where.value.trim() : '',
        el.budget.value.trim() ? 'Budget (UGX): ' + el.budget.value.trim() : '',
        el.message.value.trim() ? 'Details: ' + el.message.value.trim() : '',
        '(Sent from the Takonomia Capital website)'
      ].filter(Boolean).join('\n');
      openWa(waLink(msg));
    });
  }
})();

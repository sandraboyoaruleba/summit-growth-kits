/* Kiisa Daddies: site behaviour (vanilla JS, no dependencies). Loaded at the end of <body>. */
(function () {
  'use strict';
  // NOTE: the brief gave +254 726 817 063 (Kenyan code) for a Uganda business.
  // Confirm with the owner; if it should be a Ugandan number, update here AND in every page's wa.me / tel: links.
  var WA = '254726817063';
  var waLink = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var fmt = function (n) { return 'UGX ' + n.toLocaleString('en-US'); };
  function openWa(url) {
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }
  }

  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 30); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
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
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Order builder (order.html)
  var packs = [].slice.call(document.querySelectorAll('.pack'));
  var qty = packs.map(function () { return 0; });
  var sumItems = document.getElementById('sumItems');
  var sumTotal = document.getElementById('sumTotal');
  var render = function () {
    var lines = [], total = 0;
    packs.forEach(function (p, i) {
      p.querySelector('output').textContent = qty[i];
      p.classList.toggle('has', qty[i] > 0);
      if (qty[i] > 0) {
        lines.push(qty[i] + ' × ' + p.getAttribute('data-name') + ' (' + fmt(Number(p.getAttribute('data-price'))) + ' each)');
        total += qty[i] * Number(p.getAttribute('data-price'));
      }
    });
    if (sumItems) sumItems.textContent = lines.length ? lines.join(', ') : 'Nothing yet: add a pack above.';
    if (sumTotal) sumTotal.textContent = fmt(total);
    return { lines: lines, total: total };
  };
  packs.forEach(function (p, i) {
    p.querySelector('.plus').addEventListener('click', function () { qty[i] = Math.min(qty[i] + 1, 99); render(); });
    p.querySelector('.minus').addEventListener('click', function () { qty[i] = Math.max(qty[i] - 1, 0); render(); });
  });
  var checkout = document.getElementById('checkout');
  var note = document.getElementById('coNote');
  if (checkout) {
    checkout.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = render();
      if (!o.lines.length) { if (note) note.textContent = 'Add at least one pack first: tap the + buttons above.'; return; }
      if (note) note.textContent = '';
      var el = checkout.elements;
      var msg = ['Hello Kiisa Daddies! I would like to order:']
        .concat(o.lines.map(function (l) { return '• ' + l; }))
        .concat([
          'Estimated total: ' + fmt(o.total),
          el.name.value.trim() ? 'Name: ' + el.name.value.trim() : '',
          el.area.value.trim() ? 'Area / delivery: ' + el.area.value.trim() : '',
          el.when.value.trim() ? 'Needed: ' + el.when.value.trim() : '',
          'Thank you!'
        ]).filter(Boolean).join('\n');
      openWa(waLink(msg));
    });
    render();
  }

  // Contact form (contact.html), pre-selected with ?service=
  var form = document.getElementById('enquiry-form');
  if (form) {
    var select = form.querySelector('#f-service');
    var preset = new URLSearchParams(window.location.search).get('service');
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }
    var val = function (n) { var f = form.elements[n]; return f && f.value ? String(f.value).trim() : ''; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var about = select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : '';
      var lines = ['Hello Kiisa Daddies! I found you on your website.', '', 'Name: ' + val('name'), 'Phone: ' + val('phone'), 'About: ' + about];
      if (val('area')) lines.push('Area: ' + val('area'));
      if (val('when')) lines.push('Date needed: ' + val('when'));
      if (val('message')) lines.push('', val('message'));
      openWa(waLink(lines.join('\n')));
    });
  }
})();

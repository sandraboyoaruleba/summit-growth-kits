/* Kiisa Daddies – site behaviour (vanilla JS) */
(function () {
  'use strict';
  // NOTE: the brief gave +254 726 817 063 (Kenyan code) for a Uganda business.
  // Confirm with the owner; if it should be a Ugandan number, update here AND in index.html links.
  var WA = '254726817063';
  var waLink = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var fmt = function (n) { return 'UGX ' + n.toLocaleString('en-US'); };

  document.documentElement.classList.add('js');
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

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

  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  // Order builder
  var packs = Array.prototype.slice.call(document.querySelectorAll('.pack'));
  var qty = packs.map(function () { return 0; });
  var sumItems = document.getElementById('sumItems');
  var sumTotal = document.getElementById('sumTotal');
  var render = function () {
    var lines = [], total = 0;
    packs.forEach(function (p, i) {
      p.querySelector('output').textContent = qty[i];
      p.classList.toggle('has', qty[i] > 0);
      if (qty[i] > 0) {
        lines.push(qty[i] + ' × ' + p.getAttribute('data-name'));
        total += qty[i] * Number(p.getAttribute('data-price'));
      }
    });
    if (sumItems) sumItems.textContent = lines.length ? lines.join(', ') : 'Nothing yet — add a pack above.';
    if (sumTotal) sumTotal.textContent = fmt(total);
    return { lines: lines, total: total };
  };
  packs.forEach(function (p, i) {
    p.querySelector('.plus').addEventListener('click', function () { qty[i] = Math.min(qty[i] + 1, 99); render(); });
    p.querySelector('.minus').addEventListener('click', function () { qty[i] = Math.max(qty[i] - 1, 0); render(); });
  });

  var form = document.getElementById('checkout');
  var note = document.getElementById('coNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = render();
      if (!o.lines.length) { if (note) note.textContent = 'Add at least one pack first — tap the + buttons above.'; return; }
      if (note) note.textContent = '';
      var el = form.elements;
      var msg = ['Hello Kiisa Daddies! I would like to order:']
        .concat(o.lines.map(function (l) { return '• ' + l; }))
        .concat([
          'Estimated total: ' + fmt(o.total),
          el.name.value.trim() ? 'Name: ' + el.name.value.trim() : '',
          el.area.value.trim() ? 'Area / delivery: ' + el.area.value.trim() : '',
          el.when.value.trim() ? 'Needed: ' + el.when.value.trim() : '',
          'Thank you!'
        ]).filter(Boolean).join('\n');
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
  render();
})();

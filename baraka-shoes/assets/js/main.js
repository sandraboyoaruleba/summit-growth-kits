/* Baraka Shoes Shop – site behaviour (vanilla JS) */
(function () {
  'use strict';
  var WA = '254722248796';
  var waLink = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };

  document.documentElement.classList.add('js');
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // header state
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile nav
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

  // reveal
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  // product filters
  var chips = document.querySelectorAll('.chip');
  var products = document.querySelectorAll('.product');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { var on = c === chip; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
      products.forEach(function (p) {
        var show = f === 'all' || (' ' + p.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
        p.classList.toggle('hidden', !show);
        if (show) p.classList.add('is-visible');
      });
    });
  });

  // product order buttons -> WhatsApp
  document.querySelectorAll('.p-btn').forEach(function (btn) {
    var name = btn.getAttribute('data-product');
    btn.href = waLink('Hello Baraka Shoes, I am interested in the ' + name + '. Do you have my size? My size is: ');
    btn.target = '_blank'; btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Order ' + name + ' on WhatsApp');
  });

  // size select depends on who
  var sizeSel = document.getElementById('sizeSel');
  var form = document.getElementById('finderForm');
  var fillSizes = function (who) {
    if (!sizeSel) return;
    var range = who === 'Kids' ? [20, 38] : who === 'Women' ? [35, 43] : [38, 47];
    var html = '<option>Not sure</option>';
    for (var s = range[0]; s <= range[1]; s++) html += '<option' + (s === (who === 'Kids' ? 30 : who === 'Women' ? 38 : 42) ? ' selected' : '') + '>' + s + '</option>';
    sizeSel.innerHTML = html;
  };
  if (form) {
    fillSizes('Men');
    form.querySelectorAll('input[name="who"]').forEach(function (r) { r.addEventListener('change', function () { fillSizes(r.value); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var who = form.querySelector('input[name="who"]:checked').value;
      var el = form.elements;
      var msg = [
        'Hello Baraka Shoes!' + (el.name.value.trim() ? ' This is ' + el.name.value.trim() + '.' : ''),
        "I'm looking for:",
        '- For: ' + who,
        '- Style: ' + el.style.value,
        '- Size (EU): ' + el.size.value,
        el.colour.value.trim() ? '- Colour: ' + el.colour.value.trim() : '',
        '- Budget: ' + el.budget.value.replace('–', '-'),
        '',
        'Please send me photos of what you have. Thank you!'
      ].filter(function (l, i) { return l !== '' || i === 7; }).join('\n');
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();

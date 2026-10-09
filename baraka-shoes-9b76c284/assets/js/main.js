/* Baraka Shoes Shop: site behaviour (vanilla JS, no dependencies). Loaded at the end of <body>. */
(function () {
  'use strict';
  var WA = '254722248796';
  var waLink = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };

  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // header state
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 10); };
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

  // reveal: content is visible without JS; only hidden under .js .reveal
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
    // safety net: anything above the bottom of the screen shows (e.g. after a jump or a layout shift)
    var sweep = function () {
      var h = window.innerHeight;
      items.forEach(function (el) { if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < h) el.classList.add('is-visible'); });
    };
    var t = null;
    window.addEventListener('scroll', function () { if (!t) t = setTimeout(function () { t = null; sweep(); }, 200); }, { passive: true });
    window.addEventListener('load', sweep);
  }
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // product filters (shop page); #men, #women, #kids, #sport pre-select a filter
  var chips = document.querySelectorAll('.chip[data-filter]');
  var products = document.querySelectorAll('.product');
  function applyFilter(f) {
    var hit = false;
    chips.forEach(function (c) { var on = c.getAttribute('data-filter') === f; if (on) hit = true; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
    if (!hit) return;
    products.forEach(function (p) {
      var show = f === 'all' || (' ' + p.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
      p.classList.toggle('hidden', !show);
      if (show) p.classList.add('is-visible');
    });
  }
  chips.forEach(function (chip) { chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); }); });
  if (chips.length && location.hash) {
    var h = location.hash.slice(1);
    applyFilter(h);
  }

  // product order buttons -> WhatsApp with product name and price
  document.querySelectorAll('.p-btn[data-product]').forEach(function (btn) {
    var name = btn.getAttribute('data-product');
    var card = btn.closest('.product');
    var priceEl = card ? card.querySelector('.price .kes') : null;
    var price = priceEl ? ' (' + priceEl.textContent.replace(/\s+/g, ' ').trim() + ')' : '';
    btn.href = waLink('Hello Baraka Shoes, I am interested in the ' + name + price + '. Do you have my size? My size is: ');
    btn.target = '_blank'; btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Order ' + name + ' on WhatsApp');
  });

  // order / find-my-pair form -> WhatsApp
  var form = document.getElementById('orderForm');
  if (form) {
    var sizeSel = form.querySelector('#f-size');
    var fillSizes = function (who) {
      if (!sizeSel) return;
      var range = who === 'Kids' ? [20, 38] : who === 'Women' ? [35, 43] : [38, 47];
      var def = who === 'Kids' ? 30 : who === 'Women' ? 38 : 42;
      var html = '<option>Not sure</option>';
      for (var s = range[0]; s <= range[1]; s++) html += '<option' + (s === def ? ' selected' : '') + '>' + s + '</option>';
      sizeSel.innerHTML = html;
    };
    var who0 = form.querySelector('input[name="who"]:checked');
    fillSizes(who0 ? who0.value : 'Men');
    form.querySelectorAll('input[name="who"]').forEach(function (r) { r.addEventListener('change', function () { fillSizes(r.value); }); });

    // ?product=school-shoes (or any option value) pre-selects the style
    var params = new URLSearchParams(window.location.search);
    var pre = params.get('product') || params.get('service');
    var sel = form.querySelector('#f-product');
    if (pre && sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === pre) {
          sel.selectedIndex = i;
          var w = sel.options[i].getAttribute('data-who');
          if (w) { var r = form.querySelector('input[name="who"][value="' + w + '"]'); if (r) { r.checked = true; fillSizes(w); } }
          break;
        }
      }
    }
    var val = function (n) { var el = form.elements[n]; return el && el.value ? String(el.value).trim() : ''; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var who = form.querySelector('input[name="who"]:checked');
      var product = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '';
      var get = form.querySelector('input[name="get"]:checked');
      var lines = [
        'Hello Baraka Shoes! I found you on your website.',
        '',
        'Name: ' + val('name'),
        'Phone: ' + val('phone'),
        'Looking for: ' + (product || 'Please advise'),
        'For: ' + (who ? who.value : ''),
        'Size (EU): ' + val('size')
      ];
      if (val('colour')) lines.push('Colour: ' + val('colour'));
      if (val('budget')) lines.push('Budget: ' + val('budget').replace(/–/g, '-'));
      if (get) lines.push('I would like to: ' + get.value);
      if (val('message')) lines.push('', val('message'));
      lines.push('', 'Please send me photos of what you have. Thank you!');
      var url = waLink(lines.join('\n'));
      var win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
  }
})();

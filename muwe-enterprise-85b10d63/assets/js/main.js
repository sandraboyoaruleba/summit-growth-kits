/* Shared site script: menu, reveal, forms. No dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setOffset() { if (header) root.style.setProperty('--hdr-off', Math.max(0, header.getBoundingClientRect().bottom) + 'px'); }
  function setMenu(open) {
    if (!toggle) return;
    setOffset();
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
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
  }

  // Reveal on scroll: content is visible without JS; it is only hidden under .js .reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Enquiry form -> WhatsApp (or email when no number is set), details typed in
  var form = document.getElementById('enquiry-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    params.forEach(function (value, key) {
      var el = form.elements[key];
      if (!el) return;
      if (el.tagName === 'SELECT') {
        for (var i = 0; i < el.options.length; i++) { if (el.options[i].value === value) { el.selectedIndex = i; break; } }
      } else if (el.length && el[0] && el[0].type === 'checkbox') {
        [].forEach.call(el, function (c) { if (c.value === value) c.checked = true; });
      } else if (el.type !== 'checkbox' && el.type !== 'radio') {
        el.value = value;
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [form.getAttribute('data-intro') || 'Hello!', ''];
      [].forEach.call(form.querySelectorAll('[data-label]'), function (el) {
        var label = el.getAttribute('data-label'), v = '';
        if (el.tagName === 'FIELDSET') {
          v = [].map.call(el.querySelectorAll('input:checked'), function (c) { return c.value; }).join(', ');
        } else if (el.tagName === 'SELECT') {
          v = el.selectedIndex > 0 || el.options[0].value ? el.options[el.selectedIndex].text : '';
        } else { v = String(el.value || '').trim(); }
        if (v) lines.push(label + ': ' + v);
      });
      var text = lines.join('\n');
      var wa = form.getAttribute('data-wa');
      var url;
      if (wa) url = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
      else url = 'mailto:' + form.getAttribute('data-email') + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Website enquiry') + '&body=' + encodeURIComponent(text);
      if (wa) { var w = window.open(url, '_blank', 'noopener'); if (!w) window.location.href = url; }
      else window.location.href = url;
      var msg = form.querySelector('.form-status');
      if (msg) msg.textContent = wa ? 'WhatsApp is opening with your message ready to send.' : 'Your email app is opening with your message ready to send.';
    });
  }

  // Block calculator: ~10 blocks per m2 (450 x 225 mm face incl. joints) + 5% breakage
  var bc = document.getElementById('block-calc');
  if (bc) {
    var len = bc.querySelector('#c-len'), hh = bc.querySelector('#c-h'), op = bc.querySelector('#c-open'), sz = bc.querySelector('#c-size');
    var out = bc.querySelector('#c-out'), area = bc.querySelector('#c-area'), send = bc.querySelector('#c-send');
    var calc = function () {
      var a = Math.max(0, (parseFloat(len.value) || 0) * (parseFloat(hh.value) || 0) - (parseFloat(op.value) || 0));
      var n = Math.ceil(a * 10 * 1.05);
      out.textContent = n.toLocaleString('en-US');
      area.textContent = (Math.round(a * 10) / 10).toLocaleString('en-US') + ' m² of wall · incl. 5% breakage';
      send.href = 'contact.html?mat=Concrete%20blocks&qty=' + encodeURIComponent('About ' + n.toLocaleString('en-US') + ' blocks (' + sz.value + '), from the block calculator');
    };
    [len, hh, op, sz].forEach(function (i) { i.addEventListener('input', calc); });
    calc();
  }
  // Concrete calculator: 1:2:4 mix, dry volume x1.54, 50 kg cement bag = 0.0347 m3
  var cc = document.getElementById('conc-calc');
  if (cc) {
    var L = cc.querySelector('#k-l'), W = cc.querySelector('#k-w'), T = cc.querySelector('#k-t');
    var oc = cc.querySelector('#k-cem'), os = cc.querySelector('#k-sand'), oa = cc.querySelector('#k-agg'), ks = cc.querySelector('#k-send'), note = cc.querySelector('.calc-note');
    var r1 = function (x) { return (Math.ceil(x * 10) / 10).toLocaleString('en-US'); };
    var calc2 = function () {
      var wet = (parseFloat(L.value) || 0) * (parseFloat(W.value) || 0) * ((parseFloat(T.value) || 0) / 1000);
      var dry = wet * 1.54;
      var bags = Math.ceil(dry / 7 / 0.0347), s = dry * 2 / 7, g = dry * 4 / 7;
      oc.textContent = bags.toLocaleString('en-US'); os.textContent = r1(s); oa.textContent = r1(g);
      note.textContent = 'Estimate only: ' + r1(wet) + ' m³ of concrete. We confirm quantities and truck sizes with your quote.';
      ks.href = 'contact.html?mat=Sand&qty=' + encodeURIComponent('About ' + bags + ' bags cement, ' + r1(s) + ' m3 sand, ' + r1(g) + ' m3 aggregate (concrete calculator)');
    };
    [L, W, T].forEach(function (i) { i.addEventListener('input', calc2); });
    calc2();
  }
})();

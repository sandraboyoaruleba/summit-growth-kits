/* Cure Spot Pharmacy: small site scripts, no dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!toggle) return;
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
  }

  // Scroll reveal: content is visible without JS; it is only hidden under .js .reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { items.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      items.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-visible'); });
    });
  }

  // Pause background videos for reduced motion
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // Enquiry form -> WhatsApp message with the details typed in.
  // Every field with data-label becomes a line; ticked checkboxes sharing a data-label are joined.
  var form = document.getElementById('enquiry-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    ['service', 'type', 'sector'].forEach(function (key) {
      var v = params.get(key); if (!v) return;
      var sel = form.querySelector('select[name="' + key + '"]');
      if (sel) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === v) { sel.selectedIndex = i; break; } } }
      var radio = form.querySelector('input[type="radio"][name="' + key + '"][value="' + v + '"]');
      if (radio) radio.checked = true;
    });
    var cats = params.get('cat');
    if (cats) cats.split(',').forEach(function (c) {
      var box = form.querySelector('input[type="checkbox"][value="' + c + '"]'); if (box) box.checked = true;
    });

    function message() {
      var lines = [form.getAttribute('data-intro'), ''];
      var groups = {}; var order = [];
      [].slice.call(form.querySelectorAll('[data-label]')).forEach(function (el) {
        var label = el.getAttribute('data-label'); var val = '';
        if (el.type === 'checkbox' || el.type === 'radio') { if (!el.checked) return; val = el.value; }
        else if (el.tagName === 'SELECT') { val = el.selectedIndex >= 0 && el.value ? el.options[el.selectedIndex].text : ''; }
        else { val = String(el.value || '').trim(); }
        if (!val) return;
        if (!(label in groups)) { groups[label] = []; order.push(label); }
        groups[label].push(val);
      });
      order.forEach(function (label) {
        var v = groups[label].join(', ');
        if (v.indexOf('\n') > -1) lines.push(label + ':', v); else lines.push(label + ': ' + v);
      });
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(message());
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
  }

})();

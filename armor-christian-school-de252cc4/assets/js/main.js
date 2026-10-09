/* Armor Christian School: small site scripts, no dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var WHATSAPP = '';
  var root = document.documentElement;
  root.classList.add('js');

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header shadow + header height for the mobile menu
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  function setH() { if (header) root.style.setProperty('--hdr-h', header.getBoundingClientRect().bottom + 'px'); }
  onScroll(); setH();
  window.addEventListener('scroll', function () { onScroll(); }, { passive: true });
  window.addEventListener('resize', setH);

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!toggle) return;
    setH();
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

  // Enquiry form -> WhatsApp (or email when no number is confirmed yet), with the details typed in
  var form = document.getElementById('enquiry-form');
  if (form) {
    var select = form.querySelector('#f-service');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('service');
    if (preset && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === preset) { select.selectedIndex = i; break; }
      }
    }
    function message() {
      var lines = [form.getAttribute('data-intro') || 'Hello!', ''];
      [].slice.call(form.querySelectorAll('[data-label]')).forEach(function (el) {
        var v = '';
        if (el.tagName === 'SELECT') v = el.selectedIndex > 0 ? el.options[el.selectedIndex].text : '';
        else if (el.type === 'radio') { if (!el.checked) return; v = el.value; }
        else v = String(el.value || '').trim();
        if (v) lines.push(el.getAttribute('data-label') + ': ' + v);
      });
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var mail = form.getAttribute('data-mailto');
      var url;
      if (WHATSAPP) url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message());
      else url = 'mailto:' + mail + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Enquiry') + '&body=' + encodeURIComponent(message());
      if (WHATSAPP) { var w = window.open(url, '_blank', 'noopener'); if (!w) window.location.href = url; }
      else window.location.href = url;
    });
  }
})();

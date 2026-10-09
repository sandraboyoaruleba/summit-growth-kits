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
})();

/* Atamba: small site scripts, no dependencies. Loaded at the end of <body>.
   Settings live on <body>: data-wa (WhatsApp number, digits only; leave empty to use email),
   data-email (fallback address) and data-hello (first line of every enquiry message). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var body = document.body;
  var WA = (body.getAttribute('data-wa') || '').replace(/\D/g, '');
  var EMAIL = body.getAttribute('data-email') || '';
  var HELLO = body.getAttribute('data-hello') || 'Hello!';

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Header shadow on scroll + header height for the mobile menu
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  function setH() { if (header) root.style.setProperty('--header-h', header.getBoundingClientRect().bottom + 'px'); }
  onScroll(); setH();
  window.addEventListener('scroll', function () { onScroll(); if (!body.classList.contains('nav-open')) setH(); }, { passive: true });
  window.addEventListener('resize', setH);

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!toggle) return;
    if (open) setH();
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) { setMenu(false); toggle.focus(); }
    });
  }

  // Scroll reveal: content is visible without JS; it is only hidden under .js .reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
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

  // Email buttons switch to WhatsApp automatically once a number is set in data-wa
  if (WA) {
    document.querySelectorAll('[data-wa-swap]').forEach(function (a) {
      a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(HELLO);
      a.target = '_blank'; a.rel = 'noopener';
      a.classList.remove('mail');
      var use = a.querySelector('use'); if (use) use.setAttribute('href', '#i-whatsapp');
      var t = a.querySelector('[data-wa-text]'); if (t) t.textContent = t.getAttribute('data-wa-text');
    });
  }

  // Simple tabs (role="tablist")
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });

  // Enquiry form -> WhatsApp (or email when no number is set) with the details typed in.
  // Fields with data-label are included; ?service=... pre-selects the matching option.
  var form = document.getElementById('enquiry-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    form.querySelectorAll('select[data-param]').forEach(function (sel) {
      var v = params.get(sel.getAttribute('data-param'));
      if (!v) return;
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === v) { sel.selectedIndex = i; break; }
      }
    });
    form.querySelectorAll('input[type="radio"][data-param]').forEach(function (r) {
      if (params.get(r.getAttribute('data-param')) === r.value) r.checked = true;
    });
    function message() {
      var lines = [HELLO, ''];
      var seen = {};
      form.querySelectorAll('[data-label]').forEach(function (el) {
        var label = el.getAttribute('data-label');
        var v = '';
        if (el.type === 'radio') {
          if (seen[el.name]) return;
          seen[el.name] = true;
          var c = form.querySelector('input[name="' + el.name + '"]:checked');
          v = c ? c.value : '';
        } else if (el.tagName === 'SELECT') {
          v = el.selectedIndex > 0 || el.options[0].value ? el.options[el.selectedIndex].text : '';
        } else {
          v = String(el.value || '').trim();
        }
        if (v) lines.push(label + ': ' + v);
      });
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var text = message();
      var url = WA
        ? 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text)
        : 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Website enquiry') + '&body=' + encodeURIComponent(text);
      if (WA) {
        var w = window.open(url, '_blank', 'noopener');
        if (!w) window.location.href = url;
      } else {
        window.location.href = url;
      }
    });
  }
})();

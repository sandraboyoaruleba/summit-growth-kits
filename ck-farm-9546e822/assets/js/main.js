/* CK Farm: small site scripts, no dependencies. Loaded at the end of <body>. */
(function () {
  'use strict';
  var WHATSAPP = '256752557746';
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

  // Enquiry form -> WhatsApp message with the details already typed
  var form = document.getElementById('enquiry-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    params.forEach(function (value, key) {
      var els = form.querySelectorAll('[name="' + key + '"]');
      els.forEach(function (el) {
        if (el.tagName === 'SELECT') {
          for (var i = 0; i < el.options.length; i++) { if (el.options[i].value === value) { el.selectedIndex = i; break; } }
        } else if (el.type === 'radio' || el.type === 'checkbox') {
          if (el.value === value) el.checked = true;
        }
      });
    });

    function message() {
      var lines = [form.getAttribute('data-hello') || 'Hello!', ''];
      var seen = {};
      [].slice.call(form.elements).forEach(function (el) {
        if (!el.name || seen[el.name] || el.type === 'submit' || el.tagName === 'BUTTON') return;
        var label = el.getAttribute('data-label') || (el.closest('fieldset') && el.closest('fieldset').getAttribute('data-label')) || el.name;
        var value = '';
        if (el.type === 'radio' || el.type === 'checkbox') {
          seen[el.name] = true;
          value = [].slice.call(form.querySelectorAll('[name="' + el.name + '"]:checked')).map(function (c) { return c.value; }).join(', ');
        } else if (el.tagName === 'SELECT') {
          value = el.selectedIndex > 0 || (el.options[el.selectedIndex] && el.options[el.selectedIndex].value) ? el.options[el.selectedIndex].text : '';
        } else {
          value = String(el.value || '').trim();
        }
        if (!value) return;
        if (el.tagName === 'TEXTAREA') lines.push('', label + ':', value);
        else lines.push(label + ': ' + value);
      });
      return lines.join('\n');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message());
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    });
  }
})();

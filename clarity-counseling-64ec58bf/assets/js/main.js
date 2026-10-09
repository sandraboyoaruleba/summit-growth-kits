/* Clarity Counseling & Training Centre: site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Sticky header shadow
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setNav(false); toggle.focus(); }
    });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // "Book" buttons pre-select the service (and format) in the booking form
  var typeSelect = document.getElementById('f-type');
  document.querySelectorAll('[data-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeSelect) {
        var want = btn.getAttribute('data-pick');
        Array.prototype.forEach.call(typeSelect.options, function (o) { if (o.text === want) typeSelect.value = o.value || o.text; });
      }
      var fmt = btn.getAttribute('data-format');
      if (fmt) {
        document.querySelectorAll('input[name="format"]').forEach(function (r) { r.checked = r.value.indexOf(fmt) === 0; });
      }
    });
  });

  // Booking form: builds a prefilled WhatsApp message (no backend, nothing stored)
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lines = [form.getAttribute('data-intro') || 'Hello!'];
      form.querySelectorAll('[name]').forEach(function (field) {
        if (!field.getAttribute('data-label')) return;
        if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;
        var val = (field.value || '').trim();
        if (!val) return;
        lines.push('• ' + field.getAttribute('data-label') + ': ' + val);
      });
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  });
})();

(function () {
  'use strict';
  var WA = '256789256470';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Year
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // WhatsApp enquiry form
  var form = document.getElementById('brief-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var err = form.querySelector('.form-error');
      if (!f.name.value.trim()) { err.hidden = false; f.name.focus(); return; }
      err.hidden = true;
      var needs = Array.prototype.map.call(form.querySelectorAll('input[name="need"]:checked'), function (c) { return c.value; });
      var lines = [
        'Hello JorartS MEDIA! I have a project brief.',
        'Name: ' + f.name.value.trim(),
        f.org.value.trim() ? 'Organisation: ' + f.org.value.trim() : '',
        needs.length ? 'Needs: ' + needs.join(', ') : '',
        f.date.value ? 'Date / deadline: ' + f.date.value : '',
        'Budget: ' + f.budget.value,
        f.message.value.trim() ? 'Brief: ' + f.message.value.trim() : ''
      ].filter(Boolean);
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

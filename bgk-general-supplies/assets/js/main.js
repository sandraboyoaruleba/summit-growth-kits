(function () {
  'use strict';
  var WA = '256757925917';

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // WhatsApp order builder
  var form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = form.querySelector('.form-error');
      var items = [];
      form.querySelectorAll('.qty-grid input').forEach(function (i) {
        var v = parseFloat(i.value);
        if (v > 0) items.push('• ' + i.name + ': ' + v + ' kg');
      });
      var name = form.elements.name.value.trim();
      if (!name || !items.length) { err.hidden = false; return; }
      err.hidden = true;
      var lines = [
        'Hello BGK General Supplies, I would like to order:',
        items.join('\n'),
        '',
        'Name: ' + name,
        'Buying for: ' + form.elements.type.value,
        'Pick up / delivery: ' + form.elements.delivery.value
      ];
      var loc = form.elements.location.value.trim();
      if (loc) lines.push('Location: ' + loc);
      var notes = form.elements.notes.value.trim();
      if (notes) lines.push('Notes: ' + notes);
      lines.push('', 'Please send me today\'s prices and total. Thank you!');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

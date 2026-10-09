(function () {
  'use strict';
  var WA = '256752557746';

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

  // Order form -> WhatsApp
  var form = document.getElementById('orderForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements, err = form.querySelector('.form-error');
      var products = Array.prototype.slice.call(form.querySelectorAll('input[name="product"]:checked')).map(function (i) { return i.value; });
      var name = f.name.value.trim();
      if (!name || !products.length) { err.hidden = false; return; }
      err.hidden = true;
      var lines = ['Hello CK Farm, I would like to order:'];
      products.forEach(function (p) {
        var q = p === 'Coffee' ? f.coffeeQty.value.trim() : f.bananaQty.value.trim();
        lines.push('• ' + p + (q ? ': ' + q : ''));
      });
      lines.push('', 'Name: ' + name, 'Buyer type: ' + f.buyer.value);
      if (f.place.value.trim()) lines.push('Collection / delivery: ' + f.place.value.trim());
      if (f.notes.value.trim()) lines.push('Message: ' + f.notes.value.trim());
      lines.push('', 'Please confirm availability and price. Thank you!');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

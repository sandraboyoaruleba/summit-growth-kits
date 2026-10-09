(function () {
  'use strict';
  var WA = '256774688199';

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

  // Occasion tiles preselect the occasion in the order form
  document.querySelectorAll('[data-occasion]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.querySelector('#order-form select[name="occasion"]');
      if (!sel) return;
      for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text === a.getAttribute('data-occasion')) { sel.selectedIndex = i; } }
    });
  });

  // WhatsApp order form
  var form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var err = form.querySelector('.form-error');
      if (!f.name.value.trim()) { err.hidden = false; f.name.focus(); return; }
      err.hidden = true;
      var collect = form.querySelector('input[name="collect"]:checked');
      var lines = [
        'Hello Kathryn Cakes! I would like to order a cake.',
        'Name: ' + f.name.value.trim(),
        f.phone.value.trim() ? 'Phone: ' + f.phone.value.trim() : '',
        'Occasion: ' + f.occasion.value,
        f.date.value ? 'Date needed: ' + f.date.value : '',
        'Flavour: ' + f.flavour.value,
        'Size: ' + f.size.value,
        collect ? 'Pick-up / delivery: ' + collect.value : '',
        f.message.value.trim() ? 'Message / design: ' + f.message.value.trim() : ''
      ].filter(Boolean);
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();

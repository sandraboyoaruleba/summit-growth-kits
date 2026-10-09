/* Atamba – site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';

  // Contact settings. When a WhatsApp number is confirmed, put digits only here
  // (e.g. '2567XXXXXXXX') and the form + floating button will switch to WhatsApp.
  var CONFIG = {
    whatsapp: '',
    email: 'cnerima@yahoo.com'
  };

  var doc = document.documentElement;
  doc.classList.add('js');

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        nav.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); toggle.focus(); }
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
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  }

  // Floating button: WhatsApp if configured
  var floatBtn = document.getElementById('floatMsg');
  if (floatBtn && CONFIG.whatsapp) {
    floatBtn.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Hello Dr. Nerima, I found Atamba online and would like to ask about an assessment for my child.');
    floatBtn.target = '_blank';
    floatBtn.rel = 'noopener';
  }

  // Enquiry form -> WhatsApp (if configured) or prefilled email
  var form = document.getElementById('bookForm');
  if (form) {
    var note = document.getElementById('formNote');
    if (CONFIG.whatsapp && note) note.textContent = 'Opens WhatsApp with your message ready to send.';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name;
      if (!name.value.trim()) { name.classList.add('invalid'); name.focus(); return; }
      name.classList.remove('invalid');
      var lines = [
        'Hello Dr. Nerima,',
        '',
        'My name is ' + name.value.trim() + '.',
        'I would like help with: ' + form.elements.topic.value + '.',
        form.elements.age.value.trim() ? "Child's age: " + form.elements.age.value.trim() : '',
        form.elements.phone.value.trim() ? 'My phone: ' + form.elements.phone.value.trim() : '',
        form.elements.message.value.trim() ? '\n' + form.elements.message.value.trim() : '',
        '',
        '(Sent from the Atamba website)'
      ].filter(function (l, i, a) { return l !== '' || (a[i - 1] !== ''); });
      var text = lines.join('\n');
      if (CONFIG.whatsapp) {
        window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      } else {
        window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Assessment enquiry – ' + name.value.trim()) + '&body=' + encodeURIComponent(text);
      }
    });
  }
})();

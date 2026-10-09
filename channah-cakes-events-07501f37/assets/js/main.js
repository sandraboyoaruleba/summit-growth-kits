(function () {
  var WA = '254721868212';
  var header = document.querySelector('.header');
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  });

  // reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-visible'); }); }

  // tabs (accessible)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus();
    });
  });

  // min date = today
  var date = document.getElementById('f-date');
  try { date.min = new Date().toISOString().slice(0, 10); } catch (e) {}

  // WhatsApp form
  var form = document.getElementById('orderForm');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    ['name', 'date'].forEach(function (k) {
      var bad = !f[k].value.trim(); f[k].classList.toggle('is-invalid', bad); if (bad) ok = false;
    });
    var wants = Array.prototype.slice.call(form.querySelectorAll('input[name="want"]:checked')).map(function (c) { return c.value; });
    if (!ok) { msg.textContent = 'Please add your name and the date you need it.'; return; }
    if (!wants.length) { msg.textContent = 'Pick at least one treat.'; return; }
    msg.textContent = '';
    var text = 'Hello Channah Cakes & Events! 🎂\n\n' +
      'Name: ' + f.name.value.trim() + '\n' +
      'I would like: ' + wants.join(', ') + '\n' +
      'Occasion: ' + f.occ.value + '\n' +
      'Date needed: ' + f.date.value + '\n' +
      'Cake size: ' + f.size.value + '\n' +
      'Flavour: ' + f.flav.value +
      (f.idea.value.trim() ? '\nDesign / message: ' + f.idea.value.trim() : '') +
      (f.loc.value.trim() ? '\nDelivery area: ' + f.loc.value.trim() : '');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

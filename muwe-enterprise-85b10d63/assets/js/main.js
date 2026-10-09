(function () {
  var WA = '256757500761';
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-visible'); }); }

  // block calculator: ~10 blocks per m² (450x225 face incl. joints) + 5% breakage
  var len = document.getElementById('c-len'), h = document.getElementById('c-h'), op = document.getElementById('c-open');
  var out = document.getElementById('c-out'), area = document.getElementById('c-area');
  var blocks = 0;
  function calc() {
    var a = Math.max(0, (parseFloat(len.value) || 0) * (parseFloat(h.value) || 0) - (parseFloat(op.value) || 0));
    blocks = Math.ceil(a * 10 * 1.05);
    out.textContent = blocks.toLocaleString('en-US');
    area.textContent = (Math.round(a * 10) / 10).toLocaleString('en-US') + ' m² of wall';
  }
  [len, h, op].forEach(function (i) { i.addEventListener('input', calc); });
  calc();
  document.getElementById('c-send').addEventListener('click', function () {
    var q = document.getElementById('q-qty');
    if (blocks > 0) q.value = 'About ' + blocks.toLocaleString('en-US') + ' concrete blocks (from block calculator)';
  });

  // preselect type from CTA
  document.querySelectorAll('[data-type]').forEach(function (b) {
    b.addEventListener('click', function () { document.getElementById('q-type').value = b.dataset.type; });
  });

  // quote form -> WhatsApp
  var form = document.getElementById('quoteForm');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    ['name', 'loc'].forEach(function (k) { var bad = !f[k].value.trim(); f[k].classList.toggle('is-invalid', bad); if (bad) ok = false; });
    var mats = Array.prototype.slice.call(form.querySelectorAll('input[name="mat"]:checked')).map(function (c) { return c.value; });
    if (!ok) { msg.textContent = 'Please add your name and location.'; return; }
    if (!mats.length) { msg.textContent = 'Please choose at least one material.'; return; }
    msg.textContent = '';
    var text = 'Hello Muwe Enterprise! I would like a quote.\n\n' +
      'Name: ' + f.name.value.trim() + '\n' +
      'I am a: ' + f.type.value + '\n' +
      'Materials: ' + mats.join(', ') +
      (f.qty.value.trim() ? '\nQuantities: ' + f.qty.value.trim() : '') + '\n' +
      'Location: ' + f.loc.value.trim() +
      (f.when.value ? '\nNeeded by: ' + f.when.value : '');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

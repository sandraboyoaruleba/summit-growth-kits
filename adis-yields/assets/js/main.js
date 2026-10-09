(function () {
  var WA = '256751158666';
  var header = document.querySelector('.header');
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  // sticky header shadow
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  });

  // reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-visible'); }); }

  // crate visual
  var qty = document.getElementById('f-qty');
  var viz = document.getElementById('crateViz');
  var sum = document.getElementById('crateSum');
  for (var i = 0; i < 30; i++) viz.appendChild(document.createElement('i'));
  function render() {
    var n = Math.max(1, Math.min(500, parseInt(qty.value, 10) || 1));
    var eggs = viz.children;
    var lit = Math.min(30, n * 3);
    for (var j = 0; j < eggs.length; j++) eggs[j].classList.toggle('on', j < lit);
    sum.textContent = n + (n === 1 ? ' crate · ' : ' crates · ') + (n * 30).toLocaleString() + ' eggs';
  }
  qty.addEventListener('input', render);
  document.querySelectorAll('.qty button').forEach(function (b) {
    b.addEventListener('click', function () {
      qty.value = Math.max(1, Math.min(500, (parseInt(qty.value, 10) || 1) + parseInt(b.dataset.step, 10)));
      render();
    });
  });
  render();

  // WhatsApp order form
  var form = document.getElementById('orderForm');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ok = true;
    ['name', 'loc'].forEach(function (k) {
      var bad = !f[k].value.trim();
      f[k].classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = 'Please add your name and delivery location.'; return; }
    msg.textContent = '';
    var text = 'Hello Adis Yields! I would like to order eggs.\n\n' +
      'Name: ' + f.name.value.trim() + '\n' +
      'Ordering for: ' + f.type.value + '\n' +
      'Crates: ' + f.qty.value + ' (' + (f.qty.value * 30) + ' eggs)\n' +
      'Frequency: ' + f.freq.value + '\n' +
      'Location: ' + f.loc.value.trim() +
      (f.note.value.trim() ? '\nNotes: ' + f.note.value.trim() : '');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

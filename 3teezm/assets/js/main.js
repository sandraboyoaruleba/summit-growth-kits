(function () {
  var WA = '256701359380';
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-visible'); }); }

  // form: switch fields by line
  var form = document.getElementById('orderForm');
  var qtyLabel = document.getElementById('qtyLabel');
  var qty = document.getElementById('f-qty');
  var noteLabel = document.getElementById('noteLabel');
  var note = document.getElementById('f-note');
  var copy = {
    Taste: ['Quantity', 'e.g. 3 chickens, 2 sausage packs', 'Location & notes', 'e.g. Delivery to Kira, after 5pm'],
    Treats: ['Quantity', 'e.g. 2 packs, 1 gift jar', 'Location & notes', 'e.g. For a birthday on Saturday'],
    Talent: ['Organisation & team size', 'e.g. Bright Kids School, 25 staff', 'Your HR challenge', 'e.g. We need proper contracts and a staff handbook']
  };
  function setLine(line) {
    form.querySelectorAll('[data-for]').forEach(function (f) { f.hidden = f.dataset.for !== line; });
    qtyLabel.textContent = copy[line][0]; qty.placeholder = copy[line][1];
    noteLabel.textContent = copy[line][2]; note.placeholder = copy[line][3];
  }
  form.querySelectorAll('input[name="line"]').forEach(function (r) {
    r.addEventListener('change', function () { setLine(r.value); });
  });
  // CTA buttons preselect the line
  document.querySelectorAll('[data-line]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = form.querySelector('input[name="line"][value="' + b.dataset.line + '"]');
      if (r) { r.checked = true; setLine(b.dataset.line); }
      if (b.dataset.bundle) { var s = document.getElementById('f-talent'); s.value = 'Team Day bundle (workshop + food)'; }
    });
  });
  setLine('Taste');

  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    f.name.classList.toggle('is-invalid', !name);
    if (!name) { msg.textContent = 'Please add your name.'; return; }
    msg.textContent = '';
    var line = form.querySelector('input[name="line"]:checked').value;
    var item = line === 'Taste' ? f.taste.value : line === 'Treats' ? f.treats.value : f.talent.value;
    var heads = { Taste: 'Food order (chicken / sausages)', Treats: 'Cookie order', Talent: 'HR consulting enquiry' };
    var text = 'Hello Racheal / 3TeezM!\n\n' + heads[line] + '\n' +
      'Name: ' + name + '\n' +
      (line === 'Talent' ? 'Service: ' : 'Item: ') + item +
      (f.qty.value.trim() ? '\n' + qtyLabel.textContent + ': ' + f.qty.value.trim() : '') +
      (f.when.value ? '\nDate: ' + f.when.value : '') +
      (f.note.value.trim() ? '\n' + noteLabel.textContent + ': ' + f.note.value.trim() : '');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

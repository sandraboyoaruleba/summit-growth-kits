/* Vanilla JS: nav, reveal, WhatsApp enquiry form, menu tabs, year */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Sticky header state
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Scroll reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Menu tabs (if present)
  var tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var list = tab.closest('[role="tablist"]');
      list.querySelectorAll('[role="tab"]').forEach(function (t) {
        t.setAttribute('aria-selected', 'false');
        t.tabIndex = -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = true;
      });
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = false;
    });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var all = Array.prototype.slice.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'));
      var i = all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1);
      var next = all[(i + all.length) % all.length];
      next.focus();
      next.click();
    });
  });

  // WhatsApp enquiry form: builds a prefilled wa.me message (no backend)
  document.querySelectorAll('form[data-wa], form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [form.getAttribute('data-wa-intro') || 'Hello!'];
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!f.name || !f.value.trim()) return;
        var label = form.querySelector('label[for="' + f.id + '"]');
        lines.push((label ? label.textContent.replace(/\s*\*$/, '').trim() : f.name) + ': ' + f.value.trim());
      });
      if (form.hasAttribute('data-wa')) {
        window.open('https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      } else {
        window.location.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Website enquiry') + '&body=' + encodeURIComponent(lines.join('\n'));
      }
    });
  });
})();

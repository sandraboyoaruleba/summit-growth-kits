/* Site behaviour — vanilla JS, no dependencies */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Sticky header state
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        toggle.focus();
      }
    });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    // safety net: anything above the bottom of the screen shows (after a jump or a layout shift)
    var sweep = function () {
      var h = window.innerHeight;
      reveals.forEach(function (el) { if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < h) el.classList.add('is-visible'); });
    };
    var sweepT = null;
    window.addEventListener('scroll', function () { if (!sweepT) sweepT = setTimeout(function () { sweepT = null; sweep(); }, 200); }, { passive: true });
    window.addEventListener('load', sweep);
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Tabs (menu / programmes etc.)
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    function activate(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab); });
      tab.addEventListener('keydown', function (e) {
        var idx = null;
        if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
        if (idx !== null) { e.preventDefault(); tabs[idx].focus(); activate(tabs[idx]); }
      });
    });
    var initial = group.querySelector('[aria-selected="true"]') || tabs[0];
    if (initial) activate(initial);
  });

  if (reduceMotion) document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  // ?service=micr (etc.) pre-selects the interest on the booking form
  var pre = new URLSearchParams(window.location.search).get('service');
  var sel = document.getElementById('f-service');
  if (pre && sel) {
    for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].value === pre) { sel.selectedIndex = i; break; } }
  }

  // WhatsApp enquiry forms: build a prefilled wa.me message (no backend)
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lines = [form.getAttribute('data-intro') || 'Hello!'];
      form.querySelectorAll('[name]').forEach(function (field) {
        if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;
        var val = (field.value || '').trim();
        if (field.tagName === 'SELECT' && field.selectedIndex > -1) val = field.options[field.selectedIndex].text.trim();
        if (!val) return;
        var label = field.getAttribute('data-label') || field.name;
        lines.push('• ' + label + ': ' + val);
      });
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
  });
})();

/* BNML site — navigation, filtering, gallery lightbox */
(function () {
  'use strict';

  /* ---------------------------------------------------------- mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('primary-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = toggle.querySelector('.label');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && window.matchMedia('(max-width: 960px)').matches) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && menu.classList.contains('open')) setMenu(false);
    });
  }

  /* ------------------------------------------------------- header on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('scrolled', y > 12);
      document.body.classList.toggle('hdr-compact', y > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ reveal anim */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reveals.length) {
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------- list filtering */
  function initFilter(root) {
    var search = root.querySelector('[data-filter-search]');
    var year = root.querySelector('[data-filter-year]');
    var chips = [].slice.call(root.querySelectorAll('[data-filter-status]'));
    var items = [].slice.call(root.querySelectorAll('[data-item]'));
    var count = root.querySelector('[data-filter-count]');
    var empty = root.querySelector('[data-empty]');
    var jumps = [].slice.call(root.querySelectorAll('[data-jump]'));
    var status = 'all', frame = null;

    function apply() {
      frame = null;
      var q = search ? search.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var shown = 0;
      items.forEach(function (el) {
        var okQ = !q || (el.getAttribute('data-text') || '').indexOf(q) !== -1;
        var okY = !y || el.getAttribute('data-year') === y;
        var okS = status === 'all' ||
          (el.getAttribute('data-status') || '').split(' ').indexOf(status) !== -1;
        var show = okQ && okY && okS;
        el.classList.toggle('is-hidden', !show);
        if (show) shown++;
      });
      if (count) count.textContent = shown;
      if (empty) empty.classList.toggle('show', shown === 0);
      jumps.forEach(function (j) {
        j.classList.toggle('active', j.getAttribute('data-jump') === y);
      });
    }

    function queue() {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    }

    if (search) search.addEventListener('input', queue);
    if (year) year.addEventListener('change', apply);
    chips.forEach(function (btn) {
      btn.addEventListener('click', function () {
        status = btn.getAttribute('data-filter-status');
        chips.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
    });
    jumps.forEach(function (j) {
      j.addEventListener('click', function () {
        if (!year) return;
        var target = j.getAttribute('data-jump');
        year.value = year.value === target ? '' : target;
        apply();
        var list = root.querySelector('.pub-list, .patent-grid');
        if (list) {
          var top = list.getBoundingClientRect().top + window.scrollY - 140;
          if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    if (search) {
      var form = search.closest('form');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    apply();
  }
  [].slice.call(document.querySelectorAll('[data-filter]')).forEach(initFilter);

  /* ------------------------------------------------------------- lightbox */
  var lb = document.querySelector('.lightbox');
  var triggers = [].slice.call(document.querySelectorAll('[data-gallery-item]'));
  if (lb && triggers.length) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var lbCount = lb.querySelector('.lb-count');
    var index = 0;
    var lastFocus = null;

    function render() {
      var el = triggers[index];
      var full = el.getAttribute('data-full');
      var cap = el.getAttribute('data-caption') || '';
      lbImg.src = full;
      lbImg.alt = el.querySelector('img') ? el.querySelector('img').alt : cap;
      if (lbCap) lbCap.textContent = cap;
      if (lbCount) lbCount.textContent = (index + 1) + ' / ' + triggers.length;
    }
    function open(i) {
      index = i;
      lastFocus = document.activeElement;
      render();
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var close = lb.querySelector('.lb-close');
      if (close) close.focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    }
    function step(d) {
      index = (index + d + triggers.length) % triggers.length;
      render();
    }
    triggers.forEach(function (el, i) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    var prev = lb.querySelector('.lb-prev');
    var next = lb.querySelector('.lb-next');
    var closeBtn = lb.querySelector('.lb-close');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }
})();

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
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
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
    var yearSelect = root.querySelector('[data-filter-year]');
    var chips = [].slice.call(root.querySelectorAll('[data-filter-status]'));
    var items = [].slice.call(root.querySelectorAll('[data-item]'));
    var count = root.querySelector('[data-filter-count]');
    var empty = root.querySelector('[data-empty]');
    var jumps = [].slice.call(root.querySelectorAll('[data-jump]'));
    /* the year lives here, not in a <select>: the publications page keeps only the
       year buttons, so nothing else has to be present for them to work */
    var year = yearSelect ? yearSelect.value : '';
    var status = 'all', frame = null;

    function apply() {
      frame = null;
      var q = search ? search.value.trim().toLowerCase() : '';
      var y = year;
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
        var t = j.getAttribute('data-jump') || 'all';
        var on = (t === 'all' ? '' : t) === year;
        j.classList.toggle('active', on);
        j.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function queue() {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    }

    if (search) search.addEventListener('input', queue);
    if (yearSelect) yearSelect.addEventListener('change', function () {
      year = yearSelect.value;
      apply();
    });
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
        var target = j.getAttribute('data-jump') || 'all';
        year = (target === 'all' || target === year) ? '' : target;
        if (yearSelect) yearSelect.value = year;
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

  /* --------------------------------------------- gallery cards & lightbox
     A gallery card may hold several photos of the same event: they crossfade
     in place (badge and dots show where we are) and pause while the pointer or
     the keyboard is on the card, or while the card is off screen. The viewer
     walks every photo of every card in page order, starting from the photo the
     card is showing. */
  var cards = [].slice.call(document.querySelectorAll('[data-gallery-item]'));
  if (cards.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var INTERVAL = 3400;
    var frames = [];

    cards.forEach(function (card) {
      var imgs = [].slice.call(card.querySelectorAll('.gal-frame'));
      var data = null;
      var raw = card.getAttribute('data-frames');
      if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
      var capEl = card.closest('figure') ? card.closest('figure').querySelector('.gal-cap') : null;
      var capTitle = capEl && capEl.querySelector('.gal-title') ? capEl.querySelector('.gal-title').textContent : '';
      var capDate = capEl && capEl.querySelector('.gal-date') ? capEl.querySelector('.gal-date').textContent : '';
      var caption = [capTitle, capDate].filter(Boolean).join(' · ');
      card._imgs = imgs;
      card._cur = 0;
      card._offset = frames.length;
      if (data && data.length) {
        data.forEach(function (f, i) {
          frames.push({
            full: f.s,
            alt: f.a || caption,
            caption: caption + (data.length > 1 ? ' · ' + (i + 1) + '/' + data.length : '')
          });
        });
      } else {
        var own = card.querySelector('img');
        frames.push({
          full: card.getAttribute('data-full') || (own ? own.src : ''),
          alt: own ? own.alt : caption,
          caption: card.getAttribute('data-caption') || caption
        });
      }
      if (imgs.length > 1) {
        card._timer = null;
        card._visible = false;
        card.addEventListener('pointerenter', function () { stopCard(card); });
        card.addEventListener('pointerleave', function () { maybeStart(card); });
        card.addEventListener('focusin', function () { stopCard(card); });
        card.addEventListener('focusout', function () { maybeStart(card); });
        if ('IntersectionObserver' in window) {
          var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              card._visible = en.isIntersecting;
              if (en.isIntersecting) maybeStart(card); else stopCard(card);
            });
          }, { threshold: 0.25 });
          co.observe(card);
        } else {
          card._visible = true;
          maybeStart(card);
        }
      }
    });

    function setFrame(card, i) {
      var imgs = card._imgs;
      if (!imgs || !imgs.length) return;
      var n = imgs.length;
      i = ((i % n) + n) % n;
      card._cur = i;
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
      var badge = card.querySelector('.gal-badge');
      if (badge) badge.textContent = (i + 1) + '/' + n;
      var dots = card.querySelectorAll('.gal-dots i');
      [].forEach.call(dots, function (d, k) { d.classList.toggle('is-on', k === i); });
    }

    function stopCard(card) {
      if (card._timer) { clearInterval(card._timer); card._timer = null; }
    }

    function maybeStart(card) {
      if (reduce || !card._visible || card._timer || !card._imgs || card._imgs.length < 2) return;
      if (lb && lb.classList.contains('open')) return;
      if (document.hidden) return;
      card._timer = setInterval(function () { setFrame(card, card._cur + 1); }, INTERVAL + Math.random() * 500);
    }

    var lb = document.querySelector('.lightbox');
    if (lb) {
      var lbImg = lb.querySelector('img');
      var lbCap = lb.querySelector('figcaption');
      var lbCount = lb.querySelector('.lb-count');
      var index = 0;
      var lastFocus = null;

      var render = function () {
        var f = frames[index];
        if (!f) return;
        lbImg.src = f.full;
        lbImg.alt = f.alt;
        if (lbCap) lbCap.textContent = f.caption;
        if (lbCount) lbCount.textContent = (index + 1) + ' / ' + frames.length;
      };
      var open = function (i) {
        index = i;
        lastFocus = document.activeElement;
        render();
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        cards.forEach(stopCard);
        var close = lb.querySelector('.lb-close');
        if (close) close.focus();
      };
      var close = function () {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lbImg.removeAttribute('src');
        if (lastFocus) lastFocus.focus();
        cards.forEach(maybeStart);
      };
      var step = function (d) {
        index = (index + d + frames.length) % frames.length;
        render();
      };

      cards.forEach(function (card) {
        card.addEventListener('click', function (e) {
          e.preventDefault();
          open(card._offset + (card._cur || 0));
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
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) cards.forEach(stopCard);
        else cards.forEach(maybeStart);
      });
    }
  }
})();

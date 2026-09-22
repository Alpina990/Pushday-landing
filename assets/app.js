/* PushDay landing — small progressive enhancements only. */

(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress__bar');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (header) {
      header.classList.toggle('is-scrolled', y > 12);
    }

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      bar.style.width = (ratio * 100).toFixed(2) + '%';
    }
  }

  var ticking = false;
  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  onScroll();

  /* reveal sections as they come into view */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window) {
    var seen = 0;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = Math.min(seen, 3) * 90;
          seen += 1;
          window.setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* the bot link is wired up in one place so it is easy to replace */
  var botUrl = 'https://t.me/pushdaybot';
  Array.prototype.forEach.call(document.querySelectorAll('[data-bot-link]'), function (a) {
    a.setAttribute('href', botUrl);
    a.setAttribute('rel', 'noopener');
    a.setAttribute('target', '_blank');
  });

  var year = document.querySelector('[data-year]');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();

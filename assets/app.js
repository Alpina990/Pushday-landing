/* PushDay landing — small progressive enhancements only. */

(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress__bar');
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var atTop = true;

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

    var nowAtTop = y <= 8;
    if (nowAtTop && !atTop) {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top >= window.innerHeight) {
          el.classList.remove('is-visible');
        }
      });
    }
    atTop = nowAtTop;
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
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window) {
    var seen = 0;
    var revealTimers = new WeakMap();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var target = entry.target;

          if (!entry.isIntersecting) {
            var pendingTimer = revealTimers.get(target);
            if (pendingTimer) {
              window.clearTimeout(pendingTimer);
              revealTimers.delete(target);
            }

            if (entry.boundingClientRect.bottom < 0) {
              target.classList.remove('is-visible');
            }
            return;
          }

          if (target.classList.contains('is-visible') || revealTimers.has(target)) return;

          var delay = Math.min(seen, 3) * 90;
          seen += 1;
          revealTimers.set(
            target,
            window.setTimeout(function () {
              revealTimers.delete(target);
              if (target.getBoundingClientRect().bottom > 0) {
                target.classList.add('is-visible');
              }
            }, delay)
          );
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

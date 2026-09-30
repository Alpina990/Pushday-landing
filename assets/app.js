/* >>> BOT HAVOLASI: shu bitta qatorni o'zgartirsangiz, saytdagi BARCHA tugmalar yangilanadi <<< */
var BOT_URL = 'https://t.me/pushdaybot';

(function () {
  var links = document.querySelectorAll('[data-bot]');

  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('href', BOT_URL);
    links[i].setAttribute('target', '_blank');
    links[i].setAttribute('rel', 'noopener');
  }

  var header = document.getElementById('hdr');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('stuck', window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

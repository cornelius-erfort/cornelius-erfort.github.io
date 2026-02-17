(function() {
  var TOTAL_PAGES = 3;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function buildSrc(baseSrc, page) {
    // Preserve the PDF file path before '#'
    var parts = String(baseSrc || '').split('#');
    var file = parts[0] || '';
    return file + '#page=' + page + '&toolbar=0&navpanes=0';
  }

  function init() {
    var frame = document.getElementById('cv-page-frame');
    var pager = document.querySelector('.cv-pager');
    if (!frame || !pager) return;

    var prev = pager.querySelector('.cv-pager__btn--prev');
    var next = pager.querySelector('.cv-pager__btn--next');
    var dotsWrap = pager.querySelector('.cv-pager__dots');
    if (!prev || !next || !dotsWrap) return;

    var baseSrc = frame.getAttribute('src') || '';
    var current = 1;

    function renderDots() {
      dotsWrap.innerHTML = '';
      for (var i = 1; i <= TOTAL_PAGES; i++) {
        (function(page) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'cv-pager__dot';
          b.setAttribute('aria-label', 'CV page ' + page + ' of ' + TOTAL_PAGES);
          b.addEventListener('click', function() { setPage(page); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }

    function updateUI() {
      prev.disabled = current <= 1;
      next.disabled = current >= TOTAL_PAGES;
      var dots = dotsWrap.querySelectorAll('.cv-pager__dot');
      for (var i = 0; i < dots.length; i++) {
        var on = (i + 1) === current;
        dots[i].classList.toggle('is-active', on);
        if (on) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      }
    }

    function setPage(page) {
      current = clamp(page, 1, TOTAL_PAGES);
      frame.setAttribute('src', buildSrc(baseSrc, current));
      updateUI();
    }

    prev.addEventListener('click', function() { setPage(current - 1); });
    next.addEventListener('click', function() { setPage(current + 1); });

    renderDots();
    setPage(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


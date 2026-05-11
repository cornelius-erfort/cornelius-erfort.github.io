(function() {
  /* Initial guess until the embed iframe reports pdf.numPages via window.cvPdfPageCount */
  var totalPages = 5;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function isVisible(el) {
    if (!el) return false;
    var rects = el.getClientRects && el.getClientRects();
    return !!(rects && rects.length > 0 && (rects[0].width > 0 || rects[0].height > 0));
  }

  function buildSrc(baseSrc, page) {
    var s = String(baseSrc || '');
    if (s.indexOf('cv-pdf-embed.html') !== -1) {
      var u = '';
      var path = s.split('?')[0] || '';
      try {
        var url = new URL(s, window.location.href);
        u = url.searchParams.get('u') || '';
      } catch (e) {
        var m = s.match(/[?&]u=([^&]*)/);
        if (m) {
          try {
            u = decodeURIComponent(m[1].replace(/\+/g, '%20'));
          } catch (e2) {
            u = m[1];
          }
        }
      }
      return path + '?u=' + encodeURIComponent(u) + '&page=' + String(page);
    }
    var parts = s.split('#');
    var file = parts[0] || '';
    return file + '#page=' + page + '&toolbar=0&navpanes=0';
  }

  function init() {
    // Narrow: use lightweight single-page iframe.
    // Wide: keep the big iframe, but still show the cool pager controls.
    var frameNarrow = document.getElementById('cv-page-frame');
    var frameWide = document.getElementById('cv-pdf-iframe');
    var pager = document.querySelector('.cv-pager');
    if (!pager) return;

    var prev = pager.querySelector('.cv-pager__btn--prev');
    var next = pager.querySelector('.cv-pager__btn--next');
    var dotsWrap = pager.querySelector('.cv-pager__dots');
    if (!prev || !next || !dotsWrap) return;

    /* On narrow (e.g. iPhone) only cv-pager__frame-wrap is shown; use its iframe. */
    var frameWrapNarrow = pager.querySelector('.cv-pager__frame-wrap');
    var useNarrowFrame = frameNarrow && frameWrapNarrow && isVisible(frameWrapNarrow);
    var frame = useNarrowFrame ? frameNarrow : (isVisible(frameWide) ? frameWide : frameNarrow);
    if (!frame) return;
    var baseSrc = (frame.getAttribute('src') || '').replace(/#.*$/, '');
    var current = 1;

    function syncPageCountFromFrame() {
      try {
        var w = frame.contentWindow;
        if (w && typeof w.cvPdfPageCount === 'number' && w.cvPdfPageCount > 0) {
          totalPages = w.cvPdfPageCount;
          current = clamp(current, 1, totalPages);
          renderDots();
          updateUI();
        }
      } catch (e) { /* cross-origin or not ready */ }
    }

    frame.addEventListener('load', syncPageCountFromFrame);

    function renderDots() {
      dotsWrap.innerHTML = '';
      for (var i = 1; i <= totalPages; i++) {
        (function(page) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'cv-pager__dot scroll-inlay__dot';
          b.setAttribute('aria-label', 'CV page ' + page + ' of ' + totalPages);
          b.addEventListener('click', function() { setPage(page); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }

    function updateUI() {
      prev.disabled = current <= 1;
      next.disabled = current >= totalPages;
      var dots = dotsWrap.querySelectorAll('.cv-pager__dot');
      for (var i = 0; i < dots.length; i++) {
        var on = (i + 1) === current;
        dots[i].classList.toggle('is-active', on);
        if (on) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      }
    }

    function setPage(page) {
      current = clamp(page, 1, totalPages);
      frame.setAttribute('src', buildSrc(baseSrc, current));
      updateUI();
    }

    function goPrev() { setPage(current - 1); }
    function goNext() { setPage(current + 1); }

    prev.addEventListener('click', goPrev);
    next.addEventListener('click', goNext);
    /* iOS: touchend fires reliably; click can be delayed or lost. Handle both, prevent double fire. */
    prev.addEventListener('touchend', function(e) {
      if (prev.disabled) return;
      e.preventDefault();
      goPrev();
    }, { passive: false });
    next.addEventListener('touchend', function(e) {
      if (next.disabled) return;
      e.preventDefault();
      goNext();
    }, { passive: false });

    renderDots();
    setPage(1);

    /* Dots: touchend on the dot buttons (added in renderDots) */
    dotsWrap.addEventListener('touchend', function(e) {
      var dot = e.target && e.target.closest && e.target.closest('.cv-pager__dot');
      if (!dot) return;
      var idx = Array.prototype.indexOf.call(dotsWrap.querySelectorAll('.cv-pager__dot'), dot);
      if (idx >= 0 && idx < totalPages) {
        e.preventDefault();
        setPage(idx + 1);
      }
    }, { passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

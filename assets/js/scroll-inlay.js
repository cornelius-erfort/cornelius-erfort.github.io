(function() {
  /* Show 3 full rows + ~10% of 4th row so next item is peeking */
  var ROWS_VISIBLE = 3.1;
  var VIEWPORT_PADDING_VERTICAL = 24;
  var NARROW_MQ = '(max-width: 768px)';
  var VERY_NARROW_MQ = '(max-width: 420px)';

  function getRowHeight(view) {
    var table = view.querySelector('table');
    var tbody = table && table.querySelector('tbody');
    if (!tbody) return null;
    var first = tbody.querySelector('tr');
    if (!first) return null;
    var second = first.nextElementSibling;
    var r1 = first.getBoundingClientRect();
    var h;
    if (second) {
      var r2 = second.getBoundingClientRect();
      h = Math.round(r2.top - r1.top);
    } else {
      h = Math.round(r1.height) + 10;
    }
    return h > 0 ? h : null;
  }

  function setViewportHeight(view, rowHeight, rowsVisible, extraPx) {
    if (rowHeight && rowHeight > 0) {
      var rows = (typeof rowsVisible === 'number' && rowsVisible > 0) ? rowsVisible : ROWS_VISIBLE;
      var extra = (typeof extraPx === 'number') ? extraPx : 0;
      view.style.height = Math.round(rows * rowHeight + VIEWPORT_PADDING_VERTICAL + extra) + 'px';
    }
  }

  function getSizingForInlay(inlay) {
    var section = null;
    try {
      var sec = inlay && inlay.closest ? inlay.closest('section') : null;
      section = sec && sec.id ? sec.id : null;
    } catch (e) {}
    var isNarrow = false;
    try { isNarrow = !!(window.matchMedia && window.matchMedia(NARROW_MQ).matches); } catch (e) {}
    var isVeryNarrow = false;
    try { isVeryNarrow = !!(window.matchMedia && window.matchMedia(VERY_NARROW_MQ).matches); } catch (e) {}

    // Defaults: 3 full + ~10% of 4th
    var rows = ROWS_VISIBLE;
    var extraPx = 0;

    // On narrow screens: give Publications + WIP a bit more breathing room.
    if (isNarrow && (section === 'publications' || section === 'work-in-progress')) {
      rows = 3.35;
    }

    // On narrow screens: make Data a touch shorter.
    if (isNarrow && section === 'data') {
      extraPx = -4;
    }
    // On very narrow screens: make Data a bit shorter still.
    if (isVeryNarrow && section === 'data') {
      extraPx = -12;
    }

    // On very narrow screens: News inlay slightly shorter.
    if (isVeryNarrow && section === 'news') {
      extraPx = -12;
    }

    return { rowsVisible: rows, extraPx: extraPx };
  }

  function updateArrows(view, upBtn, downBtn) {
    if (!view || !upBtn || !downBtn) return;
    var atTop = view.scrollTop <= 0;
    var atBottom = view.scrollTop >= view.scrollHeight - view.clientHeight - 1;
    upBtn.disabled = atTop;
    downBtn.disabled = atBottom;
  }

  function recalcInlay(inlay) {
    if (!inlay) return;
    var st = inlay.__scrollInlayState;
    if (!st || !st.view) return;
    var rh = getRowHeight(st.view);
    if (rh && rh > 0) st.rowHeight = rh;
    var sizing = getSizingForInlay(inlay);
    st.rowsVisible = sizing.rowsVisible;
    st.extraPx = sizing.extraPx;
    setViewportHeight(st.view, st.rowHeight, st.rowsVisible, st.extraPx);
    updateArrows(st.view, st.upBtn, st.downBtn);
  }

  function initInlay(inlay) {
    var view = inlay.querySelector('.scroll-inlay__viewport');
    var upBtn = inlay.querySelector('.scroll-inlay__arrow--up');
    var downBtn = inlay.querySelector('.scroll-inlay__arrow--down');
    if (!view || !upBtn || !downBtn) return;

    inlay.__scrollInlayState = { view: view, upBtn: upBtn, downBtn: downBtn, rowHeight: 120, rowsVisible: ROWS_VISIBLE, extraPx: 0 };
    recalcInlay(inlay);

    view.addEventListener('scroll', function() { updateArrows(view, upBtn, downBtn); });
    upBtn.addEventListener('click', function() {
      view.scrollBy({ top: -(inlay.__scrollInlayState && inlay.__scrollInlayState.rowHeight || 120), behavior: 'smooth' });
    });
    downBtn.addEventListener('click', function() {
      view.scrollBy({ top: (inlay.__scrollInlayState && inlay.__scrollInlayState.rowHeight || 120), behavior: 'smooth' });
    });

    updateArrows(view, upBtn, downBtn);
  }

  function init() {
    var inlays = document.querySelectorAll('.scroll-inlay');
    for (var i = 0; i < inlays.length; i++) initInlay(inlays[i]);
  }

  var resizeTimer = null;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var inlays = document.querySelectorAll('.scroll-inlay');
      for (var i = 0; i < inlays.length; i++) recalcInlay(inlays[i]);
    }, 120);
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }

  window.initScrollInlays = init;
})();

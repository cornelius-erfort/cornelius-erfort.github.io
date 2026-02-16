(function() {
  /* Show 3 full rows + ~10% of 4th row so next item is peeking */
  var ROWS_VISIBLE = 3.1;
  var VIEWPORT_PADDING_VERTICAL = 24;

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

  function setViewportHeight(view, rowHeight) {
    if (rowHeight && rowHeight > 0) {
      view.style.height = Math.round(ROWS_VISIBLE * rowHeight + VIEWPORT_PADDING_VERTICAL) + 'px';
    }
  }

  function updateArrows(view, upBtn, downBtn) {
    if (!view || !upBtn || !downBtn) return;
    var atTop = view.scrollTop <= 0;
    var atBottom = view.scrollTop >= view.scrollHeight - view.clientHeight - 1;
    upBtn.disabled = atTop;
    downBtn.disabled = atBottom;
  }

  function initInlay(inlay) {
    var view = inlay.querySelector('.scroll-inlay__viewport');
    var upBtn = inlay.querySelector('.scroll-inlay__arrow--up');
    var downBtn = inlay.querySelector('.scroll-inlay__arrow--down');
    if (!view || !upBtn || !downBtn) return;

    var rowHeight = getRowHeight(view);
    setViewportHeight(view, rowHeight);
    if (!rowHeight) rowHeight = 120;

    view.addEventListener('scroll', function() { updateArrows(view, upBtn, downBtn); });
    upBtn.addEventListener('click', function() {
      view.scrollBy({ top: -rowHeight, behavior: 'smooth' });
    });
    downBtn.addEventListener('click', function() {
      view.scrollBy({ top: rowHeight, behavior: 'smooth' });
    });

    updateArrows(view, upBtn, downBtn);
  }

  function init() {
    var inlays = document.querySelectorAll('.scroll-inlay');
    for (var i = 0; i < inlays.length; i++) initInlay(inlays[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }

  window.initScrollInlays = init;
})();

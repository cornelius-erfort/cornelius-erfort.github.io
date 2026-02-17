(function() {
  // True paging (left/right) instead of vertical scroll snapping:
  // - Each page shows up to 3 items.
  // - Arrows/dots switch pages.
  var ROWS_PER_PAGE = 3;
  var ROWS_VISIBLE = 3; // keep viewport height stable (3 rows)
  var VIEWPORT_PADDING_VERTICAL = 24;

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function getPagerEls(inlay) {
    var pager = inlay.querySelector('.scroll-inlay__pager');
    return {
      pager: pager,
      prevBtn: pager && pager.querySelector('.scroll-inlay__page-btn--prev'),
      nextBtn: pager && pager.querySelector('.scroll-inlay__page-btn--next'),
      dotsWrap: pager && pager.querySelector('.scroll-inlay__dots')
    };
  }

  function getFirstVisibleRow(view) {
    return (
      view.querySelector('tbody:not([hidden]) tr') ||
      view.querySelector('tbody tr') ||
      null
    );
  }

  function getRowHeight(view) {
    var table = view.querySelector('table');
    if (!table) return null;
    var first = getFirstVisibleRow(view);
    if (!first) return null;
    var second = first.nextElementSibling;
    var r1 = first.getBoundingClientRect();
    var h;
    if (second && second.tagName === 'TR') {
      var r2 = second.getBoundingClientRect();
      h = Math.round(r2.top - r1.top);
    } else {
      h = Math.round(r1.height) + 10;
    }
    return h > 0 ? h : null;
  }

  function setViewportHeight(view, rowHeight) {
    if (!view) return;
    if (rowHeight && rowHeight > 0) {
      view.style.height = Math.round(ROWS_VISIBLE * rowHeight + VIEWPORT_PADDING_VERTICAL) + 'px';
    }
  }

  function syncViewportOverflowY(view) {
    // Prevent tiny "wiggle" scroll caused by 1–few px overflow (rounding/padding).
    // Still allow vertical scrolling if expanded content truly overflows.
    if (!view) return;
    var client = Math.max(0, view.clientHeight || 0);
    var scrollH = Math.max(0, view.scrollHeight || 0);
    var overflow = scrollH - client;

    // If overflow is just a few pixels, grow the viewport a bit to fit exactly.
    // This avoids the "scrollable by a few millimeters" feel.
    if (overflow > 0 && overflow <= 10) {
      var h = parseInt(view.style.height || '', 10);
      if (h && isFinite(h)) view.style.height = (h + overflow) + 'px';
      // Recompute after adjustment
      client = Math.max(0, view.clientHeight || 0);
      scrollH = Math.max(0, view.scrollHeight || 0);
      overflow = scrollH - client;
    }

    view.style.overflowY = (overflow > 1) ? 'auto' : 'hidden';
    if (view.style.overflowY === 'hidden') view.scrollTop = 0;
  }

  function getAllRows(table) {
    // Preserve current DOM order across (possibly multiple) tbodies.
    return Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
  }

  function setActiveDot(st) {
    if (!st || !st.dotsWrap) return;
    var dots = st.dotsWrap.querySelectorAll('.scroll-inlay__dot');
    for (var i = 0; i < dots.length; i++) {
      var on = i === st.currentPage;
      dots[i].classList.toggle('is-active', on);
      if (on) dots[i].setAttribute('aria-current', 'true');
      else dots[i].removeAttribute('aria-current');
    }
  }

  function applyPageVisibility(st) {
    if (!st || !st.table) return;
    var bodies = st.table.querySelectorAll('tbody');
    for (var i = 0; i < bodies.length; i++) {
      if (i === st.currentPage) bodies[i].removeAttribute('hidden');
      else bodies[i].setAttribute('hidden', '');
    }
    if (st.view) st.view.scrollTop = 0;
  }

  function rebuildDots(st) {
    if (!st || !st.dotsWrap) return;
    st.dotsWrap.innerHTML = '';
    for (var i = 0; i < st.pageCount; i++) {
      (function(pageIdx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'scroll-inlay__dot';
        b.setAttribute('aria-label', 'Page ' + (pageIdx + 1) + ' of ' + st.pageCount);
        b.addEventListener('click', function() { goToPage(st, pageIdx); });
        st.dotsWrap.appendChild(b);
      })(i);
    }
  }

  function updatePager(st) {
    if (!st || !st.pager) return;
    // Always show pager, even for a single page:
    // - user should see that it's "not scrollable" because arrows are disabled
    // - active dot stays dark
    st.pager.removeAttribute('hidden');
    var pageCount = Math.max(1, st.pageCount || 1);
    var current = clamp((typeof st.currentPage === 'number' ? st.currentPage : 0), 0, pageCount - 1);
    st.pageCount = pageCount;
    st.currentPage = current;
    if (st.prevBtn) st.prevBtn.disabled = current <= 0;
    if (st.nextBtn) st.nextBtn.disabled = current >= pageCount - 1;
    setActiveDot(st);
  }

  function paginateTable(st) {
    if (!st || !st.table) return;
    var table = st.table;
    var rows = getAllRows(table);

    // Remove all existing tbodies (we'll rebuild them as "pages").
    var existingBodies = Array.prototype.slice.call(table.querySelectorAll('tbody'));
    for (var i = 0; i < existingBodies.length; i++) {
      table.removeChild(existingBodies[i]);
    }

    var pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
    for (var p = 0; p < pageCount; p++) {
      var tbody = document.createElement('tbody');
      tbody.className = 'scroll-inlay__page-body';
      tbody.setAttribute('data-page', String(p));
      var start = p * ROWS_PER_PAGE;
      var end = Math.min(rows.length, start + ROWS_PER_PAGE);
      for (var r = start; r < end; r++) tbody.appendChild(rows[r]);
      table.appendChild(tbody);
    }

    st.pageCount = pageCount;
    st.currentPage = clamp(st.currentPage, 0, st.pageCount - 1);
    applyPageVisibility(st);
  }

  function goToPage(st, pageIdx) {
    if (!st) return;
    st.currentPage = clamp(pageIdx, 0, st.pageCount - 1);
    applyPageVisibility(st);
    syncViewportOverflowY(st.view);
    updatePager(st);
  }

  function recalcInlay(inlay) {
    if (!inlay) return;
    var st = inlay.__scrollInlayState;
    if (!st || !st.view) return;
    if (!st.table) st.table = st.view.querySelector('table');
    if (!st.table) return;

    // Rebuild pages (max 3 items) first so we can reliably show/hide.
    paginateTable(st);

    var rh = getRowHeight(st.view);
    if (rh && rh > 0) st.rowHeight = rh;
    setViewportHeight(st.view, st.rowHeight);
    syncViewportOverflowY(st.view);

    var needRebuildDots = st._dotsBuiltFor !== st.pageCount;
    if (needRebuildDots) {
      st._dotsBuiltFor = st.pageCount;
      rebuildDots(st);
    }
    updatePager(st);
  }

  function initInlay(inlay) {
    var view = inlay.querySelector('.scroll-inlay__viewport');
    if (!view) return;
    var pagerEls = getPagerEls(inlay);
    if (!pagerEls.pager) return;

    inlay.__scrollInlayState = {
      view: view,
      table: view.querySelector('table'),
      pager: pagerEls.pager,
      prevBtn: pagerEls.prevBtn,
      nextBtn: pagerEls.nextBtn,
      dotsWrap: pagerEls.dotsWrap,
      rowHeight: 120,
      pageCount: 1,
      currentPage: 0,
      _dotsBuiltFor: 0,
      _observer: null
    };

    var st = inlay.__scrollInlayState;
    recalcInlay(inlay);

    // Content is injected after load (news.js/render-sections.js). Recalc a few times.
    setTimeout(function() { recalcInlay(inlay); }, 0);
    setTimeout(function() { recalcInlay(inlay); }, 200);
    setTimeout(function() { recalcInlay(inlay); }, 1000);

    if (st.prevBtn) st.prevBtn.addEventListener('click', function() { goToPage(st, st.currentPage - 1); });
    if (st.nextBtn) st.nextBtn.addEventListener('click', function() { goToPage(st, st.currentPage + 1); });

    // Keep pager in sync when content is injected/changed.
    if (window.MutationObserver && st.table) {
      var moTimer = null;
      var obs = new MutationObserver(function() {
        clearTimeout(moTimer);
        moTimer = setTimeout(function() { recalcInlay(inlay); }, 80);
      });
      obs.observe(st.table, { childList: true, subtree: true });
      st._observer = obs;
    }

    updatePager(st);
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

(function() {
  // Always 3 slots per page (same on all viewport sizes).
  function getRowsPerPage() { return 3; }

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

  function getAllRows(table) {
    // Preserve current DOM order across (possibly multiple) tbodies.
    // IMPORTANT: exclude our own placeholder rows, otherwise repeated pagination
    // keeps re-paginating placeholders and grows forever.
    return Array.prototype.slice.call(table.querySelectorAll('tbody tr:not(.scroll-inlay__placeholder-row)'));
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

  function paginateTable(st, rowsPerPage) {
    if (!st || !st.table) return;
    rowsPerPage = rowsPerPage || getRowsPerPage();
    var table = st.table;
    var rows = getAllRows(table);

    // Remove all existing tbodies (we'll rebuild them as "pages").
    var existingBodies = Array.prototype.slice.call(table.querySelectorAll('tbody'));
    for (var i = 0; i < existingBodies.length; i++) {
      table.removeChild(existingBodies[i]);
    }

    var pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    for (var p = 0; p < pageCount; p++) {
      var tbody = document.createElement('tbody');
      tbody.className = 'scroll-inlay__page-body';
      tbody.setAttribute('data-page', String(p));
      var start = p * rowsPerPage;
      var end = Math.min(rows.length, start + rowsPerPage);
      for (var r = start; r < end; r++) tbody.appendChild(rows[r]);

      // Placeholder rows so every page has the same row count and height is stable.
      var missing = rowsPerPage - (end - start);
      for (var m = 0; m < missing; m++) {
        var ph = document.createElement('tr');
        ph.className = 'scroll-inlay__placeholder-row';
        ph.setAttribute('aria-hidden', 'true');
        ph.innerHTML = '<td class="publication-image-cell" style="border:none"></td><td style="border:none"></td>';
        tbody.appendChild(ph);
      }
      table.appendChild(tbody);
    }

    st.pageCount = pageCount;
    st.currentPage = clamp(st.currentPage, 0, st.pageCount - 1);
    applyPageVisibility(st);
  }

  function measureAndSetSlotHeight(st) {
    if (!st || !st.view || !st.table) return;

    var view = st.view;
    var table = st.table;
    var bodies = table.querySelectorAll('tbody');
    if (!bodies || !bodies.length) return;

    // Temporarily allow rows/cells to expand so we can measure needed heights.
    view.classList.add('is-measuring');
    // Force reflow so the browser applies is-measuring (height: auto, overflow: visible) before we read heights.
    void view.offsetHeight;

    var prevPage = (typeof st.currentPage === 'number' ? st.currentPage : 0);
    var maxRowH = 0;

    for (var p = 0; p < bodies.length; p++) {
      st.currentPage = p;
      applyPageVisibility(st);
      void view.offsetHeight; // reflow after showing this page so row heights are correct

      var pageBody = table.querySelector('tbody:not([hidden])') || bodies[p];
      if (!pageBody) continue;
      var realRows = pageBody.querySelectorAll('tr:not(.scroll-inlay__placeholder-row)');
      for (var i = 0; i < realRows.length; i++) {
        var row = realRows[i];
        var rectH = Math.ceil((row.getBoundingClientRect && row.getBoundingClientRect().height) || 0);
        // scrollHeight can be larger when content would overflow (ensures we don't cut off)
        var scrollH = (row.scrollHeight && row.scrollHeight) || rectH;
        var h = Math.max(rectH, scrollH);
        if (h > maxRowH) maxRowH = h;
      }
    }

    // Restore current page.
    st.currentPage = clamp(prevPage, 0, bodies.length - 1);
    applyPageVisibility(st);

    view.classList.remove('is-measuring');

    if (!maxRowH || maxRowH < 1) return;

    // Buffer for padding, borders, rounding and so the full content is visible.
    var desired = maxRowH + 10;

    // Clamp so a single unusually tall entry doesn't blow up the whole layout.
    desired = clamp(desired, 76, 220);
    // Narrow uses 2 rows per page so no need to cap slot height.

    view.style.setProperty('--inlay-slot-height', desired + 'px');
  }

  function goToPage(st, pageIdx) {
    if (!st) return;
    st.currentPage = clamp(pageIdx, 0, st.pageCount - 1);
    applyPageVisibility(st);
    if (st.view) st.view.scrollTop = 0;
    updatePager(st);
  }

  function setViewportHeightForRowCount(view, rowCount) {
    if (!view || rowCount < 1) return;
    var cs = window.getComputedStyle(view);
    var pad = parseFloat(cs.getPropertyValue('--inlay-pad')) || 10;
    var padBottom = parseFloat(cs.getPropertyValue('--inlay-pad-bottom')) || 10;
    var slotH = parseFloat(cs.getPropertyValue('--inlay-slot-height')) || 100;
    var rowGap = parseFloat(cs.getPropertyValue('--inlay-row-gap')) || 8;
    var total = pad + padBottom + rowCount * slotH + (rowCount - 1) * rowGap + padBottom;
    view.style.height = total + 'px';
  }

  function recalcInlay(inlay) {
    if (!inlay) return;
    var st = inlay.__scrollInlayState;
    if (!st || !st.view) return;
    if (!st.table) st.table = st.view.querySelector('table');
    if (!st.table) return;

    var rowsPerPage = getRowsPerPage();
    inlay.classList.toggle('scroll-inlay--narrow', rowsPerPage === 2);

    st._suppressObserver = true;
    paginateTable(st, rowsPerPage);
    measureAndSetSlotHeight(st);

    var realRowCount = getAllRows(st.table).length;
    if (realRowCount > 0 && realRowCount < rowsPerPage) {
      setViewportHeightForRowCount(st.view, realRowCount);
    } else {
      st.view.style.height = '';
    }

    var needRebuildDots = st._dotsBuiltFor !== st.pageCount;
    if (needRebuildDots) {
      st._dotsBuiltFor = st.pageCount;
      rebuildDots(st);
    }
    updatePager(st);
    st._suppressObserver = false;
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
    // TEMP: disabled for stability testing (can trigger frequent relayouts in WebKit/Blink).
    // if (window.MutationObserver && st.table) {
    //   var moTimer = null;
    //   var obs = new MutationObserver(function() {
    //     if (st._suppressObserver) return;
    //     clearTimeout(moTimer);
    //     moTimer = setTimeout(function() { recalcInlay(inlay); }, 80);
    //   });
    //   obs.observe(st.table, { childList: true, subtree: true });
    //   st._observer = obs;
    // }

    updatePager(st);
  }

  function recalcAllInlays() {
    var inlays = document.querySelectorAll('.scroll-inlay');
    for (var i = 0; i < inlays.length; i++) recalcInlay(inlays[i]);
  }

  function init() {
    var inlays = document.querySelectorAll('.scroll-inlay');
    for (var i = 0; i < inlays.length; i++) initInlay(inlays[i]);
  }

  var resizeTimer = null;
  var lastResizeW = 0;
  var lastResizeH = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      if (w === lastResizeW && h === lastResizeH) return;
      lastResizeW = w;
      lastResizeH = h;
      recalcAllInlays();
    }, 120);
  }
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', function() {
    lastResizeW = 0;
    lastResizeH = 0;
    setTimeout(function() { recalcAllInlays(); }, 150);
  }, { passive: true });

  window.recalcAllScrollInlays = recalcAllInlays;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 0); });
  } else {
    setTimeout(init, 0);
  }

  window.initScrollInlays = init;
})();

(function() {
  function openExternalInNewTab() {
    var links = document.querySelectorAll('a[href^="http"]');
    for (var i = 0; i < links.length; i++) {
      try {
        var u = new URL(links[i].href);
        if (u.origin !== window.location.origin) {
          links[i].setAttribute('target', '_blank');
          links[i].setAttribute('rel', 'noopener noreferrer');
        }
      } catch (e) {}
    }
  }

  function getMastheadOffsetPx() {
    var mh = document.getElementById('masthead-scroll');
    var h = mh ? mh.getBoundingClientRect().height : 0;
    // Add a little breathing room so section titles are visible below the masthead.
    return Math.round(h + 10);
  }

  function scrollToHashWithOffset(hash) {
    if (!hash || hash === '#') return;
    var id = hash.charAt(0) === '#' ? hash.slice(1) : hash;
    var el = document.getElementById(id);
    if (!el) return;

    var offset = getMastheadOffsetPx();
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'smooth' });

    // Update URL without reloading
    try {
      window.history.pushState(null, '', '#' + id);
    } catch (e) {}
  }

  function initInPageNav() {
    var masthead = document.getElementById('masthead-scroll');
    if (!masthead) return;

    function handleHashLink(a) {
      if (!a) return false;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return false;
      scrollToHashWithOffset(href);
      var toggle = document.getElementById('nav-toggle-scroll');
      if (toggle && toggle.checked) toggle.checked = false;
      return true;
    }

    masthead.addEventListener('click', function(e) {
      var a = e.target && (e.target.closest ? e.target.closest('a') : null);
      if (!handleHashLink(a)) return;
      e.preventDefault();
    });

    /* Firefox on iOS often doesn't fire click for tap; touchend makes nav links work */
    masthead.addEventListener('touchend', function(e) {
      var a = e.target && (e.target.closest ? e.target.closest('a') : null);
      if (!handleHashLink(a)) return;
      e.preventDefault();
    }, { passive: false });
  }

  function initGreedyMenu() {
    var nav = document.querySelector('#masthead-scroll .site-nav-static');
    if (!nav) return;
    var visible = document.getElementById('nav-links-visible');
    var dropdown = document.getElementById('nav-links-dropdown');
    var toggle = document.getElementById('nav-toggle-scroll');
    if (!visible || !dropdown) return;

    function moveAllToVisible() {
      while (dropdown.firstElementChild) visible.appendChild(dropdown.firstElementChild);
    }

    function contentWidth(el) {
      var sum = 0;
      for (var i = 0; i < el.children.length; i++) {
        sum += el.children[i].getBoundingClientRect().width;
      }
      return Math.ceil(sum);
    }

    function update() {
      moveAllToVisible();

      var brand = nav.querySelector('.site-nav-static__brand');
      var brandW = brand ? brand.getBoundingClientRect().width : 0;
      var navW = nav.getBoundingClientRect().width || nav.clientWidth || 0;
      var reservedToggle = 48;
      var maxW = Math.max(0, Math.floor(navW - brandW - reservedToggle - 8));
      visible.style.maxWidth = maxW + 'px';
      visible.style.minWidth = '0';

      // Force reflow so visible has its constrained width, then measure by child sum
      // (scrollWidth can equal clientWidth with overflow:hidden in flex containers)
      void visible.offsetHeight;
      var available = visible.getBoundingClientRect().width;
      var guard = 0;
      while (contentWidth(visible) > available + 1 && visible.children.length && guard < 80) {
        dropdown.insertBefore(visible.lastElementChild, dropdown.firstChild);
        void visible.offsetHeight;
        available = visible.getBoundingClientRect().width;
        guard++;
      }

      var hasOverflow = dropdown.children.length > 0;
      nav.classList.toggle('has-overflow', hasOverflow);

      if (!hasOverflow && toggle && toggle.checked) {
        toggle.checked = false;
      }
    }

    var raf = null;
    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function() {
        update();
        // Second pass to stabilize after fonts/layout settle
        requestAnimationFrame(update);
      });
    }

    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }

  /**
   * Allow scrolling past the PDF viewer to reach the footer:
   * 1) A strip at the bottom of the PDF (cv-scroll-past-strip) captures wheel and scrolls the page.
   * 2) If the user scrolls over the iframe itself and the page didn't move, we scroll the page in rAF.
   */
  function initCvScrollPassThrough() {
    var cvSection = document.getElementById('cv');
    if (!cvSection) return;

    var strips = cvSection.querySelectorAll('.cv-scroll-past-strip');
    for (var i = 0; i < strips.length; i++) {
      strips[i].addEventListener('wheel', function(e) {
        if (e.deltaY <= 0) return;
        var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        var now = window.pageYOffset;
        if (now >= maxScroll - 2) return;
        e.preventDefault();
        var step = Math.min(80, e.deltaY, maxScroll - now);
        if (step > 0) window.scrollTo(window.pageXOffset, now + step);
      }, { passive: false });
    }

    document.addEventListener('wheel', function(e) {
      if (e.deltaY <= 0) return;
      if (e.target.tagName !== 'IFRAME' || !cvSection.contains(e.target)) return;
      var before = window.pageYOffset;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (before >= maxScroll - 2) return;
      requestAnimationFrame(function() {
        if (window.pageYOffset === before) {
          var step = Math.min(80, e.deltaY, maxScroll - before);
          if (step > 0) window.scrollTo(window.pageXOffset, before + step);
        }
      });
    }, { passive: true, capture: false });
  }

  function initBackToTop() {
    var link = document.getElementById('back-to-top-link');
    if (!link) return;
    link.addEventListener('click', function(e) {
      e.preventDefault();
      scrollToHashWithOffset('#top');
    });
    link.addEventListener('touchend', function(e) {
      e.preventDefault();
      scrollToHashWithOffset('#top');
    }, { passive: false });
  }

  function init() {
    openExternalInNewTab();
    initInPageNav();
    initGreedyMenu();
    initCvScrollPassThrough();
    initBackToTop();

    // If page loads with a hash, apply offset (after layout settles).
    if (window.location.hash) {
      setTimeout(function() { scrollToHashWithOffset(window.location.hash); }, 0);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

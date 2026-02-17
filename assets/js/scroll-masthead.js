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

    masthead.addEventListener('click', function(e) {
      var a = e.target && (e.target.closest ? e.target.closest('a') : null);
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;

      e.preventDefault();
      scrollToHashWithOffset(href);

      // Close hamburger dropdown after clicking a link
      var toggle = document.getElementById('nav-toggle-scroll');
      if (toggle && toggle.checked) toggle.checked = false;
    });
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

  function init() {
    openExternalInNewTab();
    initInPageNav();
    initGreedyMenu();

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

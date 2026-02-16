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
  function updateMastheadScroll() {
    var masthead = document.getElementById('masthead-scroll');
    if (!masthead) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    if (y > 80) {
      masthead.classList.add('masthead--scrolled');
      requestAnimationFrame(function() { window.dispatchEvent(new Event('resize')); });
    }
    /* Once the title is shown, keep it visible (never remove masthead--scrolled) */
  }
  function init() {
    openExternalInNewTab();
    updateMastheadScroll();
    window.addEventListener('scroll', updateMastheadScroll, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

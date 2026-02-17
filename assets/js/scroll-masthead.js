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

  function init() {
    openExternalInNewTab();
    initInPageNav();

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

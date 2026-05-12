/* Theme switcher: light / dark / system.
   Pairs with the early head inline script that sets data-theme before paint. */
(function() {
  var STORAGE_KEY = 'min-theme';
  var html = document.documentElement;
  var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getStoredPreference() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch (e) {}
    return 'system';
  }
  function storePreference(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }
  function resolveEffective(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return (mediaQuery && mediaQuery.matches) ? 'dark' : 'light';
  }
  function applyTheme(pref) {
    var effective = resolveEffective(pref);
    html.setAttribute('data-theme', effective);
    html.setAttribute('data-theme-preference', pref);
  }
  function updateButtons(pref) {
    var btns = document.querySelectorAll('.theme-switch__btn');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var val = b.getAttribute('data-theme-value');
      var on = (val === pref);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }
  function setTheme(pref) {
    if (pref !== 'light' && pref !== 'dark' && pref !== 'system') pref = 'system';
    storePreference(pref);
    applyTheme(pref);
    updateButtons(pref);
  }

  document.addEventListener('click', function(e) {
    var btn = e.target.closest && e.target.closest('.theme-switch__btn');
    if (!btn) return;
    var v = btn.getAttribute('data-theme-value');
    if (v) setTheme(v);
  });

  if (mediaQuery) {
    var handler = function() {
      if (getStoredPreference() === 'system') applyTheme('system');
    };
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handler);
    else if (mediaQuery.addListener) mediaQuery.addListener(handler);
  }

  updateButtons(getStoredPreference());
})();

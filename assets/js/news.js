(function() {
  function init() {
    var dataEl = document.getElementById('news-data');
    var tbody = document.getElementById('newsTable');
    if (!dataEl || !tbody) return;
    var items = [];
    try {
      var raw = JSON.parse(dataEl.textContent || '[]');
      if (Array.isArray(raw)) items = raw;
      else if (raw && typeof raw === 'object') {
        items = Object.keys(raw).sort().map(function(k) { return raw[k]; });
      }
    } catch (e) {}
    items.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var typeLabels = { publication: 'Publication', grant: 'Grant', presentation: 'Presentation', award: 'Award', other: 'News' };
    var typeIcons = { publication: 'fa-book', grant: 'fa-coins', presentation: 'fa-microphone', award: 'fa-award', other: 'fa-newspaper' };
    var basePath = '';
    var contentEl = document.querySelector('.scroll-content');
    if (contentEl && contentEl.getAttribute('data-base-path')) basePath = contentEl.getAttribute('data-base-path') || '';

    function formatDate(s) {
      if (!s) return '';
      var d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function escapeHtml(s) {
      if (!s) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function coverCell(item) {
      var type = item.type || 'other';
      var icon = typeIcons[type] || typeIcons.other;
      if (item.cover) {
        return '<td class="publication-image-cell" style="border:none"><img src="' + basePath + '/' + escapeHtml(item.cover) + '" alt=""></td>';
      }
      return '<td class="publication-image-cell" style="border:none"><div class="data-icon-cell"><i class="fas ' + icon + '" aria-hidden="true"></i></div></td>';
    }
    function renderRow(item) {
      var type = (item.type && typeLabels[item.type]) ? typeLabels[item.type] : typeLabels.other;
      var bodyContent = item.body_html ? item.body_html : (item.body ? escapeHtml(item.body) : '');
      var tr = document.createElement('tr');
      tr.innerHTML = coverCell(item) +
        '<td style="border:none"><span class="news-item-date">' + escapeHtml(formatDate(item.date)) + '</span> ' +
        (item.type ? '<span class="news-item-type">' + escapeHtml(type) + '</span> ' : '') +
        '<h3 class="news-item-title">' + escapeHtml(item.title || '') + '</h3>' +
        (bodyContent ? '<div class="news-item-body">' + bodyContent + '</div>' : '') + '</td>';
      return tr;
    }
    for (var i = 0; i < items.length; i++) tbody.appendChild(renderRow(items[i]));
  }
  // IMPORTANT:
  // This script tag sits directly below the News table markup in `index.html`,
  // so we can render immediately during parsing. This ensures the inlay pager
  // (initialized on DOMContentLoaded) doesn't remove/replace the initial tbody
  // before we fill it.
  init();

  // Fallback: if something prevented immediate init, retry on DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();

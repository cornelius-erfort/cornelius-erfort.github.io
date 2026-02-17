/* Render publications, work-in-progress, media, data, teaching from embedded JSON */
(function() {
  function el(id) { return document.getElementById(id); }
  function q(qs, root) { return (root || document).querySelector(qs); }
  function qAll(qs, root) { return (root || document).querySelectorAll(qs); }
  function normalizeData(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      // Jekyll folder data: `_data/foo/*.json` becomes an object keyed by filename.
      // Use key order for stable ordering.
      return Object.keys(raw).sort().map(function(k) {
        var v = raw[k];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          if (v.id == null) v.id = k;
          v.__key = k;
          return v;
        }
        return { id: k, value: v, __key: k };
      });
    }
    return [];
  }
  function parseData(id) {
    var el = document.getElementById(id);
    if (!el || !el.textContent) return [];
    try { return normalizeData(JSON.parse(el.textContent.trim())); } catch (e) { return []; }
  }
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getBasePath() {
    var el = document.querySelector('.scroll-content[data-base-path]');
    return (el && el.getAttribute('data-base-path')) || '';
  }

  function renderPublications(items, basePath) {
    var tbody = q('#publicationsTable tbody');
    if (!tbody) return;
    items.forEach(function(pub, i) {
      var idx = i + 1;
      var imgCell = '<td class="publication-image-cell" style="border:none">' +
        (pub.image_link ? '<a href="' + esc(pub.image_link) + '">' : '') +
        '<img src="' + basePath + '/' + esc(pub.image || '') + '">' +
        (pub.image_link ? '</a>' : '') + '</td>';
      var buttons = [];
      var contents = [];
      if (pub.abstract) {
        buttons.push('<button type="button" class="pub-button" data-toggle-content="abstract' + idx + '">Abstract</button>');
        contents.push('<div id="abstract' + idx + '" class="pub-content">' + esc(pub.abstract) + '</div>');
      }
      if (pub.bibtex) {
        buttons.push('<button type="button" class="pub-button" data-toggle-content="bibtex' + idx + '">BibTeX</button>');
        contents.push('<div id="bibtex' + idx + '" class="pub-content"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><pre>' + esc(pub.bibtex) + '</pre><button type="button" class="pub-button" data-download-bibtex="bibtex' + idx + '">Download</button></div></div>');
      }
      (pub.links || []).forEach(function(link, j) {
        var lid = (link.label || 'link').toLowerCase().replace(/\s+/g, '');
        var id = lid + idx;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        var text = link.text || 'View →';
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">' + esc(text) + '</a></div></div>');
      });
      var td = '<td class="pub-cell" style="border:none">' +
        '<div class="publication-buttons">' + buttons.join('\n        ') + '</div>' +
        contents.join('\n    ') +
        '<b>' + esc(pub.title) + '</b> <br>' +
        pub.authors + ' <br><i>' + esc(pub.venue) + '</i></td>';
      var tr = document.createElement('tr');
      tr.setAttribute('data-year', pub.year || '');
      tr.setAttribute('data-journal', pub.journal || '');
      tr.innerHTML = imgCell + td;
      tbody.appendChild(tr);
    });
  }

  function renderWIP(items, basePath) {
    var table = el('workInProgressTable');
    if (!table) return;
    var tbody = table.querySelector('tbody') || table;
    items.forEach(function(wip, i) {
      var idx = 11 + i;
      var buttons = [];
      var contents = [];
      if (wip.abstract) {
        buttons.push('<button type="button" class="pub-button" data-toggle-content="abstract' + idx + '">Abstract</button>');
        contents.push('<div id="abstract' + idx + '" class="pub-content">' + esc(wip.abstract) + '</div>');
      }
      if (wip.bibtex) {
        buttons.push('<button type="button" class="pub-button" data-toggle-content="bibtex' + idx + '">BibTeX</button>');
        contents.push('<div id="bibtex' + idx + '" class="pub-content"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><pre>' + esc(wip.bibtex) + '</pre><button type="button" class="pub-button" data-download-bibtex="bibtex' + idx + '">Download</button></div></div>');
      }
      (wip.links || []).forEach(function(link) {
        var lid = (link.label || 'link').toLowerCase().replace(/\s+/g, '');
        var id = lid + idx;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        var text = link.text || 'View →';
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">' + esc(text) + '</a></div></div>');
      });
      var td = '<td class="pub-cell" style="border:none">' +
        '<div class="publication-buttons">' + buttons.join('\n        ') + '</div>' +
        contents.join('\n    ') +
        '<b>' + esc(wip.title) + '</b> <br>' + wip.authors + '</td>';
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="publication-image-cell" style="border:none"><div class="document-icon"><i class="fas fa-hourglass-half" aria-hidden="true"></i></div></td>' + td;
      tbody.appendChild(tr);
    });
  }

  function renderMedia(items, basePath) {
    var tbody = el('mediaTable');
    if (!tbody) return;
    items.forEach(function(m) {
      var tr = document.createElement('tr');
      var cover = m.url
        ? '<a class="media-cover" href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer"><img src="' + basePath + '/' + esc(m.logo) + '" alt="' + esc(m.outlet) + '"></a>'
        : '<span class="media-cover"><img src="' + basePath + '/' + esc(m.logo) + '" alt="' + esc(m.outlet) + '"></span>';
      var titleHtml = m.url
        ? '<a href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer">' + esc(m.title) + '</a>'
        : esc(m.title || '');
      tr.innerHTML =
        '<td class="publication-image-cell" style="border:none">' + cover + '</td>' +
        '<td style="border:none"><b>' + esc(m.outlet) + '</b> <br>' + titleHtml + ' <br><span class="media-date">' + esc(m.date) + '</span></td>';
      tbody.appendChild(tr);
    });
  }

  function renderDatasets(items, basePath) {
    var tbody = q('#dataTable tbody');
    if (!tbody) return;
    items.forEach(function(d) {
      var idBase = d.id || 'data-' + (d.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      var buttons = [];
      var contents = [];
      var links = d.links || [];
      var iconLink = null;
      if (links.length) {
        var github = links.filter(function(l) { return (l.label || '').toLowerCase().indexOf('github') !== -1; })[0];
        iconLink = (github || links[0]).url;
      }
      links.forEach(function(link) {
        var slug = (link.label || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var id = 'data-' + idBase + '-' + slug;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">View on ' + esc(link.label) + ' →</a></div></div>');
      });
      var desc = d.description ? ' <br>' + d.description : '';
      var btnsHtml = buttons.length ? '<div class="publication-buttons">' + buttons.join(' ') + '</div>' + contents.join('') : '';
      var iconInner = '<i class="fas ' + esc(d.icon || 'fa-database') + '" aria-hidden="true"></i>';
      var iconHtml = '<div class="data-icon-cell">' + iconInner + '</div>';
      if (iconLink) {
        // Make the icon itself the link so all rows share identical sizing
        iconHtml = '<a href="' + esc(iconLink) + '" target="_blank" rel="noopener" class="data-icon-cell">' + iconInner + '</a>';
      }
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="publication-image-cell" style="border:none">' + iconHtml + '</td>' +
        '<td class="pub-cell" style="border:none">' + btnsHtml + '<b>' + esc(d.title) + '</b> <br>' + d.authors + desc + '</td>';
      tbody.appendChild(tr);
    });
  }

  function renderTeaching(items, basePath) {
    var tbody = q('#teachingTable tbody');
    if (!tbody) return;
    items.forEach(function(t) {
      var idBase = t.id || 'teaching-' + (t.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      var buttons = [];
      var contents = [];
      (t.links || []).forEach(function(link) {
        var slug = (link.label || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var id = 'teaching-' + idBase + '-' + slug;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">View on ' + esc(link.label) + ' →</a></div></div>');
      });
      var btnsHtml = buttons.length ? '<div class="publication-buttons">' + buttons.join(' ') + '</div>' + contents.join('') : '';
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="publication-image-cell" style="border:none"><div class="data-icon-cell"><i class="fas ' + esc(t.icon || 'fa-graduation-cap') + '" aria-hidden="true"></i></div></td>' +
        '<td class="pub-cell" style="border:none">' + btnsHtml + '<b>' + esc(t.title) + '</b> <br>' + esc(t.description) + '</td>';
      tbody.appendChild(tr);
    });
  }

  function sortPublications(items) {
    if (!items || !items.length) return items;
    return items.slice().sort(function(a, b) {
      var y1 = a.year, y2 = b.year;
      if (y1 === 'forthcoming' && y2 !== 'forthcoming') return -1;
      if (y1 !== 'forthcoming' && y2 === 'forthcoming') return 1;
      if (y1 === 'forthcoming' && y2 === 'forthcoming') return 0;
      return (parseInt(y2, 10) || 0) - (parseInt(y1, 10) || 0);
    });
  }

  window.renderAllSections = function() {
    var basePath = (getBasePath() || '').replace(/\/$/, '');
    renderPublications(sortPublications(parseData('data-publications')), basePath);
    renderWIP(parseData('data-work-in-progress'), basePath);
    renderMedia(parseData('data-media'), basePath);
    renderDatasets(parseData('data-datasets'), basePath);
    renderTeaching(parseData('data-teaching'), basePath);
  };
})();

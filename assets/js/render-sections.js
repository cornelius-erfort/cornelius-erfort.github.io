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
  function formatDate(s) {
    if (s == null) return '';
    var d = new Date(s);
    return isNaN(d.getTime()) ? String(s) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  /** YYYY-MM-DD parsed as local calendar date (avoids UTC off-by-one). */
  function parseDateLoose(s) {
    var str = String(s == null ? '' : s).trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  function formatMonthYear(s) {
    var d = parseDateLoose(s);
    if (!d) return s == null ? '' : String(s);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }
  /** Teaching: one label per calendar month (e.g. two workshop days in May → "May 2025"). */
  function teachingMonthYearParts(dates) {
    if (!Array.isArray(dates) || !dates.length) return [];
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < dates.length; i++) {
      var d = parseDateLoose(dates[i]);
      if (!d) continue;
      var key = d.getFullYear() + '-' + d.getMonth();
      if (seen[key]) continue;
      seen[key] = true;
      out.push(d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }));
    }
    return out;
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
      var articleUrl = null;
      (pub.links || []).forEach(function(link, j) {
        var lid = (link.label || 'link').toLowerCase().replace(/\s+/g, '');
        var id = lid + idx;
        if (!articleUrl && link.url) articleUrl = link.url;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        var text = link.text || 'View →';
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">' + esc(text) + '</a></div></div>');
      });
      var titleHtml = articleUrl
        ? '<span class="pub-title-wrap"><span class="pub-title pub-title--wide"><b>' + esc(pub.title) + '</b></span><a href="' + esc(articleUrl) + '" class="pub-title pub-title--narrow" target="_blank" rel="noopener">' + esc(pub.title) + '</a></span>'
        : '<b>' + esc(pub.title) + '</b>';
      var td = '<td class="pub-cell" style="border:none">' +
        '<div class="publication-buttons">' + buttons.join('\n        ') + '</div>' +
        contents.join('\n    ') +
        titleHtml + ' ' +
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
      var articleUrl = null;
      (wip.links || []).forEach(function(link) {
        var lid = (link.label || 'link').toLowerCase().replace(/\s+/g, '');
        var id = lid + idx;
        if (!articleUrl && link.url) articleUrl = link.url;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        var text = link.text || 'View →';
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">' + esc(text) + '</a></div></div>');
      });
      var titleHtml = articleUrl
        ? '<span class="pub-title-wrap"><span class="pub-title pub-title--wide"><b>' + esc(wip.title) + '</b></span><a href="' + esc(articleUrl) + '" class="pub-title pub-title--narrow" target="_blank" rel="noopener">' + esc(wip.title) + '</a></span>'
        : '<b>' + esc(wip.title) + '</b>';
      var td = '<td class="pub-cell" style="border:none">' +
        '<div class="publication-buttons">' + buttons.join('\n        ') + '</div>' +
        contents.join('\n    ') +
        titleHtml + ' ' + wip.authors + '</td>';
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
        ? '<a class="media-title-link" href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer">' + esc(m.title) + '</a>'
        : '<span class="media-title-link">' + esc(m.title || '') + '</span>';
      tr.innerHTML =
        '<td class="publication-image-cell" style="border:none">' + cover + '</td>' +
        '<td style="border:none"><span class="media-date">' + esc(formatDate(m.date)) + '</span><br><span class="media-outlet">' + esc(m.outlet) + '</span>' + titleHtml + '</td>';
      tbody.appendChild(tr);
    });
  }

  function renderDatasets(items, basePath) {
    var tbody = q('#dataTable tbody');
    if (!tbody) return;
    var bp = (basePath || '').replace(/\/$/, '');
    items.forEach(function(d) {
      var idBase = d.id || 'data-' + (d.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      var buttons = [];
      var contents = [];
      var links = d.links || [];
      var iconLink = null;
      if (links.length) {
        var gh = links.filter(function(l) {
          var u = (l.url || '').toLowerCase();
          return u.indexOf('github.com') !== -1;
        })[0];
        iconLink = (gh || links[0]).url;
      }
      links.forEach(function(link) {
        var slug = (link.label || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var id = 'data-' + idBase + '-' + slug;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">View on ' + esc(link.label) + ' →</a></div></div>');
      });
      var desc = d.description ? ' <br>' + d.description : '';
      var btnsHtml = buttons.length ? '<div class="publication-buttons">' + buttons.join(' ') + '</div>' + contents.join('') : '';
      var logoPath = (d.image || d.logo || '').trim();
      var imgSrc = logoPath ? (bp ? bp + '/' + logoPath : '/' + logoPath.replace(/^\//, '')) : '';
      var leftCell;
      if (logoPath) {
        var imgTag = '<img src="' + esc(imgSrc) + '" alt="" loading="lazy">';
        if (iconLink) {
          leftCell = '<td class="publication-image-cell" style="border:none"><a href="' + esc(iconLink) + '" target="_blank" rel="noopener" class="data-icon-cell data-icon-cell--logo">' + imgTag + '</a></td>';
        } else {
          leftCell = '<td class="publication-image-cell" style="border:none"><div class="data-icon-cell data-icon-cell--logo">' + imgTag + '</div></td>';
        }
      } else {
        var iconInner = '<i class="fas ' + esc(d.icon || 'fa-database') + '" aria-hidden="true"></i>';
        var iconHtml = '<div class="data-icon-cell">' + iconInner + '</div>';
        if (iconLink) {
          iconHtml = '<a href="' + esc(iconLink) + '" target="_blank" rel="noopener" class="data-icon-cell">' + iconInner + '</a>';
        }
        leftCell = '<td class="publication-image-cell" style="border:none">' + iconHtml + '</td>';
      }
      var tr = document.createElement('tr');
      tr.innerHTML = leftCell +
        '<td class="pub-cell" style="border:none">' + btnsHtml + '<b>' + esc(d.title) + '</b> <br>' + d.authors + desc + '</td>';
      tbody.appendChild(tr);
    });
  }

  /** Teaching folder data: optional numeric `order` (lower first); else stable sort by file key. */
  function sortTeaching(items) {
    if (!items || !items.length) return items;
    return items.slice().sort(function(a, b) {
      var o1 = a.order != null ? Number(a.order) : NaN;
      var o2 = b.order != null ? Number(b.order) : NaN;
      if (!isNaN(o1) || !isNaN(o2)) {
        if (isNaN(o1)) return 1;
        if (isNaN(o2)) return -1;
        if (o1 !== o2) return o1 - o2;
      }
      var k1 = a.__key || '';
      var k2 = b.__key || '';
      return k1.localeCompare(k2);
    });
  }

  function teachingDateLine(t) {
    if (t.date_display) {
      return '<span class="media-date">' + esc(t.date_display) + '</span><br>';
    }
    if (Array.isArray(t.dates) && t.dates.length) {
      var monthParts = teachingMonthYearParts(t.dates);
      if (!monthParts.length) return '';
      return '<span class="media-date">' + monthParts.map(function(p) { return esc(p); }).join(' \u00b7 ') + '</span><br>';
    }
    if (t.date) {
      var one = formatMonthYear(t.date);
      if (!one) return '';
      return '<span class="media-date">' + esc(one) + '</span><br>';
    }
    return '';
  }

  /** Work in progress: optional numeric `order` (lower first); else stable sort by file key. */
  function sortWorkInProgress(items) {
    if (!items || !items.length) return items;
    return items.slice().sort(function(a, b) {
      var o1 = a.order != null ? Number(a.order) : NaN;
      var o2 = b.order != null ? Number(b.order) : NaN;
      if (!isNaN(o1) || !isNaN(o2)) {
        if (isNaN(o1)) return 1;
        if (isNaN(o2)) return -1;
        if (o1 !== o2) return o1 - o2;
      }
      var k1 = a.__key || '';
      var k2 = b.__key || '';
      return k1.localeCompare(k2);
    });
  }

  function renderTeaching(items, basePath) {
    var tbody = q('#teachingTable tbody');
    if (!tbody) return;
    var bp = (basePath || '').replace(/\/$/, '');
    items.forEach(function(t) {
      var idBase = t.id || 'teaching-' + (t.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      var buttons = [];
      var contents = [];
      var links = t.links || [];
      var iconLink = null;
      if (links.length) {
        var gh = links.filter(function(l) {
          var u = (l.url || '').toLowerCase();
          return u.indexOf('github.com') !== -1;
        })[0];
        iconLink = (gh || links[0]).url;
      }
      links.forEach(function(link) {
        var slug = (link.label || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var id = 'teaching-' + idBase + '-' + slug;
        buttons.push('<button type="button" class="pub-button" data-toggle-content="' + id + '">' + esc(link.label) + '</button>');
        contents.push('<div id="' + id + '" class="pub-content"><div class="external-link-content"><a href="' + esc(link.url) + '" target="_blank" rel="noopener">Open link →</a></div></div>');
      });
      var btnsHtml = buttons.length ? '<div class="publication-buttons">' + buttons.join(' ') + '</div>' + contents.join('') : '';
      var logoPath = (t.logo || t.image || '').trim();
      var imgSrc = logoPath ? (bp ? bp + '/' + logoPath : '/' + logoPath.replace(/^\//, '')) : '';
      var leftCell;
      if (logoPath) {
        var imgTag = '<img src="' + esc(imgSrc) + '" alt="" loading="lazy">';
        if (iconLink) {
          leftCell = '<td class="publication-image-cell" style="border:none"><a href="' + esc(iconLink) + '" target="_blank" rel="noopener" class="data-icon-cell data-icon-cell--logo">' + imgTag + '</a></td>';
        } else {
          leftCell = '<td class="publication-image-cell" style="border:none"><div class="data-icon-cell data-icon-cell--logo">' + imgTag + '</div></td>';
        }
      } else {
        var faIcon = '<i class="fas ' + esc(t.icon || 'fa-graduation-cap') + '" aria-hidden="true"></i>';
        if (iconLink) {
          leftCell = '<td class="publication-image-cell" style="border:none"><a href="' + esc(iconLink) + '" target="_blank" rel="noopener" class="data-icon-cell">' + faIcon + '</a></td>';
        } else {
          leftCell = '<td class="publication-image-cell" style="border:none"><div class="data-icon-cell">' + faIcon + '</div></td>';
        }
      }
      var dateLine = teachingDateLine(t);
      var tr = document.createElement('tr');
      tr.innerHTML = leftCell +
        '<td class="pub-cell" style="border:none">' + btnsHtml + dateLine + '<b>' + esc(t.title) + '</b> <br>' + esc(t.description) + '</td>';
      tbody.appendChild(tr);
    });
  }

  function sortPublications(items) {
    if (!items || !items.length) return items;
    return items.slice().sort(function(a, b) {
      var o1 = a.order != null ? Number(a.order) : NaN;
      var o2 = b.order != null ? Number(b.order) : NaN;
      if (!isNaN(o1) || !isNaN(o2)) {
        if (isNaN(o1)) return 1;
        if (isNaN(o2)) return -1;
        return o1 - o2;
      }
      var y1 = a.year, y2 = b.year;
      if (y1 === 'forthcoming' && y2 !== 'forthcoming') return -1;
      if (y1 !== 'forthcoming' && y2 === 'forthcoming') return 1;
      if (y1 === 'forthcoming' && y2 === 'forthcoming') return 0;
      return (parseInt(y2, 10) || 0) - (parseInt(y1, 10) || 0);
    });
  }

  function sortMediaByDateDesc(items) {
    if (!items || !items.length) return items;
    return items.slice().sort(function(a, b) {
      var t1 = new Date(a.date || 0).getTime();
      var t2 = new Date(b.date || 0).getTime();
      return t2 - t1;
    });
  }

  window.renderAllSections = function() {
    var basePath = (getBasePath() || '').replace(/\/$/, '');
    renderPublications(sortPublications(parseData('data-publications')), basePath);
    renderWIP(sortWorkInProgress(parseData('data-work-in-progress')), basePath);
    renderMedia(sortMediaByDateDesc(parseData('data-media')), basePath);
    renderDatasets(parseData('data-datasets'), basePath);
    renderTeaching(sortTeaching(parseData('data-teaching')), basePath);
  };
})();

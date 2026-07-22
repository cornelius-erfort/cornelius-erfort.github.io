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
  function parseCitations(id) {
    var el = document.getElementById(id);
    if (!el || !el.textContent) return null;
    try { return JSON.parse(el.textContent.trim()); } catch (e) { return null; }
  }
  function scholarUserId(citations) {
    var url = citations && citations.scholar_profile_url;
    if (!url) return null;
    var m = String(url).match(/user=([^&]+)/);
    return m ? m[1] : null;
  }
  function countPublicationAuthors(html) {
    var text = String(html || '').replace(/<[^>]+>/g, '');
    return text.split(/\s*,\s*|\s+and\s+/).map(function(s) { return s.trim(); }).filter(Boolean).length;
  }

  function formatPublicationAuthorsCompact(html, uid, maxAuthors) {
    if (!html) return '';
    var limit = maxAuthors == null ? 10 : maxAuthors;
    if (countPublicationAuthors(html) <= limit) return html;
    var depth = 0;
    for (var i = 0; i < html.length; i++) {
      if (html.charAt(i) === '<') depth++;
      else if (html.charAt(i) === '>') depth--;
      else if (depth === 0 && html.substr(i, 2) === ', ') {
        var first = html.slice(0, i);
        var rest = html.slice(i + 2);
        var id = 'pub-authors-' + String(uid).replace(/[^a-zA-Z0-9_-]/g, '-');
        return first +
          ' <button type="button" class="citing-et-al authors-et-al" aria-expanded="false" aria-controls="' + id + '" data-expand-authors="' + id + '">et al.</button>' +
          '<span id="' + id + '" class="citing-authors-rest" hidden>, ' + rest + '</span>';
      }
    }
    return html;
  }

  window.formatPublicationAuthorsCompact = formatPublicationAuthorsCompact;

  function renderAuthorLink(a) {
    if (!a || !a.name) return '';
    if (a.scholar_url) {
      return '<a href="' + esc(a.scholar_url) + '" target="_blank" rel="noopener">' + esc(a.name) + '</a>';
    }
    return esc(a.name);
  }
  function renderCitingAuthorsCompact(authors, uid, maxAuthors) {
    var list = (authors || []).filter(function(a) { return a && a.name; });
    if (!list.length) return '';
    var limit = maxAuthors == null ? 10 : maxAuthors;
    if (list.length <= limit) return list.map(renderAuthorLink).join(', ');
    var restHtml = list.slice(1).map(renderAuthorLink).join(', ');
    var id = String(uid).replace(/[^a-zA-Z0-9_-]/g, '-');
    return renderAuthorLink(list[0]) +
      ' <button type="button" class="citing-et-al" aria-expanded="false" aria-controls="' + id + '" data-expand-authors="' + id + '">et al.</button>' +
      '<span id="' + id + '" class="citing-authors-rest" hidden>, ' + restHtml + '</span>';
  }
  function renderCitingWorksHtml(works, idPrefix) {
    if (!works || !works.length) {
      return '<p class="citations-empty">No citing papers listed yet.</p>';
    }
    var prefix = idPrefix || 'cite';
    var html = '<ol class="citing-works-list">';
    works.forEach(function(w, wi) {
      var title = w.url
        ? '<a href="' + esc(w.url) + '" target="_blank" rel="noopener">' + esc(w.title) + '</a>'
        : esc(w.title);
      var year = w.year ? ' <span class="citing-work__year">(' + w.year + ')</span>' : '';
      var authors = renderCitingAuthorsCompact(w.authors, prefix + '-authors-' + wi);
      html += '<li class="citing-work"><div class="citing-work__title">' + title + year + '</div>';
      if (authors) html += '<div class="citing-work__authors">' + authors + '</div>';
      html += '</li>';
    });
    html += '</ol>';
    return html;
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
    var el = document.querySelector('.scroll-content[data-base-path], .minimal-content[data-base-path], [data-base-path]');
    return (el && el.getAttribute('data-base-path')) || '';
  }

  function renderPublications(items, basePath, citations) {
    var tbody = q('#publicationsTable tbody');
    if (!tbody) return;
    var citeByPub = (citations && citations.by_publication) || {};
    tbody.innerHTML = '';
    items.forEach(function(pub, i) {
      var idx = i + 1;
      var pubKey = pub.__key || pub.id;
      var citeInfo = pubKey ? citeByPub[pubKey] : null;
      var citeCount = citeInfo && citeInfo.cited_by_count ? citeInfo.cited_by_count : 0;
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
      if (citeCount > 0) {
        contents.push('<div id="citedby' + idx + '" class="pub-content citations-panel">' + renderCitingWorksHtml(citeInfo.citing_works, 'citedby' + idx) + '</div>');
      }
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
        '<div class="pub-main">' +
          titleHtml + ' ' +
          (pub.authors || '') + ' <br><i>' + esc(pub.venue) + '</i>' +
          (citeCount > 0
            ? ' <button type="button" class="pub-cite-badge" data-toggle-content="citedby' + idx + '" title="Show citing papers (Google Scholar)">' + citeCount + ' citations</button>'
            : '') +
        '</div>' +
        '<div class="publication-buttons">' + buttons.join('\n        ') + '</div>' +
        contents.join('\n    ') +
        '</td>';
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
    tbody.innerHTML = '';
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
    tbody.innerHTML = '';
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
    tbody.innerHTML = '';
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
    tbody.innerHTML = '';
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

  function authorMapKey(a) {
    if (a && a.scholar_url) return a.scholar_url;
    return 'name:' + String(a && a.name || '').toLowerCase().trim();
  }

  function buildAuthorWorksMap(citations) {
    var map = Object.create(null);
    var byPub = (citations && citations.by_publication) || {};
    Object.keys(byPub).forEach(function(pubKey) {
      var pub = byPub[pubKey];
      var myTitle = pub.scholar_title || pubKey;
      (pub.citing_works || []).forEach(function(work) {
        (work.authors || []).forEach(function(author) {
          if (!author || !author.name) return;
          var key = authorMapKey(author);
          if (!map[key]) {
            map[key] = { name: author.name, scholar_url: author.scholar_url, works: [] };
          }
          var existing = null;
          for (var wi = 0; wi < map[key].works.length; wi++) {
            var w = map[key].works[wi];
            if (w.title === work.title && w.url === work.url) { existing = w; break; }
          }
          if (!existing) {
            map[key].works.push({
              title: work.title,
              url: work.url,
              year: work.year,
              citing_my: [myTitle]
            });
          } else if (existing.citing_my.indexOf(myTitle) === -1) {
            existing.citing_my.push(myTitle);
          }
        });
      });
    });
    return map;
  }

  function lookupAuthorWorks(map, row) {
    if (row.scholar_url && map[row.scholar_url]) return map[row.scholar_url].works;
    var nameKey = 'name:' + String(row.name || '').toLowerCase().trim();
    if (map[nameKey]) return map[nameKey].works;
    return [];
  }

  function renderLeaderboardWorksHtml(works, uid) {
    if (!works || !works.length) {
      return '<p class="citations-empty">No citing articles indexed.</p>';
    }
    var html = '<ul class="citations-leaderboard__works-list">';
    works.forEach(function(w) {
      var title = w.url
        ? '<a href="' + esc(w.url) + '" target="_blank" rel="noopener">' + esc(w.title) + '</a>'
        : esc(w.title);
      var year = w.year ? ' <span class="citing-work__year">(' + w.year + ')</span>' : '';
      var mineList = Array.isArray(w.citing_my) ? w.citing_my : (w.citing_my ? [w.citing_my] : []);
      var mine = mineList.length
        ? '<span class="citations-leaderboard__cites-my">Cites: ' + mineList.map(function(t) { return esc(t); }).join('; ') + '</span>'
        : '';
      html += '<li class="citations-leaderboard__work">' + title + year + mine + '</li>';
    });
    html += '</ul>';
    return html;
  }

  function renderCitationsSection(citations) {
    if (!citations) return;
    var summary = el('citationsSummary');
    var list = q('#citationsLeaderboard .citations-leaderboard__body');
    if (!summary || !list) return;

    var profile = citations.profile || {};
    var updated = citations.updated_at ? formatDate(citations.updated_at) : '';
    var scholarLink = citations.scholar_profile_url
      ? '<a href="' + esc(citations.scholar_profile_url) + '" target="_blank" rel="noopener">Google Scholar profile</a>'
      : '';
    summary.innerHTML =
      '<p class="citations-summary__stats">' +
      '<span class="citations-stat"><strong>' + esc(profile.total_citations != null ? profile.total_citations : '—') + '</strong> citations</span>' +
      '<span class="citations-stat"><strong>h-index ' + esc(profile.h_index != null ? profile.h_index : '—') + '</strong></span>' +
      '<span class="citations-stat"><strong>i10-index ' + esc(profile.i10_index != null ? profile.i10_index : '—') + '</strong></span>' +
      '</p>' +
      (updated ? '<p class="citations-summary__meta">Counts from ' + scholarLink + ', updated ' + esc(updated) + '.</p>' : '');

    var selfId = scholarUserId(citations);
    var worksMap = buildAuthorWorksMap(citations);
    var board = (citations.citing_author_leaderboard || []).filter(function(row) {
      if (!row || !row.count) return false;
      if (selfId && row.scholar_url && row.scholar_url.indexOf(selfId) !== -1) return false;
      return true;
    });

    list.innerHTML = '';
    board.forEach(function(row, i) {
      var works = lookupAuthorWorks(worksMap, row);
      var worksId = 'citations-works-' + i;
      var nameCell = row.scholar_url
        ? '<a href="' + esc(row.scholar_url) + '" target="_blank" rel="noopener">' + esc(row.name) + '</a>'
        : esc(row.name);
      var toggleBtn = works.length
        ? '<button type="button" class="citations-leaderboard__toggle" aria-expanded="false" aria-controls="' + esc(worksId) + '" data-toggle-leaderboard-works="' + esc(worksId) + '">Articles (' + works.length + ')</button>'
        : '';
      var item = document.createElement('div');
      item.className = 'citations-leaderboard__item';
      item.innerHTML =
        '<div class="citations-leaderboard__row">' +
          '<div class="citations-leaderboard__author">' + nameCell + '</div>' +
          '<div class="citations-leaderboard__count">' + esc(row.count) + '</div>' +
          '<div class="citations-leaderboard__action">' + toggleBtn + '</div>' +
        '</div>' +
        (works.length
          ? '<div id="' + esc(worksId) + '" class="citations-leaderboard__works" hidden>' + renderLeaderboardWorksHtml(works, worksId) + '</div>'
          : '');
      list.appendChild(item);
    });
  }

  function citationsTeaserLine(citations) {
    if (!citations || !citations.profile) return '';
    var p = citations.profile;
    return (p.total_citations != null ? p.total_citations : '—') + ' citations · h-index ' +
      (p.h_index != null ? p.h_index : '—') + ' · i10-index ' + (p.i10_index != null ? p.i10_index : '—');
  }

  window.renderMinimalHomePubs = function() {
    var pubList = el('minimal-pubs');
    if (!pubList) return;
    var citationsEl = el('data-citations-minimal');
    var citationsMinimal = null;
    if (citationsEl && citationsEl.textContent) {
      try { citationsMinimal = JSON.parse(citationsEl.textContent.trim()); } catch (e) { /* ignore */ }
    }
    var citeByPub = (citationsMinimal && citationsMinimal.by_publication) || {};
    var raw = parseData('data-publications-minimal');
    var pubs = raw.filter(function(p) { return p && p.featured; }).sort(function(a, b) {
      function yearKey(y) {
        if (y == null) return -1;
        var s = String(y).toLowerCase();
        if (s === 'forthcoming') return 9999;
        var n = parseInt(s, 10);
        return isNaN(n) ? -1 : n;
      }
      var ya = yearKey(a.year), yb = yearKey(b.year);
      if (ya !== yb) return yb - ya;
      return (a.order || 0) - (b.order || 0);
    });
    pubList.innerHTML = '';
    pubs.forEach(function(pub, i) {
      var articleUrl = null;
      if (pub.image_link) articleUrl = pub.image_link;
      else if (Array.isArray(pub.links)) {
        for (var j = 0; j < pub.links.length; j++) {
          var l = pub.links[j];
          if (l && (l.label === 'Article' || l.label === 'Preprint') && l.url) { articleUrl = l.url; break; }
        }
        if (!articleUrl && pub.links[0] && pub.links[0].url) articleUrl = pub.links[0].url;
      }
      var titleHtml = articleUrl
        ? '<a href="' + esc(articleUrl) + '" target="_blank" rel="noopener">' + esc(pub.title) + '</a>'
        : esc(pub.title);
      var year = pub.year ? '<span class="minimal-pub__year">' + esc(pub.year) + '</span>' : '';
      var venue = pub.journal ? '<em class="minimal-pub__venue">' + esc(pub.journal) + '</em>' : '';
      var pubKey = pub.__key || pub.id || ('pub-' + i);
      var citeInfo = citeByPub[pubKey];
      var citeCount = citeInfo && citeInfo.cited_by_count ? citeInfo.cited_by_count : 0;
      var citeBadge = citeCount > 0
        ? ' &middot; <button type="button" class="minimal-pub__cites pub-cite-badge" data-toggle-content="citedby-home-' + i + '">' + citeCount + ' citations</button>'
        : '';
      var authorsHtml = formatPublicationAuthorsCompact(pub.authors || '', pubKey, 10);
      var citePanel = citeCount > 0
        ? '<div id="citedby-home-' + i + '" class="minimal-pub__citedby pub-content">' + renderCitingWorksHtml(citeInfo.citing_works, 'citedby-home-' + i) + '</div>'
        : '';
      var li = document.createElement('li');
      li.className = 'minimal-pub';
      li.innerHTML =
        '<div class="minimal-pub__title">' + titleHtml + '</div>' +
        '<div class="minimal-pub__meta">' + authorsHtml + (venue ? ' &middot; ' + venue : '') + (year ? ' &middot; ' + year : '') + citeBadge + '</div>' +
        citePanel;
      pubList.appendChild(li);
    });
  };

  window.fillCitationsTeaser = function(citations) {
    var line = citationsTeaserLine(citations);
    qAll('.minimal-citations-teaser').forEach(function(node) {
      if (line) node.textContent = line;
    });
  };

  window.renderAllSections = function() {
    var basePath = (getBasePath() || '').replace(/\/$/, '');
    var citations = parseCitations('data-citations');
    renderPublications(sortPublications(parseData('data-publications')), basePath, citations);
    renderWIP(sortWorkInProgress(parseData('data-work-in-progress')), basePath);
    renderMedia(sortMediaByDateDesc(parseData('data-media')), basePath);
    renderDatasets(parseData('data-datasets'), basePath);
    renderTeaching(sortTeaching(parseData('data-teaching')), basePath);
    renderCitationsSection(citations);
    if (citations) window.fillCitationsTeaser(citations);
  };

  document.addEventListener('click', function(e) {
    var etAl = e.target.closest('[data-expand-authors]');
    if (etAl) {
      e.preventDefault();
      var id = etAl.getAttribute('data-expand-authors');
      var rest = id ? document.getElementById(id) : null;
      if (!rest) return;
      var expanded = etAl.getAttribute('aria-expanded') === 'true';
      etAl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      rest.hidden = expanded;
      etAl.textContent = expanded ? 'et al.' : 'show less';
      return;
    }
    var lbBtn = e.target.closest('[data-toggle-leaderboard-works]');
    if (!lbBtn) return;
    var worksId = lbBtn.getAttribute('data-toggle-leaderboard-works');
    var panel = worksId ? document.getElementById(worksId) : null;
    if (!panel) return;
    var open = lbBtn.getAttribute('aria-expanded') === 'true';
    lbBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
    panel.hidden = open;
    var n = (panel.querySelectorAll('.citations-leaderboard__work') || []).length;
    lbBtn.textContent = open ? 'Articles (' + n + ')' : 'Hide articles';
  });
})();

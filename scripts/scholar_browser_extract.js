/**
 * Google Scholar extraction helpers for browser console or CDP Runtime.evaluate.
 * Run on a Scholar profile (Articles tab) or a "cited by" search results page.
 */
(function (global) {
  function extractProfileArticles() {
    var profile = {
      total_citations: null,
      h_index: null,
      i10_index: null
    };
    var rows = document.querySelectorAll('#gsc_rsb_st tbody tr');
    if (rows.length >= 3) {
      profile.total_citations = parseInt(rows[0].cells[1].textContent.trim(), 10) || 0;
      profile.h_index = parseInt(rows[1].cells[1].textContent.trim(), 10) || 0;
      profile.i10_index = parseInt(rows[2].cells[1].textContent.trim(), 10) || 0;
    }
    var articles = Array.from(document.querySelectorAll('.gsc_a_tr')).filter(function (r) {
      return r.querySelector('.gsc_a_at');
    }).map(function (r) {
      var titleEl = r.querySelector('.gsc_a_at');
      var citeEl = r.querySelector('.gsc_a_c a') || r.querySelector('a.gsc_a_ac');
      var yearEl = r.querySelector('.gsc_a_y span');
      var citationId = (titleEl.href.match(/citation_for_view=([^&]+)/) || [])[1] || null;
      var citesCluster = (citeEl && citeEl.href.match(/cites=([0-9]+)/) || [])[1] || null;
      return {
        title: titleEl.textContent.trim(),
        scholar_url: titleEl.href,
        citation_id: citationId,
        cites_cluster_id: citesCluster,
        cited_by_url: citeEl ? citeEl.href : null,
        cited_by_count: citeEl ? parseInt(citeEl.textContent.trim(), 10) || 0 : 0,
        year: yearEl ? yearEl.textContent.trim() : null
      };
    });
    return { profile: profile, articles: articles };
  }

  function extractCitingWorks() {
    return Array.from(document.querySelectorAll('.gs_ri')).map(function (ri) {
      var titleEl = ri.querySelector('.gs_rt a') || ri.querySelector('.gs_rt');
      var authorsEl = ri.querySelector('.gs_a');
      var yearMatch = authorsEl && authorsEl.textContent.match(/\b(19|20)\d{2}\b/);
      var authors = [];
      if (authorsEl) {
        authorsEl.querySelectorAll('a').forEach(function (a) {
          var href = a.href || '';
          var m = href.match(/user=([^&]+)/);
          authors.push({
            name: a.textContent.trim(),
            scholar_url: m ? 'https://scholar.google.com/citations?user=' + m[1] : (href.indexOf('http') === 0 ? href : null)
          });
        });
      }
      return {
        title: titleEl ? titleEl.textContent.trim() : null,
        url: titleEl && titleEl.href ? titleEl.href : null,
        year: yearMatch ? parseInt(yearMatch[0], 10) : null,
        authors: authors
      };
    }).filter(function (w) { return w.title; });
  }

  global.scholarExtract = {
    extractProfileArticles: extractProfileArticles,
    extractCitingWorks: extractCitingWorks
  };
})(typeof window !== 'undefined' ? window : globalThis);

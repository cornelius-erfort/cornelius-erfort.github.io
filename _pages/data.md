---
layout: archive
title: "Data"
permalink: /data/
author_profile: true
---

{% include base_path %}

<script type="text/javascript">
(function() {
    window.downloadBibtex = function(id) {
        var bibtexContent = document.getElementById(id).querySelector('pre').textContent;
        var blob = new Blob([bibtexContent], { type: 'text/plain' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'citation.bib';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
})();
</script>

<table style="border:none">
<tr>
<td style="border:none">
    <b>The PARTYPRESS Database: A new Comparative Database of Parties' Press Releases</b> <br>
    <span class="author-name">Cornelius Erfort</span>, <a href="http://lukas-stoetzer.org/">Lukas F. Stoetzer</a>, and <a href="http://heike-kluever.com/">Heike Klüver</a> <br>
    <i>Research and Politics</i>, 2023 <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('description1')">Description</button>
        <button class="pub-button" onclick="toggleContent('article1')">Article</button>
        <button class="pub-button" onclick="toggleContent('github1')">Github</button>
        <button class="pub-button" onclick="toggleContent('data1')">Data</button>
        <button class="pub-button" onclick="toggleContent('model1')">Model</button>
        <button class="pub-button" onclick="toggleContent('bibtex1')">BibTeX</button>
    </div>
    
    <div id="description1" class="pub-content">
        This dataset consists of more than 250,000 published press releases from 67 parties in nine European countries. It provides a hand-labeled subset in 21 unique CAP issue categories. It can be used to dynamically measure parties' issue salience.
    </div>
    
    <div id="article1" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.1177/20531680231183512" target="_blank" rel="noopener">View on Research & Politics →</a>
        </div>
    </div>
    
    <div id="github1" class="pub-content">
        <div class="external-link-content">
            <a href="https://github.com/cornelius-erfort/partypress" target="_blank" rel="noopener">View Code Repository →</a>
        </div>
    </div>
    
    <div id="data1" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.7910/DVN/OINX7Q" target="_blank" rel="noopener">View on Dataverse →</a>
        </div>
    </div>
    
    <div id="model1" class="pub-content">
        <div class="external-link-content">
            <a href="https://huggingface.co/partypress/partypress-multilingual" target="_blank" rel="noopener">View on Hugging Face →</a>
        </div>
    </div>

    <div id="bibtex1" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_2023,
  title = {The PARTYPRESS Database: A new comparative database of parties' press releases},
  author = {Erfort, Cornelius and Stoetzer, Lukas F and Kl{\"u}ver, Heike},
  journal = {Research \& Politics},
  volume = {10},
  number = {3},
  pages = {20531680231183512},
  year = {2023},
  doi = {10.1177/20531680231183512},
  url = {https://doi.org/10.1177/20531680231183512}
}
</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex1')">Download</button>
        </div>
    </div>
</td>
</tr>

<tr>
<td style="border:none">
    <b>Election Dataset Germany 1953-2021 and 1953-2017: County-level results made comparable over time using geodata and areal weighted interpolation</b> <br>
    <span class="author-name">Cornelius Erfort</span> <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('description2')">Description</button>
        <button class="pub-button" onclick="toggleContent('github2017')">Github 2017</button>
        <button class="pub-button" onclick="toggleContent('github2021')">Github 2021</button>
        <button class="pub-button" onclick="toggleContent('bibtex2')">BibTeX</button>
    </div>
    
    <div id="description2" class="pub-content">
        This repository provides historic, comparable county-level election results for West Germany since 1953 in the borders of 2017 and 2021 counties. These can be easily merged with other historic data on the county level using offical county ID numbers (AGS, Allgemeiner Gemeindeschlüssel) that are also provided. The final dataset contains estimates for the vote share of all major parties for each election from 1953-2017/2021 (within the boundaries of the 2017/2021 counties) obtained from areal weighted interpolation.
    </div>
    
    <div id="github2017" class="pub-content">
        <div class="external-link-content">
            <a href="https://github.com/cornelius-erfort/germany-53-17-districts" target="_blank" rel="noopener">View 2017 Repository →</a>
        </div>
    </div>
    
    <div id="github2021" class="pub-content">
        <div class="external-link-content">
            <a href="https://github.com/cornelius-erfort/germany-53-21-districts" target="_blank" rel="noopener">View 2021 Repository →</a>
        </div>
    </div>

    <div id="bibtex2" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@dataset{erfort_2023_election,
  title = {Election Dataset {Germany} 1953-2021 and 1953-2017: County-level results made comparable over time using geodata and areal weighted interpolation},
  author = {Erfort, Cornelius},
  year = {2023},
  publisher = {GitHub},
  url = {https://github.com/cornelius-erfort/germany-53-21-districts},
  note = {Version 1.0}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex2')">Download</button>
        </div>
    </div>
</td>
</tr>

<tr>
<td style="border:none">
    <b>Party Press Releases from Parties in 30 Countries until 2025</b> <br>
    <span class="author-name">Cornelius Erfort</span> and <a href="https://z-dickson.github.io/">Zach Dickson</a> <br>
    <i>Coming soon</i> <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('description3')">Description</button>
        <button class="pub-button" onclick="toggleContent('status3')">Status</button>
    </div>
    
    <div id="description3" class="pub-content">
        A comprehensive dataset of approximately 400,000 press releases from over 150 parties across 30 countries, extending coverage until 2025. This expanded dataset builds upon the original PARTYPRESS database to provide broader comparative coverage of party communication strategies and issue salience across diverse political systems.
    </div>
    
    <div id="status3" class="pub-content">
        <div class="external-link-content">
            <p><strong>Status:</strong> Coming soon</p>
            <p>This project is currently in development and will be available in the near future.</p>
        </div>
    </div>
</td>
</tr>
</table>

<style>
.publication-buttons {
    margin-top: 8px;
}
.pub-button, .btn.btn-sm.z-depth-0 {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    margin-right: 8px;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #494e52 !important;
    display: inline-block;
    font-weight: normal !important;
    box-shadow: none !important;
}
.pub-button:hover, .btn.btn-sm.z-depth-0:hover {
    background: #e9ecef;
    text-decoration: none;
    color: #494e52 !important;
}
.pub-button:focus, .btn.btn-sm.z-depth-0:focus {
    outline: none;
    box-shadow: none !important;
}
.pub-content {
    display: none;
    margin: 10px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.9em;
    height: 0;
    overflow: hidden;
    transition: height 0.3s ease;
    position: relative;
    z-index: 1;
}
.pub-content.active {
    display: block;
    height: auto;
    animation: slideDown 0.3s ease;
}
.publication-entry {
    vertical-align: top;
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.external-link-content {
    margin-top: 10px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
}
.external-link-content a {
    display: inline-block;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin: 5px 0;
    text-decoration: none;
    color: #494e52;
    transition: all 0.2s ease;
}
.external-link-content a:hover {
    background: #e9ecef;
    text-decoration: none;
}

.author-name {
    border-bottom: 1px dashed #494e52;
    padding-bottom: 1px;
}

.publication-image-cell {
    width: 120px;
    min-width: 120px;
    vertical-align: top;
}

.publication-image-cell img {
    width: 100%;
    height: auto;
    display: block;
}

/* Add media query for mobile devices */
@media screen and (max-width: 768px) {
    .publication-image-cell {
        width: 80px;
        min-width: 80px;
        padding-right: 15px;
    }
}

table {
    table-layout: fixed;
    width: 100%;
}

td:not(.publication-image-cell) {
    width: auto;
}
</style>

<script>
function toggleContent(id) {
    const allContent = document.querySelectorAll('.pub-content');
    const clickedContent = document.getElementById(id);
    
    allContent.forEach(div => {
        if (div.id !== id) {
            div.style.height = '0';
            div.classList.remove('active');
        }
    });
    
    if (clickedContent.classList.contains('active')) {
        clickedContent.style.height = '0';
        clickedContent.classList.remove('active');
    } else {
        clickedContent.classList.add('active');
        clickedContent.style.height = clickedContent.scrollHeight + 'px';
    }
}
</script>


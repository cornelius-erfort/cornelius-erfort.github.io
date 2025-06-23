---
permalink: /
title: "Cornelius Erfort"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<script type="text/javascript">
(function() {
    // Global variable to track default sorting order
    window.defaultSortOrder = [];
    
    window.toggleContent = function(id) {
        console.log("Toggling content for ID:", id);
        var allContent = document.getElementsByClassName('pub-content');
        var clickedContent = document.getElementById(id);
        
        if (!clickedContent) {
            console.error("No element found with ID:", id);
            return;
        }

        for (var i = 0; i < allContent.length; i++) {
            if (allContent[i].id !== id) {
                allContent[i].style.height = '0';
                allContent[i].classList.remove('active');
            }
        }
        
        if (clickedContent.classList.contains('active')) {
            clickedContent.style.height = '0';
            clickedContent.classList.remove('active');
        } else {
            clickedContent.classList.add('active');
            clickedContent.style.height = clickedContent.scrollHeight + 'px';
        }
    };

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

    window.resetFilters = function() {
        document.getElementById('yearFilter').value = '';
        document.getElementById('journalFilter').value = '';
        filterPublications();
    };

    function getSortFunction(sortBy) {
        if (sortBy === 'year') {
            return function(a, b) {
                var yearOrder = {'forthcoming': 0, '2025': 1, '2024': 2, '2023': 3};
                var aYear = a.getAttribute('data-year');
                var bYear = b.getAttribute('data-year');
                var aVal = yearOrder[aYear] !== undefined ? yearOrder[aYear] : 99;
                var bVal = yearOrder[bYear] !== undefined ? yearOrder[bYear] : 99;
                if (aVal !== bVal) return aVal - bVal;
                // fallback to default order if same year
                var aIndex = window.defaultSortOrder.indexOf(a);
                var bIndex = window.defaultSortOrder.indexOf(b);
                return aIndex - bIndex;
            };
        } else if (sortBy === 'journal') {
            return function(a, b) {
                var aJournal = a.getAttribute('data-journal') || '';
                var bJournal = b.getAttribute('data-journal') || '';
                if (aJournal < bJournal) return -1;
                if (aJournal > bJournal) return 1;
                // fallback to default order if same journal
                var aIndex = window.defaultSortOrder.indexOf(a);
                var bIndex = window.defaultSortOrder.indexOf(b);
                return aIndex - bIndex;
            };
        } else {
            // default
            return function(a, b) {
                var aIndex = window.defaultSortOrder.indexOf(a);
                var bIndex = window.defaultSortOrder.indexOf(b);
                return aIndex - bIndex;
            };
        }
    }

    window.filterPublications = function() {
        var yearFilter = document.getElementById('yearFilter').value;
        var journalFilter = document.getElementById('journalFilter').value;
        var sortBy = document.getElementById('sortBy') ? document.getElementById('sortBy').value : 'default';
        var publications = Array.from(document.querySelectorAll('#publicationsTable tr'));
        var visible = [];

        publications.forEach(function(pub) {
            var year = pub.getAttribute('data-year');
            var journal = pub.getAttribute('data-journal');
            
            var yearMatch = !yearFilter || year === yearFilter;
            var journalMatch = !journalFilter || journal === journalFilter;
            
            if (yearMatch && journalMatch) {
                visible.push(pub);
            }
        });

        // Sorting
        visible.sort(getSortFunction(sortBy));
        
        // Hide all first
        publications.forEach(function(pub) { pub.style.display = 'none'; });
        // Show filtered and sorted
        visible.forEach(function(pub, i) {
            if (i < 3) {
                pub.style.display = '';
            } else {
                pub.style.display = 'none';
            }
        });
        
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        var resetFiltersBtn = document.getElementById('resetFiltersBtn');
        var totalVisible = visible.length;
        
        if (totalVisible > 3) {
            loadMoreBtn.style.display = 'inline-block';
            resetFiltersBtn.style.display = 'none';
        } else if (totalVisible === 0) {
            loadMoreBtn.style.display = 'none';
            resetFiltersBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
            resetFiltersBtn.style.display = 'none';
        }
    };

    window.loadMorePublications = function() {
        var yearFilter = document.getElementById('yearFilter').value;
        var journalFilter = document.getElementById('journalFilter').value;
        var sortBy = document.getElementById('sortBy') ? document.getElementById('sortBy').value : 'default';
        var publications = Array.from(document.querySelectorAll('#publicationsTable tr'));
        var maxVisible = 8;
        var visible = [];

        publications.forEach(function(pub) {
            var year = pub.getAttribute('data-year');
            var journal = pub.getAttribute('data-journal');
            
            var yearMatch = !yearFilter || year === yearFilter;
            var journalMatch = !journalFilter || journal === journalFilter;
            
            if (yearMatch && journalMatch) {
                visible.push(pub);
            }
        });

        // Sorting
        visible.sort(getSortFunction(sortBy));
        
        // Hide all first
        publications.forEach(function(pub) { pub.style.display = 'none'; });
        // Show filtered and sorted
        visible.forEach(function(pub, i) {
            if (i < maxVisible) {
                pub.style.display = '';
            } else {
                pub.style.display = 'none';
            }
        });
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        var totalVisible = visible.length;
        if (maxVisible >= totalVisible) {
            loadMoreBtn.style.display = 'none';
        } else if (totalVisible > maxVisible) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    };

    function getVisiblePublications() {
        var yearFilter = document.getElementById('yearFilter').value;
        var journalFilter = document.getElementById('journalFilter').value;
        var publications = document.querySelectorAll('#publicationsTable tr');
        var visible = [];

        publications.forEach(function(pub, index) {
            var year = pub.getAttribute('data-year');
            var journal = pub.getAttribute('data-journal');
            
            var yearMatch = !yearFilter || year === yearFilter;
            var journalMatch = !journalFilter || journal === journalFilter;
            
            if (yearMatch && journalMatch) {
                visible.push(pub);
            }
        });

        return visible;
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize default sort order based on the current DOM order
        var publications = Array.from(document.querySelectorAll('#publicationsTable tr'));
        window.defaultSortOrder = publications.slice();
        filterPublications();
    });
})();
</script>

I am a Postdoc at the [Witten/Herdecke University](https://www.uni-wh.de), working on the project [Election Forecasts for the German Federal Election 2025 (zweitstimme.org)](https://zweitstimme.org/).

My general interests are in comparative politics and quantitative methods. More specifically, I am working on voter targeting, interest groups, and voting behavior.

In my dissertation, I analyzed how parties use the target and tailor their digital election ads. I was member of the Research Training Group [DYNAMICS](https://www.sowi.hu-berlin.de/en/dynamics/about-dynamics/about) which is jointly organized by [Humboldt-Universität zu Berlin](https://www.hu-berlin.de/en) and the [Hertie School](https://www.hertie-school.org/en/study/graduate-programmes/phd/phd-programmes/dynamics). During my PhD, I visited the [LSE Department of Government](https://www.lse.ac.uk/government) for one term (2023). I completed my pre-doctoral studies at the Humboldt-Universität, spent a semester at the [CIDE](https://www.cide.edu) in Mexico City (2017) and have a background in mechanical engineering.

On this website, you can find more information on my research projects and download a copy of my [CV (PDF)](/cv).

# Publications
<div class="filter-controls" markdown="0">
    <label for="yearFilter">Year:</label>
    <select id="yearFilter" onchange="filterPublications()">
        <option value="">All Years</option>
        <option value="forthcoming">Forthcoming</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
    </select>
    <label for="journalFilter">Journal:</label>
    <select id="journalFilter" onchange="filterPublications()">
        <option value="">All Journals</option>
        <option value="The Journal of Politics">The Journal of Politics</option>
        <option value="Electoral Studies">Electoral Studies</option>
        <option value="PS: Political Science & Politics">PS: Political Science & Politics</option>
        <option value="Research and Politics">Research and Politics</option>
    </select>
    <label for="sortBy">Sort by:</label>
    <select id="sortBy" onchange="filterPublications()">
        <option value="default">Default</option>
        <option value="year">Year</option>
        <option value="journal">Journal</option>
    </select>
</div>
<table id="publicationsTable" style="border:none">
<tr data-year="forthcoming" data-journal="The Journal of Politics">
<td class="publication-image-cell" style="border:none">
  <a href="https://osf.io/5vs9b/"><img src="/files/jop.jpeg"></a>
</td>
<td style="border:none">
    <b>Gendered targeting: Do parties tailor their campaign ads to women?</b> <br>
    <span class="author-name">Cornelius Erfort</span> <br>
    <i>The Journal of Politics</i>, forthcoming <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract1')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex1')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('preprint1')">Article</button>
        <button class="pub-button" onclick="toggleContent('data1')">Data</button>
    </div>
    
    <div id="abstract1" class="pub-content">
        Are parties communicating differently to women? A growing literature documents gender differences in the political behavior of both voters and politicians, and suggests that this can help or hurt parties electorally. We still know little, however, about whether and how parties adapt their campaign strategies and differentiate their communication accordingly. I analyze how parties strategically vary their communication in ads targeting women using a new comprehensive dataset of over 60,000 Facebook and Instagram ads from 151 parties during the 2019 European Parliament election. Large-scale computational vision identifies the audience-specific tailoring of ads targeted for female audiences in parties' social media ad images and videos. The results show that parties tailor the content of their ads to women. The findings are important because they uncover gendered strategies in parties' campaign communication which have important implications for political representation and opinion formation.
    </div>
    
    <div id="bibtex1" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_2025,
author = {Erfort, Cornelius},
title = {Gendered targeting: Do parties tailor their campaign ads to women?},
journal = {The Journal of Politics},
year = {forthcoming},
doi = {10.1086/736027},
URL = {https://doi.org/10.1086/736027},
eprint = { https://doi.org/10.1086/736027}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex1')">Download</button>
        </div>
    </div>
    
    <div id="preprint1" class="pub-content">
        <div class="external-link-content">
            <a href="https://www.journals.uchicago.edu/doi/10.1086/736027" target="_blank" rel="noopener">View on Chicago Press →</a>
        </div>
    </div>

        <div id="data1" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.7910/DVN/WLKM8J" target="_blank" rel="noopener">View on Dataverse →</a>
        </div>
    </div>
</td>
</tr>

<tr data-year="forthcoming" data-journal="Electoral Studies">
<td class="publication-image-cell" style="border:none">
  <a href="https://osf.io/jnarh/"><img src="/files/jelst.jpg"></a>
</td>
<td style="border:none">
    <b>Buying Voter Support for Unpopular Policies: Evidence from German Nuclear Power Plants</b> <br>
    <a href="https://antoniovalentim.github.io">António Valentim</a>, <a href="http://heike-kluever.com/">Heike Klüver</a> and <span class="author-name">Cornelius Erfort</span><br>
    <i>Electoral Studies</i>, forthcoming <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract4')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex4')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('preprint4')">Preprint</button>
    </div>
    
    <div id="abstract4" class="pub-content">
        How can governments ensure voters' support for unpopular policies? Policymakers often have to implement policies that are unpopular in local communities, such as the construction of windmills or nuclear power plants. However, little is known about how policymakers can increase local support. We argue that perceived economic benefits increase support for otherwise unpopular policies. We test our argument by studying the consequences of nuclear power plants on support for the Green Party in Germany, a strong opponent of nuclear energy. We collected a novel dataset on the geographic location of nuclear plants and voting records since the 1980s. Using difference-in-differences and instrumental variable designs, we find that the opening of nuclear power plants has a negative effect on the vote share of the Greens. Additional individual-level panel analyses suggest that this effect is driven by economic considerations. Overall, these results are relevant for the study of energy transitions and the design of unpopular policies more generally.
    </div>
    
    <div id="bibtex4" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_valentim_kluver_2024,
  title = {Buying Voter Support for Unpopular Policies: {Evidence} from {German} Nuclear Power Plants},
  author = {Erfort, Cornelius and Valentim, António and Klüver, Heike},
  journal = {Electoral Studies},
  year = {forthcoming},
  doi = {10.31219/osf.io/jnarh},
  url = {https://osf.io/jnarh}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex4')">Download</button>
        </div>
    </div>
    
    <div id="preprint4" class="pub-content">
        <div class="external-link-content">
            <a href="https://osf.io/jnarh/" target="_blank" rel="noopener">View on OSF →</a>
        </div>
    </div>
</td>
</tr>

<tr data-year="2024" data-journal="Electoral Studies">
<td class="publication-image-cell" style="border:none">
  <a href="https://doi.org/10.1016/j.electstud.2024.102872"><img src="/files/jelst.jpg"></a>
</td>
<td style="border:none">
    <b>Targeting Voters Online: How Parties' Campaigns Differ</b> <br>
    <span class="author-name">Cornelius Erfort</span> <br>
    <i>Electoral Studies</i>, 2024 <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract2')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex2')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('article2')">Article</button>
        <button class="pub-button" onclick="toggleContent('github2')">Github</button>
    </div>
    
    <div id="abstract2" class="pub-content">
        How do parties target campaign ads online? Despite the growing importance of digital campaigns, only a few recent studies have analyzed whom parties are targeting. Do parties aim to persuade or mobilize voters? This paper analyzes how parties target and how they differ in their use of targeting using a new and comprehensive dataset, matching data from the Facebook Ad Library with EES survey responses. The dataset contains over 100,000 Facebook and Instagram ads from 148 parties for the 2019 European Parliament elections. The results show that smaller and niche parties have targeting strategies more narrowly focused on their supporters, whereas larger parties target a broader audience. My findings have important implications for research on voter targeting and the ongoing debate about the regulation of campaigns online.
    </div>
    
    <div id="bibtex2" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_2024,
  title = {Targeting voters online: How parties' campaigns differ},
  journal = {Electoral Studies},
  volume = {92},
  pages = {102872},
  year = {2024},
  issn = {0261-3794},
  doi = {https://doi.org/10.1016/j.electstud.2024.102872},
  url = {https://www.sciencedirect.com/science/article/pii/S0261379424001306},
  author = {Cornelius Erfort},
  keywords = {Voter targeting, Party competition, Electoral campaigns, Political behavior}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex2')">Download</button>
        </div>
    </div>
    
    <div id="article2" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.1016/j.electstud.2024.102872" target="_blank" rel="noopener">View on Electoral Studies →</a>
        </div>
    </div>
    
    <div id="github2" class="pub-content">
        <div class="external-link-content">
            <a href="https://github.com/cornelius-erfort/targeting-voters-online" target="_blank" rel="noopener">View Code Repository →</a>
        </div>
    </div>
</td>
</tr>

<tr data-year="2025" data-journal="Electoral Studies">
<td class="publication-image-cell" style="border:none">
  <a href="https://doi.org/10.1016/j.electstud.2025.102939"><img src="/files/jelst.jpg"></a>
</td>
<td style="border:none">
    <b>An Election Forecasting Model for Subnational Elections</b> <br>
    <a href="https://www.lukas-stoetzer.org">Lukas F. Stoetzer</a>, <span class="author-name">Cornelius Erfort</span>, <a href="https://www.uni-mannheim.de/gess/programs/cdss/our-students/2022/hannah-rajski/">Hannah Rajski</a>, <a href="https://www.sowi.uni-mannheim.de/gschwend/">Thomas Gschwend</a>, <a href="https://simonmunzert.com">Simon Munzert</a>, and <a href="https://elias-koch.com">Elias Koch</a> <br>
    <i>Electoral Studies</i>, 2025 <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract9')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex9')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('article9')">Article</button>
    </div>
    
    <div id="abstract9" class="pub-content">
        While election forecasts predominantly focus on national contests, many democratic elections take place at the subnational level.  Subnational elections pose unique challenges for traditional fundamentals forecasting models due to less available polling data and idiosyncratic subnational politics. In this article, we present and evaluate the performance of Bayesian forecasting models for German state elections from 1990 to 2024. Our forecasts demonstrate high accuracy at lead times of two days, two weeks, and two months, and offer valuable ex-ante predictions for three state elections held in September 2024. These findings underscore the potential for applying election forecasting models effectively to subnational elections.
    </div>
    
    <div id="bibtex9" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_stoetzer_rajski_gschwend_munzert_koch_2025,
  title = {An Election Forecasting Model for Subnational Elections},
  author = {Erfort, Cornelius and Stoetzer, Lukas F. and Rajski, Hannah and Gschwend, Thomas and Munzert, Simon and Koch, Elias},
  journal = {Electoral Studies},
  volume = {95},
  pages = {102939},
  year = {2025},
  issn = {0261-3794},
  doi = {https://doi.org/10.1016/j.electstud.2025.102939}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex9')">Download</button>
        </div>
    </div>
    <div id="article9" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.1016/j.electstud.2025.102939" target="_blank" rel="noopener">View on Electoral Studies →</a>
        </div>
    </div>
</td>
</tr>

<tr data-year="2025" data-journal="PS: Political Science & Politics">
<td class="publication-image-cell" style="border:none">
  <a href="https://www.cambridge.org/core/journals/ps-political-science-and-politics/article/zweitstimme-forecast-for-the-german-federal-election-2025-coalition-majorities-and-vacant-districts/9DD258D89C69F73D1AFC284B0CDBE54D"><img src="/files/ps.jpg"></a>
</td>
<td style="border:none">
    <b>The Zweitstimme Forecast for the German Federal Election 2025: Coalition Majorities and Vacant Districts</b> <br>
    <span class="author-name">Cornelius Erfort</span>, <a href="https://www.lukas-stoetzer.org">Lukas F. Stoetzer</a>, <a href="https://www.sowi.uni-mannheim.de/gschwend/">Thomas Gschwend</a>, <a href="https://elias-koch.com">Elias Koch</a>, <a href="https://simonmunzert.com">Simon Munzert</a>, and <a href="https://www.uni-mannheim.de/gess/programs/cdss/our-students/2022/hannah-rajski/">Hannah Rajski</a> <br>
    <i>PS: Political Science & Politics</i>, 2025 <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract8')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex8')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('article8')">Article</button>
    </div>
    
    <div id="abstract8" class="pub-content">
        In this article, we provide a forecast for the German Federal Election of 2025. We use our previous forecasting models to provide national-level forecasts for party vote shares and districtlevel outcomes for candidate votes. We show that the combination of both permits us to calculate both forecasts for coalition majorities in parliament, and "vacant districts" under the recent electoral reforms.
    </div>
    
    <div id="bibtex8" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{Erfort_Stoetzer_Gschwend_Koch_Munzert_Rajski_2025, 
        title={The Zweitstimme Forecast for the German Federal Election 2025: Coalition Majorities and Vacant Districts}, DOI={10.1017/S1049096525000150}, 
        journal={PS: Political Science &#38; Politics}, 
        author={Erfort, Cornelius and Stoetzer, Lukas F. and Gschwend, Thomas and Koch, Elias and Munzert, Simon and Rajski, Hannah}, 
        year={2025}, 
        pages={1–12}}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex8')">Download</button>
        </div>
    </div>
    
    <div id="article8" class="pub-content">
        <div class="external-link-content">
            <a href="https://www.cambridge.org/core/journals/ps-political-science-and-politics/article/zweitstimme-forecast-for-the-german-federal-election-2025-coalition-majorities-and-vacant-districts/9DD258D89C69F73D1AFC284B0CDBE54D" target="_blank" rel="noopener">View on Cambridge Core →</a>
        </div>
    </div>
</td>
</tr>

<tr data-year="2023" data-journal="Research and Politics">
<td class="publication-image-cell" style="border:none">
  <a href="https://doi.org/10.1177/20531680231183512"><img src="/files/57369_RAP.jpg"></a>
</td>
<td style="border:none">
    <b>The PARTYPRESS Database</b> <br>
    <span class="author-name">Cornelius Erfort</span>, <a href="https://www.lukas-stoetzer.org">Lukas F. Stoetzer</a>, and <a href="http://www.heike-kluever.com">Heike Klüver</a> <br>
    <i>Research and Politics</i>, 2023 <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract3')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex3')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('article3')">Article</button>
        <button class="pub-button" onclick="toggleContent('github3')">Github</button>
        <button class="pub-button" onclick="toggleContent('data3')">Data</button>
        <button class="pub-button" onclick="toggleContent('model3')">Model</button>
    </div>
    
    <div id="abstract3" class="pub-content">
        We present the PARTYPRESS Database, which compiles more than 250,000 published press releases from 68 parties in 9 European countries. The database covers the press releases of the most relevant political parties in these countries from 2010 onward. It provides a supervised machine learning classification of press releases into 21 unique issue categories according to a general codebook. The PARTYPRESS Database can be used to study parties' issue agendas comparatively and over time. We extend a recent analysis in Gessler and Hunger (2022) to illustrate the usefulness of the database in studying dynamic party competition, communication, and behavior.
    </div>
    
    <div id="bibtex3" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@article{erfort_2023,
  title = {The PARTYPRESS Database: A new comparative database of parties' press releases},
  author = {Erfort, Cornelius and Stoetzer, Lukas F and Klüver, Heike},
  journal = {Research \& Politics},
  volume = {10},
  number = {3},
  pages = {20531680231183512},
  year = {2023},
  doi = {10.1177/20531680231183512},
  url = {https://doi.org/10.1177/20531680231183512}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex3')">Download</button>
        </div>
    </div>
    
    <div id="article3" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.1177/20531680231183512" target="_blank" rel="noopener">View on Research & Politics →</a>
        </div>
    </div>
    
    <div id="github3" class="pub-content">
        <div class="external-link-content">
            <a href="https://github.com/cornelius-erfort/partypress" target="_blank" rel="noopener">View Code Repository →</a>
        </div>
    </div>
    
    <div id="data3" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.7910/DVN/OINX7Q" target="_blank" rel="noopener">View on Dataverse →</a>
        </div>
    </div>
    
    <div id="model3" class="pub-content">
        <div class="external-link-content">
            <a href="https://huggingface.co/partypress/partypress-multilingual" target="_blank" rel="noopener">View on Hugging Face →</a>
        </div>
    </div>
</td>
</tr>
</table>
<div class="load-more-container" markdown="0">
    <button id="loadMoreBtn" class="load-more-btn" onclick="loadMorePublications()" style="display: none;">Load More Publications</button>
    <button id="resetFiltersBtn" class="reset-filters-btn" onclick="resetFilters()" style="display: none;">Reset Filters</button>
</div>

## Working Papers

<table style="border:none">
<tr>
<td class="publication-image-cell" style="border:none">
  <div class="document-icon">📄</div>
</td>
<td style="border:none">
    <b>Parties' issue adaption between elections</b> <br>
    <span class="author-name">Cornelius Erfort</span>, <a href="http://lukas-stoetzer.org/">Lukas F. Stoetzer</a>, and <a href="http://heike-kluever.com/">Heike Klüver</a> <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract5')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex5')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('preprint5')">Preprint</button>
    </div>
    
    <div id="abstract5" class="pub-content">
        Are parties responsive to short-term changes in election polls? While party responsiveness to election results has received much attention, we know little about the dynamics of issue attention between elections. In this study, we address this question based on the novel comprehensive PARTYPRESS Database. We rely on supervised machine learning methods to build a dynamic measure of parties' issue attention on the basis of more than 250,000 press releases from 68 parties across nine countries from 2010 until 2020. We find little support that losing in the polls leads parties to change their issue attention. When political parties lose support in the polls, they do not clearly prioritize their owned issue, they do not pay more attention to popular issues, and they do not adapt the issue focus of successful competitors. These findings have important implications for our understanding of party responsiveness and the dynamics of electoral competition.
    </div>
    
    <div id="bibtex5" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@unpublished{erfort_stoetzer_kluver_2024,
  title = {Parties' issue adaption between elections},
  author = {Erfort, Cornelius and Stoetzer, Lukas F. and Klüver, Heike},
  year = {2024},
  doi = {10.31219/osf.io/6n3z4},
  url = {https://doi.org/10.31219/osf.io/6n3z4}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex5')">Download</button>
        </div>
    </div>
    
    <div id="preprint5" class="pub-content">
        <div class="external-link-content">
            <a href="https://doi.org/10.31219/osf.io/6n3z4" target="_blank" rel="noopener">View on OSF →</a>
        </div>
    </div>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <div class="document-icon">📄</div>
</td>
<td style="border:none">
    <b>Measuring protest through news articles: A validation approach for manual and semi-supervised methods using government data</b> <br>
    <span class="author-name">Cornelius Erfort</span> <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract6')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex6')">BibTeX</button>
        <button class="pub-button" onclick="toggleContent('preprint6')">Preprint</button>
    </div>
    
    <div id="abstract6" class="pub-content">
        Protests are an important and well researched aspect of political behavior, making measurement validity crucial. But protests can be difficult to observe. Most studies use newspapers for event coding, introducing a selection bias. Validation usually involves comparing different newspapers or using independent sources. I benchmark a manually and a partly automatically coded dataset from the PolDem project against a large government dataset covering all extreme right demonstrations in Germany from 2005 to 2020. Coverage in newspapers mainly depends on region and size. Machine learning can provide a good estimate about the possible misdetection of events. The results have important implications for the study of protests. Researchers should carefully assess the advantages and shortfalls of media-based datasets.
    </div>
    
    <div id="bibtex6" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@unpublished{erfort_2024_measuring,
  title = {Measuring protest through news articles: {A} validation approach for manual and semi-supervised methods using government data},
  author = {Erfort, Cornelius},
  year = {2024},
  doi = {10.31219/osf.io/g9t8y},
  url = {https://osf.io/g9t8y}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex6')">Download</button>
        </div>
    </div>
    
    <div id="preprint6" class="pub-content">
        <div class="external-link-content">
            <a href="https://osf.io/g9t8y/" target="_blank" rel="noopener">View on OSF →</a>
        </div>
    </div>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <div class="document-icon">📄</div>
</td>
<td style="border:none">
    <b>Who Becomes a Lobbyist? Evidence from the US and Germany</b> <br>
    <span class="author-name">Cornelius Erfort</span>, <a href="https://www.janstuckatz.com">Jan Stuckatz</a>, <a href="https://hartmannfelix.github.io">Felix Hartmann</a>, and <a href="http://heike-kluever.com/">Heike Klüver</a> <br>
    <div class="publication-buttons">
        <button class="pub-button" onclick="toggleContent('abstract7')">Abstract</button>
        <button class="pub-button" onclick="toggleContent('bibtex7')">BibTeX</button>
    </div>
    
    <div id="abstract7" class="pub-content">
        Abstract content would go here when available
    </div>
    
    <div id="bibtex7" class="pub-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <pre>@unpublished{erfort_stuckatz_hartmann_kluver_2024,
  title = {Who Becomes a Lobbyist?},
  author = {Erfort, Cornelius and Stuckatz, Jan and Hartmann, Felix and Klüver, Heike},
  year = {2024}
}</pre>
            <button class="pub-button" onclick="downloadBibtex('bibtex7')">Download</button>
        </div>
    </div>
</td>
</tr>
</table>

## Media

<table style="border:none">
<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/politico.png" alt="POLITICO logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>POLITICO</b> <br>
    <a href="https://www.politico.eu/article/schwerin-city-expose-germany-deep-migration-divide/" target="_blank" rel="noopener noreferrer">"The city that exposes Germany's deep migration divide"</a> <br>
    <span class="media-date">February 18, 2025</span>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/tagesspiegel.png" alt="Tagesspiegel logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>Tagesspiegel</b> <br>
    <a href="https://www.tagesspiegel.de/potsdam/brandenburg/erst-und-zweitstimme-taktisch-wahlen-und-co-wie-viel-einfluss-hat-der-brandenburger-wahler-13221547.html" target="_blank" rel="noopener noreferrer">"Mit der Erst- und Zweitstimme taktisch wählen: Wie viel Einfluss hat der Brandenburger Wähler?"</a> <br>
    <span class="media-date">February 21, 2025</span>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/guardian.png" alt="The Guardian logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>The Guardian</b> <br>
    <a href="https://www.theguardian.com/world/2025/feb/12/why-germany-greens-switching-election-focus-from-climate" target="_blank" rel="noopener noreferrer">"The far right wants us to play by their rules: Can German Greens survive 'witch-hunt'?"</a> <br>
    <span class="media-date">February 12, 2025</span>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/zeit.png" alt="ZEIT ONLINE logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>ZEIT ONLINE</b> <br>
    <a href="https://www.zeit.de/politik/deutschland/2025-02/bundestagswahl-prognose-fuenf-prozent-huerde-fdp-bsw-linke" target="_blank" rel="noopener noreferrer">"Friedrich Merz: Das wären seine Koalitionen"</a> <br>
    <span class="media-date">February 4, 2025</span>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/economist.png" alt="The Economist logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>The Economist</b> <br>
    <a href="https://www.economist.com/interactive/2025-german-election-polls-prediction-forecast" target="_blank" rel="noopener noreferrer">"Who is ahead in the race for Germany's next parliament?"</a> <br>
    <span class="media-date">January 28, 2025</span>
</td>
</tr>

<tr>
<td class="publication-image-cell" style="border:none">
  <img src="/files/logos/abendzeitung.png" alt="Abendzeitung München logo" style="width:100%;height:auto;display:block;" />
</td>
<td style="border:none">
    <b>Abendzeitung München</b> <br>
    <a href="https://www.abendzeitung-muenchen.de/muenchen/welche-folgen-hat-das-neue-wahlrecht-fuer-muenchen-art-1033918" target="_blank" rel="noopener noreferrer">"Wahlrechtsreform und CSU: Wer in München um das Direktmandat kämpft"</a> <br>
    <span class="media-date">January 27, 2025</span>
</td>
</tr>
</table>

<style>
.filter-controls {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
}
.filter-controls select {
    padding: 4px 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: #fff;
    font-size: 12px;
    cursor: pointer;
    min-width: 90px;
    max-width: 120px;
}
.filter-controls select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}
.load-more-container {
    text-align: center;
    margin-top: 20px;
}
.load-more-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
}
.load-more-btn:hover {
    background: #545b62;
}
.reset-filters-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
}
.reset-filters-btn:hover {
    background: #545b62;
}
.document-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    font-size: 48px;
    color: #6c757d;
}
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
    padding-right: 20px;
}
.publication-image-cell img {
    width: 100%;
    height: auto;
    display: block;
}
@media screen and (max-width: 768px) {
    .publication-image-cell {
        width: 80px;
        min-width: 80px;
        padding-right: 15px;
    }
    .filter-controls {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
        align-items: flex-start;
    }
    .filter-controls label {
        font-size: 12px;
    }
    .filter-controls select {
        font-size: 11px;
        min-width: 70px;
        max-width: 100px;
        padding: 3px 6px;
    }
    .document-icon {
        font-size: 32px;
    }
}
table {
    table-layout: fixed;
    width: 100%;
}
td:not(.publication-image-cell) {
    width: auto;
}
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.media-item {
    text-decoration: none;
    color: inherit;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.media-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.media-content {
    padding: 20px;
}
.media-content h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.2em;
}
.media-content p {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 0.95em;
    line-height: 1.4;
}
.media-date {
    color: #999;
    font-size: 0.85em;
}
@media screen and (max-width: 768px) {
    .media-grid {
        grid-template-columns: 1fr;
    }
}
table td {
    padding: 10px 0;
}
</style>

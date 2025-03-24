---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

<div markdown="0">
<style>
.cv-container {
    margin: 20px 0;
    max-width: 595px; /* A4 width at 72dpi */
    margin-left: 0;
    margin-right: auto;
}
.pdf-viewer {
    width: 100%;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin-bottom: 20px;
}
.download-button {
    display: inline-block;
    padding: 8px 16px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin: 10px 0;
    text-decoration: none;
    color: #494e52;
    transition: all 0.2s ease;
}
.download-button:hover {
    background: #e9ecef;
    text-decoration: none;
}
.page-controls {
    text-align: center;
    margin: 10px 0;
}
.page-button {
    padding: 5px 15px;
    margin: 0 5px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.page-button:hover {
    background: #e9ecef;
}
.page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<a href="/files/cv_erfort.pdf" class="download-button" download>Download CV (PDF)</a>

<div class="page-controls">
    <button class="page-button" id="prev" onclick="changePage(-1)">Previous</button>
    <span id="page-num">1</span> / <span id="page-count">1</span>
    <button class="page-button" id="next" onclick="changePage(1)">Next</button>
</div>

<div class="cv-container">
    <canvas id="cvCanvas" class="pdf-viewer"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentPage = 1;
let pdfDoc = null;

function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(function(page) {
        var canvas = document.getElementById('cvCanvas');
        var context = canvas.getContext('2d');
        
        var containerWidth = canvas.parentElement.clientWidth;
        var viewport = page.getViewport({scale: 1.0});
        
        var desiredDPI = 150;
        var scale = (containerWidth / viewport.width) * (desiredDPI / 72); 
        
        viewport = page.getViewport({scale: scale});
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        page.render({
            canvasContext: context,
            viewport: viewport,
            renderInteractiveForms: false,
            background: 'white'
        });
    });
}

function changePage(offset) {
    currentPage = Math.min(Math.max(currentPage + offset, 1), pdfDoc.numPages);
    document.getElementById('page-num').textContent = currentPage;
    renderPage(currentPage);
    
    document.getElementById('prev').disabled = currentPage <= 1;
    document.getElementById('next').disabled = currentPage >= pdfDoc.numPages;
}

function loadPDF() {
    pdfjsLib.getDocument({url: '/files/cv_erfort.pdf'}).promise.then(function(pdf) {
        pdfDoc = pdf;
        document.getElementById('page-count').textContent = pdf.numPages;
        document.getElementById('prev').disabled = true;
        document.getElementById('next').disabled = pdf.numPages <= 1;
        renderPage(1);
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
    });
}

loadPDF();

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') changePage(-1);
    if (e.key === 'ArrowRight') changePage(1);
});
</script>
</div>

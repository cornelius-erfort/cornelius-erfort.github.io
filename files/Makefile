# Rebuild files/cv_erfort.pdf from files/cv_erfort.tex.
#
# Usage (from the repo root or from files/):
#     make -C files            # build cv_erfort.pdf
#     make -C files preview    # build + render page PNG previews
#     make -C files clean      # remove LaTeX intermediates
#     make -C files distclean  # also remove previews and the PDF
#
# Requires pdflatex (TeX Live / TinyTeX) and (for `preview`) Ghostscript.

TEX        := pdflatex
TEXFLAGS   := -interaction=nonstopmode -halt-on-error
GS         := gs

SRC        := cv_erfort.tex
PDF        := cv_erfort.pdf
AUX        := cv_erfort.aux cv_erfort.log cv_erfort.out cv_erfort.toc \
              cv_erfort.synctex.gz cv_erfort.fls cv_erfort.fdb_latexmk

.PHONY: all preview clean distclean

all: $(PDF)

# Two passes: first builds the page count, second resolves the
# `lastpage` references used in the footer.
$(PDF): $(SRC)
	$(TEX) $(TEXFLAGS) $(SRC) >/dev/null
	$(TEX) $(TEXFLAGS) $(SRC) >/dev/null

preview: $(PDF)
	rm -f preview-*.png
	$(GS) -sDEVICE=png16m -r110 -o "preview-%d.png" $(PDF) >/dev/null

clean:
	rm -f $(AUX)

distclean: clean
	rm -f preview-*.png $(PDF)

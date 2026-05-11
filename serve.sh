#!/usr/bin/env bash
# Serve the site locally with Jekyll (requires UTF-8 locale for SCSS)
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
bundle exec jekyll serve "$@"

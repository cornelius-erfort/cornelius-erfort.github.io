#!/usr/bin/env bash
# Serve the site locally with Jekyll (requires UTF-8 locale for SCSS)
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
# Prefer Homebrew Ruby on macOS (system Ruby often cannot build github-pages native gems).
if [ -x /opt/homebrew/opt/ruby/bin/ruby ]; then
  export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
elif [ -x /usr/local/opt/ruby/bin/ruby ]; then
  export PATH="/usr/local/opt/ruby/bin:$PATH"
fi
# Use _config.dev.yml override so URLs resolve to localhost during dev
bundle exec jekyll serve --config _config.yml,_config.dev.yml "$@"

#!/usr/bin/env bash
# Pre-release sanity checks. Run from the repo root; used by both workflows.
#   - chrome/ and firefox/ manifests have the same version
#   - every file outside ALLOWED_DIFFS is identical between chrome/ and firefox/ (ignoring whitespace)
#   - every extension .js file parses
set -euo pipefail

# Files that legitimately differ between browsers (API namespace / manifest format)
ALLOWED_DIFFS="manifest.json background.js popup.js"

fail=0
err() { echo "::error::$*"; fail=1; }

# --- Manifest versions ---
chrome_ver=$(node -p "require('./chrome/manifest.json').version")
firefox_ver=$(node -p "require('./firefox/manifest.json').version")
if [[ "$chrome_ver" != "$firefox_ver" ]]; then
  err "Manifest version mismatch: chrome=$chrome_ver firefox=$firefox_ver"
else
  echo "Manifest versions match: $chrome_ver"
fi

# --- Chrome/Firefox parity ---
chrome_files=$(git ls-files chrome | sed 's|^chrome/||' | sort)
firefox_files=$(git ls-files firefox | sed 's|^firefox/||' | sort)
only=$(comm -3 <(echo "$chrome_files") <(echo "$firefox_files"))
[[ -n "$only" ]] && err "Files present in only one browser folder: $(echo $only)"

for f in $chrome_files; do
  [[ " $ALLOWED_DIFFS " == *" $f "* ]] && continue
  [[ -f "firefox/$f" ]] || continue
  if ! diff -q -w -B "chrome/$f" "firefox/$f" >/dev/null; then
    err "chrome/$f and firefox/$f have drifted (add to ALLOWED_DIFFS only if intentional)"
  fi
done
[[ $fail -eq 0 ]] && echo "Chrome/Firefox parity OK (allowed to differ: $ALLOWED_DIFFS)"

# --- JS syntax ---
for f in $(git ls-files 'chrome/*.js' 'firefox/*.js' | grep -v '\.min\.js$'); do
  node --check "$f" || err "Syntax error in $f"
done
[[ $fail -eq 0 ]] && echo "JS syntax OK"

exit $fail

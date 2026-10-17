#!/usr/bin/env bash
# Build release zips + release notes into $DIST (default: dist/). Run from the repo root.
#   Usage: build.sh [vX.Y.Z]
# With a tag argument, fails unless it matches both manifest versions.
# Outputs:
#   $DIST/<project>-chrome_vX.Y.Z.zip, $DIST/<project>-firefox_vX.Y.Z.zip   (" Beta" stripped from manifest name)
#   $DIST/release-notes.md   (CHANGELOG entries newer than the last published version)
set -euo pipefail

DIST=${DIST:-dist}
project=${GITHUB_REPOSITORY:-$(basename "$(git rev-parse --show-toplevel)")}
project=${project#*/}

version=$(node -p "require('./chrome/manifest.json').version")
firefox_ver=$(node -p "require('./firefox/manifest.json').version")
if [[ "$version" != "$firefox_ver" ]]; then
  echo "::error::Manifest version mismatch: chrome=$version firefox=$firefox_ver"; exit 1
fi

tag=${1:-}
if [[ -n "$tag" && "$tag" != "v$version" ]]; then
  echo "::error::Tag $tag does not match manifest version v$version"; exit 1
fi

# CHANGELOG must have an entry for this version at the top
top=$(grep -m1 '^## \[' docs/CHANGELOG.md || true)
if [[ "$top" != "## [$version]" ]]; then
  echo "::error::docs/CHANGELOG.md top entry is '$top', expected '## [$version]'"; exit 1
fi

# GitHub runner images aren't guaranteed to ship zip (e.g. the Ubuntu 26 migration)
command -v zip >/dev/null || { sudo apt-get update -qq && sudo apt-get install -y -qq zip; }

rm -rf "$DIST"
mkdir -p "$DIST"

for browser in chrome firefox; do
  staging="$DIST/$browser"
  mkdir -p "$staging"
  # Only tracked files, so stray local files never ship
  git ls-files -z "$browser" | while IFS= read -r -d '' f; do
    mkdir -p "$staging/$(dirname "${f#"$browser"/}")"
    cp "$f" "$staging/${f#"$browser"/}"
  done
  # Released builds never carry the testing-branch " Beta" suffix
  node -e '
    const fs = require("fs"), p = process.argv[1];
    const m = JSON.parse(fs.readFileSync(p, "utf8"));
    m.name = m.name.replace(/ Beta$/, "");
    fs.writeFileSync(p, JSON.stringify(m, null, 2) + "\n");
    console.log(`  ${p}: name="${m.name}" version=${m.version}`);
  ' "$staging/manifest.json"
  (cd "$staging" && zip -q -r -X "../${project}-${browser}_v${version}.zip" .)
  rm -rf "$staging"
done

# Release notes: every entry newer than the last published version. _Published_ sits *below*
# the published version's entries, so cut at the "## [x.y.z]" header just above the marker.
awk '
  NR == 1 && /^# / { next }
  /^_Published_/   { published = 1; exit }
  /^## \[/         { last_header = n + 1 }
                   { lines[++n] = $0 }
  END {
    stop = published ? last_header - 1 : n
    for (i = 1; i <= stop; i++) print lines[i]
  }
' docs/CHANGELOG.md | sed -e '/./,$!d' | sed -e ':a' -e '/^\n*$/{$d;N;ba' -e '}' > "$DIST/release-notes.md"

echo "Built v$version:"
ls -l "$DIST"

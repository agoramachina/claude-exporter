#!/usr/bin/env bash
# Upload a zip to the Chrome Web Store (API v2) and submit it for review/publishing.
#   Usage: chrome-publish.sh path/to/extension.zip
# Env: TOKEN (OAuth access token, chromewebstore scope), PUBLISHER (publisher ID), ITEM (extension ID)
set -euo pipefail

zip=${1:?usage: chrome-publish.sh <zip>}
: "${TOKEN:?}" "${PUBLISHER:?}" "${ITEM:?}"
base=https://chromewebstore.googleapis.com
item="publishers/$PUBLISHER/items/$ITEM"

api() { curl -sS --fail-with-body -H "Authorization: Bearer $TOKEN" "$@"; }

echo "Uploading $zip"
resp=$(api -X POST -T "$zip" "$base/upload/v2/$item:upload")
echo "$resp"
state=$(jq -r '.uploadState // empty' <<<"$resp")

# Uploads can finish asynchronously; poll fetchStatus for up to ~5 minutes
for _ in $(seq 1 30); do
  [[ "$state" == "IN_PROGRESS" || "$state" == "UPLOAD_IN_PROGRESS" ]] || break
  sleep 10
  resp=$(api "$base/v2/$item:fetchStatus")
  state=$(jq -r '.lastAsyncUploadState // empty' <<<"$resp")
  echo "Upload state: $state"
done

if [[ "$state" != "SUCCEEDED" ]]; then
  echo "::error::Chrome Web Store upload did not succeed (state: ${state:-unknown})"
  echo "$resp"
  exit 1
fi

echo "Submitting for review and publishing"
api -X POST "$base/v2/$item:publish"
echo

# Claude Exporter - Development Guide

## Communication Style

- Narrate what you're doing at each step — brief status updates help the user follow along and make the chat searchable
- Be patient with tangents and context-switching (ADHD-friendly pacing)
- Keep explanations concise but don't skip them
- **Scope guard:** Gently remind the user when a tangent is pulling away from the current task. User tends to spiral into feature ideas mid-implementation — help stay focused on finishing the current thing before starting the next. A quick "want to add that to TODO and finish X first?" goes a long way.

## Self-Maintenance

This file is the shared project memory. **Update it proactively** when:

- A new critical rule or recurring bug pattern is discovered
- Project structure changes (new files, renamed files, new architecture patterns)
- A decision is made about how something should always work (e.g., "exports > 1 file must ZIP")

Keep it concise. Don't duplicate what's already here — update existing sections instead.

**This file exists in two places:** the workspace root (read by Claude Code) and `src/CLAUDE.md` (tracked in git). When updating, update both copies.

## Project Structure
- Extension source and git repo lives in `src/`
- Parallel Chrome (`src/chrome/`) and Firefox (`src/firefox/`) versions — nearly identical copies
- Chrome uses Manifest V3, Firefox uses Manifest V2
- Releases are built by GitHub Actions (see Release Process); build scripts live in `.github/scripts/`

## Key Files (under `src/chrome/` and `src/firefox/`)
- `content.js` — Content script injected on claude.ai pages (handles API calls, popup export actions)
- `utils.js` — Shared utilities (convertToMarkdown, convertToText, downloadFile, extractArtifactFiles, etc.)
- `browse.js` — Browse page logic (filtering, sorting, has its own export functions, always ZIPs)
- `background.js` — Re-injects content scripts on install/update
- `jszip.min.js` — ZIP library
- `popup.html` / `popup.js` — Extension popup UI and logic
- `browse.html` — Browse/search conversations page

## Git & Commits

**Auto-commit after every completed change.** Don't wait for the user to ask. After finishing a task (bug fix, feature, refactor), commit immediately with a clear message.

- Git repo is in `src/` — always `cd` there for git commands
- Write concise, descriptive commit messages: `Fix bulk export to always ZIP instead of individual downloads`
- Not: `wip`, `fix stuff`, `update`, `final FINAL (1)`
- Group related changes into one commit (e.g., Chrome + Firefox changes for the same fix = one commit)
- Don't push unless asked
- **Branching**: Do all development on `testing` branch. Merge to `main` only when creating a release

## Documentation Upkeep

**After each commit**, update these files:

- **`src/docs/TODO.md`** — Move completed items to the Completed section, update the current version number, clean up any stale entries
- **`src/docs/CHANGELOG.md`** — Append a short entry under the current version. Create the file if it doesn't exist. Format: `## [X.Y.Z]` header, then bullet points describing changes. Keep entries concise — one line per change is fine
- The CHANGELOG doubles as store update notes. All changes between the current version and the last `_Published_` marker are what goes into the store listing update

## Release Process

**Only create releases when explicitly asked.** Never auto-release.

Releases are built by GitHub Actions (`.github/workflows/release.yml`), triggered by pushing a version tag. When the user asks to release version X.Y.Z:

1. **Verify** — both manifests show `X.Y.Z` and `docs/CHANGELOG.md` has `## [X.Y.Z]` as its top entry (the workflow fails otherwise)
2. **Merge** — merge `testing` → `main` (flip manifest names to drop "Beta", see below)
3. **Tag and push** — `git tag vX.Y.Z -m "Release vX.Y.Z" && git push origin main vX.Y.Z`
4. **Workflow does the rest** — runs checks + tests, builds `claude-exporter-chrome_vX.Y.Z.zip` / `claude-exporter-firefox_vX.Y.Z.zip` (" Beta" stripped from the shipped manifests), then **submits to both stores in parallel**: Chrome Web Store via API v2 (`.github/scripts/chrome-publish.sh`, Google access via Workload Identity Federation, no stored key) and Firefox Add-ons via `web-ext sign --channel listed`. Only if both succeed does it create the GitHub release (notes = all CHANGELOG entries newer than the last `_Published_` marker). If one store job fails, fix it and use "Re-run failed jobs"
5. **Store review happens on the stores' schedule** — both submissions go into review; nothing more to upload by hand
6. **Mark as published** — once live in the stores, add a `_Published_` line after the released version's entries in docs/CHANGELOG.md, commit

**Dry run:** Actions tab → Release → "Run workflow" builds the zips and uploads them as a downloadable `release-build` artifact. Store and release jobs only run for tags, so nothing is submitted.

**Store credentials** live in the GitHub environment `stores` (deployment rule: tags `v*` only): secrets `AMO_JWT_ISSUER` / `AMO_JWT_SECRET`, variables `GCP_WIF_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `CWS_PUBLISHER_ID`, `CWS_EXTENSION_ID`. Google side: project `am-exporter-releases`, service account `cws-publisher@…`, workload identity pool `github` / provider `exporters` (condition: owner `agoramachina` + environment `stores`). Locally: `DIST=/tmp/out .github/scripts/build.sh vX.Y.Z`.

**Checks** (`.github/workflows/checks.yml`) run on every push to `testing` and on PRs to `main`: manifest versions match, chrome/firefox parity (via `.github/scripts/check.sh`, files allowed to differ are listed in `ALLOWED_DIFFS`), JS syntax, vitest, `web-ext lint`, and a test release build. If you intentionally make a file differ between browsers, add it to `ALLOWED_DIFFS`.

## Critical Rules

### Always apply changes to BOTH browsers
Every code change to `chrome/` must also be applied to `firefox/`. The files are nearly identical — differences are only in manifest format and API calls (`chrome.scripting.executeScript` vs `chrome.tabs.executeScript`).

### Always bump version on every change
Update `"version"` in BOTH `chrome/manifest.json` AND `firefox/manifest.json`.

### background.js must inject ALL content scripts
When re-injecting into already-open tabs (on install/update), background.js must inject all three files: `jszip.min.js`, `utils.js`, AND `content.js`. Injecting only `content.js` causes "JSZip is not defined" / "downloadFile is not defined" / "extractArtifactFiles is not defined" errors on already-open tabs.

### Multi-file exports must always be ZIPped
Any export producing more than one file should always create a ZIP — never trigger individual browser downloads.

### Manifest name differs by branch

`"name"` in BOTH manifests must be:

- `"Claude Exporter"` on the `main` branch (released version)
- `"Claude Exporter Beta"` on the `testing` branch (so the user can tell at a glance which build is loaded)

The popup header title is populated from `manifest.name` in `popup.js` (`#header-title`), so the popup automatically reads "Claude Exporter Beta" on the testing branch — no separate HTML edit needed.

When merging `testing` → `main` for a release, flip both manifest names to drop "Beta" as part of the merge. (The release build also strips " Beta" from the shipped manifests as a safety net, so a missed flip can't leak into a release.)

## Testing

- **Vitest** test harness (`package.json` + `node_modules/`) lives in `src/tests/`. Run tests with `npm test` (one-shot) or `npm run test:watch` (watch mode) from `src/tests/`.
- Test files live in `src/tests/` and import from `src/chrome/utils.js` (the canonical copy).
- `firefox/utils.js` is a mirror — if it drifts from `chrome/utils.js`, the tests won't catch it. Keep them in sync per the existing rule.
- `utils.js` has a conditional `module.exports` block at the bottom that fires only when `module` is defined (Node/vitest). Browser extensions ignore it because the global is undefined.
- `node_modules/` and `package-lock.json` are gitignored (`package.json` is tracked under `src/tests/`). None are part of the release ZIPs.

## Architecture Notes

### Content Script Injection
- On fresh page loads: manifest `content_scripts` handles injection of all three JS files
- On extension install/update: `background.js` re-injects into already-open claude.ai tabs
- `content.js` has a double-injection guard (`window.claudeExporterContentScriptLoaded`) to prevent duplicate message listeners

### Export Flow
- **Popup "Export Current"** → sends message to content script on the active claude.ai tab
- **Popup "Export All"** → sends message to content script, which fetches all conversations and ZIPs them
- **Browse page** → loads conversation list via content script relay (`sendMessageToClaudeTab`), then exports directly via `fetch()` to claude.ai API

### Chrome vs Firefox API Differences
- Chrome MV3: `chrome.scripting.executeScript({ target, files })` — accepts file array
- Firefox MV2: `chrome.tabs.executeScript(tabId, { file })` — one file at a time, must loop

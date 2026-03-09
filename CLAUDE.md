# Claude Exporter - Development Guide

## Self-Maintenance

This file is the shared project memory. **Update it proactively** when:

- A new critical rule or recurring bug pattern is discovered
- Project structure changes (new files, renamed files, new architecture patterns)
- A decision is made about how something should always work (e.g., "exports > 1 file must ZIP")

Keep it concise. Don't duplicate what's already here — update existing sections instead.

## Project Structure
- Extension source and git repo lives in `src/`
- Parallel Chrome (`src/chrome/`) and Firefox (`src/firefox/`) versions — nearly identical copies
- Chrome uses Manifest V3, Firefox uses Manifest V2
- Releases go in `releases/vX.Y.Z/`

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

## Documentation Upkeep

**After each commit**, update these files:

- **`src/TODO.md`** — Move completed items to the Completed section, update the current version number, clean up any stale entries
- **`src/CHANGELOG.md`** — Append a short entry under the current version. Create the file if it doesn't exist. Format: `## [X.Y.Z]` header, then bullet points describing changes
- Keep both concise — one line per change is fine

## Critical Rules

### Always apply changes to BOTH browsers
Every code change to `chrome/` must also be applied to `firefox/`. The files are nearly identical — differences are only in manifest format and API calls (`chrome.scripting.executeScript` vs `chrome.tabs.executeScript`).

### Always bump version on every change
Update `"version"` in BOTH `chrome/manifest.json` AND `firefox/manifest.json`.

### background.js must inject ALL content scripts
When re-injecting into already-open tabs (on install/update), background.js must inject all three files: `jszip.min.js`, `utils.js`, AND `content.js`. Injecting only `content.js` causes "JSZip is not defined" / "downloadFile is not defined" / "extractArtifactFiles is not defined" errors on already-open tabs.

### Multi-file exports must always be ZIPped
Any export producing more than one file should always create a ZIP — never trigger individual browser downloads.

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

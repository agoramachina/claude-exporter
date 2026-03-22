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
- **Branching**: Do all development on `testing` branch. Merge to `main` only when creating a release

## Documentation Upkeep

**After each commit**, update these files:

- **`src/TODO.md`** — Move completed items to the Completed section, update the current version number, clean up any stale entries
- **`src/CHANGELOG.md`** — Append a short entry under the current version. Create the file if it doesn't exist. Format: `## [X.Y.Z]` header, then bullet points describing changes. Keep entries concise — one line per change is fine
- The CHANGELOG doubles as store update notes. All changes between the current version and the last `_Published_` marker are what goes into the store listing update

## Release Process

**Only create releases when explicitly asked.** Never auto-release.

When the user asks to create a release for version X.Y.Z:

1. **Verify version** — Confirm both `chrome/manifest.json` and `firefox/manifest.json` show the correct version
2. **Create release directory** — `mkdir -p releases/vX.Y.Z`
3. **ZIP Chrome extension** — `cd src/chrome && zip -r ../../releases/vX.Y.Z/claude-exporter-chrome.zip ./*`
4. **ZIP Firefox extension** — `cd src/firefox && zip -r ../../releases/vX.Y.Z/claude-exporter-firefox.zip ./*` (unsigned; user handles .xpi signing via AMO)
5. **Git tag** — `cd src && git tag vX.Y.Z -m "Release vX.Y.Z"`
6. **Push tag** — `git push origin vX.Y.Z`
7. **Create GitHub release** — `gh release create vX.Y.Z ../releases/vX.Y.Z/* --title "vX.Y.Z" --notes "$(changelog excerpt from CHANGELOG.md)"` — use all changes since last `_Published_` marker as the notes
8. **Mark as published** — Add `_Published_` line after the released version's entries in CHANGELOG.md, commit

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

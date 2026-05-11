# Changelog

## [1.10.0]

- **Artifact extraction now recognizes the `create_file` tool** (Analysis Tool / Computer Use file output)
  - Previously only the legacy `artifacts` tool was extracted; chats that produced files via `create_file` lost their artifacts on export
  - Affects popup export, browse export, and the new project export
- **Export Project** — new button on the browse page bundles a Claude.ai project as a Claude Code-ready workspace
  - Layout: `{ProjectName}/CLAUDE.md` + `context/{chats,artifacts,knowledge}/`
  - `CLAUDE.md` includes the project's custom instructions inline, plus `@`-references to every knowledge file and artifact, and a folder ref to chats
  - Knowledge docs from the project (parsed text) saved under `context/knowledge/`
  - Binary file uploads listed in `_files_manifest.md` (content not exposed by Claude API)
  - All conversations in the project exported as individual `.md` files
  - Artifacts extracted to `context/artifacts/`, prefixed with conversation name to avoid collisions
  - Reuses the existing progress modal with cancel support

## [1.9.1]

- Fixed Model column header alignment with badge text on browse page
- Single-conversation "Export All" no longer wraps the file in a ZIP
- Progress modal now resets bar/stats/text on each open instead of carrying over from the previous run
- Progress modal closes immediately on Cancel instead of waiting for the in-flight batch
- Artifact extraction now filters by `tool_use.name === 'artifacts'` so bash/web_search/repl tool calls can't slip through as fake artifacts
- Fixed model name display when version has no minor (e.g. `claude-opus-4-20250514` now renders as "Claude Opus 4" instead of "Claude Opus 4.20250514")
- Light mode contrast pass: deeper model badge colors, View button border, refined palette aligned with popup
- Click the org ID row in the browse settings dropdown to copy it to the clipboard

_Published_

## [1.9.0]

- Settings dropdown menu on browse page (replaces theme toggle button)
  - Theme toggle (light/dark)
  - Org ID display with link to edit
  - Mark all as exported / Mark all as new
  - Test connection
- Settings gear icon in popup header (opens options page)

_Published_

## [1.8.13]

- Track export timestamps per conversation in chrome.storage.local
- Green dot indicator on browse page for new/updated conversations
- Status filter dropdown (All / New+Updated / Previously exported)
- Auto-select new/updated conversations on browse page load
- Stats bar shows new/updated count
- Timestamps recorded across all export flows (popup, browse, bulk)

## [1.8.12]

- Auto-detect organization ID from Claude.ai API on every export action
- No more stale org ID issues when users switch organizations
- Correctly selects the chat org (not API org) when multiple orgs exist
- Falls back to manually configured org ID if auto-detect fails
- Export buttons no longer disabled on popup load

## [1.8.11]

- 403/404 errors now show a helpful message with a link to org ID settings

## [1.8.10]

- Replaced PNG popup header with CSS gradient header
- Removed popup-header.png dependency
- Integrated version display into gradient header

## [1.8.9]

- Added version number display centered below popup header

_Published_

## [1.8.8]

- Export All from popup now always creates a ZIP for all formats (JSON, markdown, text)
- JSON Export All now fetches full conversation data (was only exporting summary list)
- background.js now re-injects all content scripts (jszip, utils, content) on install/update
- Removed stale export_summary.json toast reference

## [1.8.7]

- Added Claude Sonnet 4.6 model to default timeline
- Replaced hardcoded MODEL_DISPLAY_NAMES with smart model name parsing
- Fixed model name regex to handle dateless model strings (e.g., `claude-sonnet-4-6`)
- Removed `plaintext` language tag from thinking/pasted quadruple-backtick blocks
- Added Chrome Web Store and Firefox Add-ons links to README

## [1.8.6]

- Published to Chrome Web Store and Firefox Add-ons
- Bumped version for store submission

## [1.8.5]

- Switched to `### Thinking` / `### Pasted` headers with quadruple-backtick code blocks
- Fixed pasted text attachments missing from markdown export
- Removed redundant bug tracking from TODO

## [1.8.2]

- Multi-level sorting with shift+click
- Skip ZIP for single-file exports
- Shortened "Last Updated" table header to "Updated"

## [1.8.0 - 1.8.1]

- Full Firefox support with Manifest V2
- Mozilla-signed .xpi for permanent installation
- Theme syncing between popup and browse window
- Local timezone support in export filenames
- Cleaner filename format (YYYYMMDD-HHMMSS)

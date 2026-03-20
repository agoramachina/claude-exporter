# Changelog

## [1.8.12]

- Auto-detect organization ID from Claude.ai API on every export action
- No more stale org ID issues when users switch organizations
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

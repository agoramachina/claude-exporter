# Changelog

## [1.10.19]

- Browse settings dropdown: org ID display now reads `[Auto]` when no manual org ID is stored (was the misleading `"Not set"`, which suggested action was required). Tooltip on hover explains: "No manual org ID set; auto-detection runs on each export." HTML default updated to match.

## [1.10.18]

- Browse table: bumped `body { min-width }` from 1140px to 1200px and added matching `min-width: 1200px` to `.container`. Without the container min-width, its `20px` horizontal padding was eating into the body's floor and clipping the table's rightmost columns (Actions + Checkbox) at narrow viewports. With both at 1200px there's 1160px of usable content area inside the container — enough for the full table. The page scrolls horizontally below 1200px; the table never shrinks or clips.

## [1.10.17]

- Import Backup now asks merge-vs-replace **before** opening the file picker (was after). Click Import Backup → modal asks "Merge with current data" or "Replace all current data" + "Choose File…" → file picker opens → import runs with the chosen mode. Lets you back out before navigating filesystem, and removes the awkward two-step confirmation. The modal no longer shows file contents (snapshot/export counts, creation date), since the file isn't selected yet — file validation still happens after selection.
- `importBackup(file, onComplete)` → `importBackup(file, mode, onComplete)`; the modal helper is now `showImportModeModal(onConfirm)` and lives at the caller layer (options.js / browse.js) rather than inside `importBackup`.

_Published_

## [1.10.16]

- "Export Selected" now exports every checked conversation, including ones currently hidden by the funnel filter or search. Before, the export was intersected with `filteredConversations`, silently dropping checked-but-not-visible chats. The header checkbox still operates only on visible rows (unchanged).

## [1.10.15]

- Fixed artifact extraction silently dropping all artifacts in conversations where Anthropic's `enabled_artifacts_attachments` setting is false. In that mode Claude uses the skills-runner `create_file` MCP tool instead of the legacy `artifacts` tool — same `display_content` shape (json_block with language / code / filename), different `tool_use.name`. The v1.9.1 strict allowlist (`name === 'artifacts'`) was rejecting it. Allowlist now accepts `'artifacts'` or `'create_file'`. Added two regression tests covering the create_file pattern and a negative case for non-artifact skills tools (`view`, etc.) that share the same display shape.

_Published_

## [1.10.14]

- Single-conversation export toast now includes the artifact count when applicable: `Exported: X with N artifact(s)` when artifacts were extracted, `Exported: X` otherwise. Tracked via a function-scope `artifactCount` set inside the extraction branch so the unified post-save toast can read it without restoring the old double-toast pattern.

## [1.10.13]

- Fixed duplicate toast on single-conversation export. `exportConversation` was emitting three toasts on a successful export ("Exporting X...", then a branch-specific "Exported: X with N artifact(s)" or "Exported: X (no artifacts found)", then the unified "Exported: X" at the end). Removed the branch-specific toasts in Chrome — the unified post-save toast already covers all branches. Firefox already had this pattern; Chrome had regressed.

## [1.10.12]

- Chrome/Firefox parity sync — multiple files had quietly drifted out of sync over recent edits. Brought Firefox into line with Chrome (the canonical copy per CLAUDE.md):
  - `popup.html`: removed Chrome typo `dd` after `--error-text: #ff9999;`; synced Firefox `label { margin: 6px 0 }` → `6px`
  - `browse.html`: synced Firefox `td { padding: 15px }` → `15px 20px`; removed stale `.btn-view` CSS from Firefox (cleanup missed in v1.10.9); bumped Firefox body `min-width` 1140 → 1200 and added `min-width: 1200px` to `.container` to match Chrome's recent layout tweak
  - `browse.js`: synced Firefox tooltip label `"Now using"` → `"Currently"`
  - `options.html`: synced Firefox `width: 800px` → `810px`
  - `content.js`: removed Firefox-only `[Claude Exporter]` debug `console.log` statements from the top of the file
- Two functional differences left untouched pending direction: `browse.js` toast handling in `exportConversation` differs (Chrome emits inline `showToast` calls per branch; Firefox has them removed with a `// Toast handled below after timestamp save` comment).

## [1.10.11]

- Browse table: checkbox column now `text-align: right` so the checkbox stays anchored to the right edge with consistent padding when the table grows on wider viewports (was `text-align: center`, which drifted the checkbox toward the middle of an expanding cell).
- Browse table: column headers get `white-space: nowrap` and slightly more `padding-right` (25px) so the header text always stays on one line and never collides with the sort-direction arrow.

## [1.10.10]

- Browse page `body { min-width: 1140px }` so the page itself never shrinks below the table's natural width. When the viewport is narrower, the page (not the table) scrolls horizontally — the table always displays all columns at full width, no clipping, no shrinking.

## [1.10.9]

- Removed the redundant "View" button from the browse table — the chat name in the Name column already links to the conversation. Dropped the button, its click handler, and the `.btn-view` CSS.
- Browse table no longer scrolls horizontally on its own. `.conversations-table` is back to `overflow: hidden`, so when the viewport is narrower than the table's `min-width` (now 1100px, was 1200px), the **page** scrolls horizontally instead of the table container. Cleaner — single scrollbar.

## [1.10.8]

- Narrow-viewport fix follow-up: `flex-wrap: wrap` cascaded down into `.export-controls-wrapper`, `.export-settings`, `.export-row`, and `.export-section` so the individual export-options checkboxes and dropdowns can wrap to multiple lines instead of forcing the body wider than the viewport. With the page no longer overflowing, the table's own `overflow-x: auto` scrollbar now actually does the work for the table.

## [1.10.7]

- Better narrow-viewport behavior on the browse page:
  - Header `.controls` now wrap (`flex-wrap: wrap`) so search/filter/export controls flow to multiple rows on narrow windows instead of forcing the whole page wider than the viewport
  - Table given `min-width: 1200px` so the v1.10.6 `overflow-x: auto` on `.conversations-table` actually triggers — table scrolls horizontally within its container instead of getting cramped or clipped

## [1.10.6]

- Fixed browse table being cut off on the right when the browser window is narrower than the table — `.conversations-table` was `overflow: hidden`, which clipped and suppressed any scrollbar. Now `overflow-x: auto`, so the table scrolls horizontally when needed while keeping rounded corners.

## [1.10.5]

- Slimmed the Contact & Diagnostics section: replaced the three buttons (Email developer / Generate diagnostics / Clear log) with two inline links in a single sentence. "Clear log" removed entirely — and `clearDiagnosticsLog` dropped from `utils.js` since nothing calls it.
- Added a `.section a` link style so anchors inside option sections pick up the page's `--link-color` and `--primary-hover` instead of falling back to browser defaults

## [1.10.4]

- Browse page settings dropdown (and other UI controls) are now interactive immediately on page load — `setupEventListeners()` runs right after `initTheme()` instead of waiting for `loadConversations()` to finish. The settings gear, filter funnel, search bar, and sort headers all work while conversations are still loading.

## [1.10.3]

- New Options section: **Contact & Diagnostics**
  - **Email developer** — opens a mailto with a pre-filled subject including the version and a short body template
  - **Generate diagnostics** — downloads `claude-exporter-diagnostics-YYYYMMDD-HHMMSS.json` (extension/browser version, counts of stored records, current preferences, `orgIdConfigured` boolean, and the last 50 captured errors)
  - **Clear log** — wipes the captured error ring buffer
- Each context (popup / browse / content script / options) now registers `error` and `unhandledrejection` listeners that push sanitized entries to a 50-entry ring buffer in `chrome.storage.local` (`errorLog` key, FIFO). All UUIDs are replaced with `<id>` at capture time so identifiers are never persisted.
- Privacy stance: nothing is transmitted automatically. The diagnostics file stays local until the user chooses to attach it. Org ID itself is never included (only a boolean indicating whether one is configured). No conversation content is captured.

## [1.10.2]

- Removed "Test connection" from the browse settings dropdown — it's already available in Advanced Options (next to Save Settings)
- Model column "*" bounce marker now matches the badge color per family (Sonnet/Opus/Haiku/default), full opacity
- Tooltip on bounced model cells now fires when hovering the badge or the asterisk (wrapped in a `.model-cell` with the `title` attribute)
- Popup header title is now read from `manifest.name`, so the testing branch's "Claude Exporter Beta" appears in the popup automatically. CLAUDE.md updated.

## [1.10.1]

- Browse page funnel menu: new "Search projects" option (below the existing status filters, separated by a divider). When selected, the search bar matches against project names (placeholder updates to "Search projects by name...") and the table shows conversations whose project name matches. Status filters do not apply in this mode.

## [1.9.17]

- Reverted v1.9.16's two-column Model Display layout — the original stacked layout reads cleaner, especially with the longer descriptions

## [1.9.16]

- Browse dropdown's "Edit Org ID" and "Advanced Options" now open the options page in the **same tab** instead of a new one — the browser back button returns to the browse view
- Browse page reloads itself on bfcache-restored pageshow, so preference changes (model display, date/time format) take effect after hitting Back without needing a manual refresh
- Options page: Model Display radios laid out in a two-column grid

## [1.9.15]

- Backup filename revised to `claude-exporter-backup-YYYYMMDD-HHMMSS.json` (was `claude-database-YYYY-MM-DDTHH-MM-SS.json` in v1.9.14). Matches the YYYYMMDD-HHMMSS timestamp format used by conversation/artifact exports

## [1.9.14]

- Backup filename changed from `claude-exporter-backup-(timestamp).json` to `claude-database-(timestamp).json`
- Browse table Model column display is now configurable. Defaults to **Original** (first-seen model, the v1.9.4 behavior); a new "Model Display" section in Options lets you switch to **Current** (v1.9.12 behavior)
- Bounced chats keep the `*` marker in either mode; the tooltip now shows "Originally X" when displaying current, and "Now using X" when displaying original

## [1.9.13]

- Backup/Restore renamed throughout to **Export Backup** / **Import Backup** (options page buttons + browse dropdown items)
- Import now opens a custom modal showing backup contents (counts + creation date) with two modes:
  - **Merge** (default) — adds entries not present locally; keeps your current values when they overlap (per-sub-key for UUID-keyed records like exportTimestamps / modelSnapshots)
  - **Replace all** — overwrites everything with the backup's contents (the prior behavior)
- Modal supports keyboard (Esc to cancel, Enter to import) and closes when clicking outside

## [1.9.12]

- Browse table Model column now shows the chat's **current** model (was: original/first-seen, since v1.9.4). Bounced chats — where the current model differs from the first-seen one — get a `*` asterisk marker with a "Originally X" tooltip
- Rationale: the cell now reflects what model the chat will actually use if you reopen it; the original is still discoverable via the asterisk tooltip
- Sort by Model column follows the new (current) display name

## [1.9.11]

- Options page: merged "Test Connection" into the Organization ID section (next to Save Settings) and dropped the standalone "Test Your Settings" section
- Options page: button text now vertically centered (inline-flex + line-height reset; was inheriting body's 1.6 line-height)
- Options page: Date format and Time format now sit side-by-side in a two-column grid instead of stacked
- Mirrored prior `chrome/options.html` CSS tweaks (page width 800px, button padding, `.section h3` margins) into `firefox/options.html` — Firefox copy had fallen behind

## [1.9.10]

- Popup org-ID error now reads "Failed to obtain organization ID: Please set this value in Options." with "Options" as a clickable link that opens the options page
- Lowercased "Claude.ai" → "claude.ai" in all user-facing strings (popup, browse, options) to match the actual domain

## [1.9.9]

- Removed the "Organization ID not configured" setup banner from the popup — org ID is auto-detected from claude.ai on every export action, so the banner was redundant
- Updated the fallback error message when org ID detection fails: now suggests opening the popup from a claude.ai tab instead of pointing at the removed setup link

## [1.9.8]

- Markdown export now includes the `truncated` flag in the metadata block (when present in the conversation data)
- Markdown export now shows file attachment metadata per message (`file_name`, `file_size`, `file_type`) — not just `extracted_content`. File attachments render as `### Attachment: <name> _(size, type)_`; pasted content keeps the legacy `### Pasted` label.

## [1.9.7]

- Reorganized the browse settings dropdown: Date and Time format toggles moved to the options page; their slot now holds a "Backup/Restore Database" item with a hover submenu (Backup / Restore)
- Backup & Restore logic moved into shared `utils.js` so the options page and browse dropdown use one implementation
- Options page gains a "Date & Time Format" section

## [1.9.6]

- Added an "Advanced Options" link to the browse page settings dropdown (between Time and Test connection) — opens the options page, making Backup & Restore reachable directly from the browse view

## [1.9.5]

- Added Backup & Restore to the options page — download all extension data (model snapshots, export history, preferences) to a JSON file and restore it later
- Survives uninstall/reinstall, and lets you move data between browsers, devices, or extension builds (e.g. store version ↔ GitHub build)

## [1.9.4]

- Browse table's Model column now shows each chat's original (first-seen) model from the snapshot data, falling back to the current/inferred model when no snapshot exists
- Bounced chats (original model differs from current) get a `→` marker with a tooltip showing "Originally X, now Y"
- Model column sorting follows the displayed (original) model

_Published_

## [1.9.3]

- Snapshot each conversation's current model to `chrome.storage.local` whenever the conversation list is fetched (browse page load or popup "Export All") — preserves the model before a chat gets bounced to a new one on model retirement
- Records first-seen model, current model, and a change history per conversation; only the raw API model is stored, never an inferred guess

## [1.9.2]

- Added Vitest test harness for `utils.js` (52 tests covering export logic, model name parsing, artifact extraction)
- Extracted model utilities (`formatModelName`, `getModelBadgeClass`, `DEFAULT_MODEL_TIMELINE`) out of `content.js`/`browse.js` into shared `utils.js`
- Doc-linked the Anthropic model-ID schema in code comments

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

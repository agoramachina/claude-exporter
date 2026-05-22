# Claude Exporter - TODO List

## Pending 🔄

### Critical Priority 🔴

### High Priority 🟠

- **Prepare for new model families (e.g. Mythos)**
  - Source of truth: [Anthropic model IDs and versions docs](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
  - Current `formatModelName` regex in [chrome/utils.js](../chrome/utils.js) hardcodes family ∈ `{sonnet, opus, haiku}` — anything else (e.g. expected `claude-mythos-preview`) falls through to raw-ID display and gets no badge color
  - Test coverage now pins this behavior — [tests/utils.test.js](../tests/utils.test.js) "unknown family fallthrough" suite will fail loudly the day Anthropic ships a new family, prompting a regex bump + new badge CSS class
  - When a new family lands, the change is small:
    1. Add family to the `(sonnet|opus|haiku)` regex group in `formatModelName`
    2. Add an `if (model.includes('mythos'))` branch in `getModelBadgeClass`
    3. Add `.mythos` CSS class with brand color in popup.html, browse.html, content.css
    4. Add timeline entry to `DEFAULT_MODEL_TIMELINE` once it becomes the default on claude.ai
  - Note: `-preview` suffix breaks the version-segment regex (expects `\d{1,2}`); needs special-casing or a broader regex if Anthropic stabilizes that naming
  - Bedrock/Vertex prefixes intentionally out of scope — claude.ai never serves those

- **`DEFAULT_MODEL_TIMELINE` maintenance**
  - Every time claude.ai bumps its default model, add an entry; otherwise old null-model conversations get inferred to a now-stale model
  - Sanity check in [tests/utils.test.js](../tests/utils.test.js) confirms every entry parses cleanly through `formatModelName` (catches typos)
  - Future: consider sourcing from a JSON config file or remote endpoint instead of hardcoded array

- **Track model changes per conversation**
  - **Phase 1 capture SHIPPED (v1.9.3)** — `recordModelSnapshots()` in `content.js` writes `modelSnapshots` to `chrome.storage.local` every time the conversation list is fetched (browse page load or popup "Export All"), not just on export. Stores `{firstSeen, firstSeenAt, current, currentAt, history[]}` per conversation UUID; raw API model only, never an inferred guess.
  - **Browse-table display SHIPPED (v1.9.4, revised v1.9.12, configurable v1.9.14)** — Model column shows either the original (first-seen) or current model via `getDisplayModel()`, controlled by the `modelDisplay` preference (default 'original'). Bounced chats get a `*` marker with a tooltip showing the "other" model ("Originally X" when displaying current, "Now using X" when displaying original). Options page "Model Display" section lets users switch.
  - Still pending: surface the snapshot in JSON exports (sidecar or inline field); optionally a dedicated "current model" column or filter for bounced chats
  - `conversation.model` from the API is the *current* model only — when chats get bounced (deprecation, guardrails kicking to Sonnet 4, etc.) the original model is lost
  - Symptom: chats created before Sonnet 4.5 existed now show "Sonnet 4.5" because that's their current default
  - 
  - **API does NOT preserve per-message model data** — confirmed by inspecting an exported JSON; messages have no `model` field. Anthropic doesn't track this server-side (in this endpoint at least).
  - Approach: snapshot tracking on our side
    - On every export, record `{conversationId, model, timestamp}` to `chrome.storage.local`
    - First export of a chat = first known model (call it "first-seen" not "created with" — we can't know the real original for chats that pre-date this feature)
    - On subsequent exports, if `model` changed since last entry, append a new history entry
    - Include this history array in JSON exports (sidecar or inline field)
  - Limitations
    - For chats that existed before tracking starts, original model is unknowable — fall back to date-inference via `DEFAULT_MODEL_TIMELINE` and label it "inferred"
    - Misses bounces that happen between two exports of the same chat
  - UI plan
    - Phase 1: just record the data + show "first-seen" and "current" models in JSON export
    - Phase 2 (later): two sortable columns in browse table; for now sort by current model only
  - Note: `DEFAULT_MODEL_TIMELINE` is duplicated in [browse.js](../chrome/browse.js) and [content.js](../chrome/content.js) — keep in sync

- **Light theme overhaul**
  - Whole light theme needs work — readability, contrast, color choices across the board
  - Subsumes the existing "model badge color contrast" issue (Sonnet/Opus/Haiku badges hard to read in light mode)
  - Audit every component (popup, browse, options, settings dropdown, modals, toasts) against the dark theme as the reference
  - Consider whether to design light from scratch rather than tweak — current colors feel like dark-mode values dropped onto a light background

### Medium Priority 🟡

- **Artifact indicators in browse table**
  - Show icon next to conversation name if it contains artifacts
  - Add filter options in funnel dropdown: with artifacts / without artifacts
  
- **Artifact search/filter in browse view**
  - Add ability to search or filter conversations by artifact content
  - Filter by artifact filename, type, or whether artifacts exist
  - Helps find specific artifacts across all conversations

- **PDF export for artifacts**
  - Generate PDF versions of artifacts
  - Useful for documentation and sharing

- **Memory export (global and project-specific)**
  - Export custom instructions and memory from Claude.ai
  - Support both global/account-level memory and project-specific memory
  - Allow backup and archival of configured AI behavior and context

- **Claude Code export**
  - Support exporting Claude Code conversations
  - Handle code-specific content and artifacts

- **Local sync / export folder mode**
  - User defines a local export directory
  - Extension compares current Claude data against exported files to detect changes
  - Git-like approach: diff actual content, not just timestamps
  - More accurate than timestamp-based new/updated detection
  - Timestamp-based tracking (green dots) remains as the default for users who don't configure a folder
  - Would need File System Access API or similar for folder read/write
  - Consider: incremental sync (only export changed conversations) vs full re-export

- **Google Drive integration**
  - Link/sync exports to Google Drive

- **Remove claude.ai tab dependency**
  - Use `chrome.cookies` API to read claude.ai session cookies directly
  - Make API calls from background worker / browse page without needing a relay tab
  - Would allow browse page and auto-detection to work without an open claude.ai tab
  - Requires adding `cookies` permission to manifest

- **Robust filter**
  - Filter by project, model, artifact
  - Project search SHIPPED (v1.10.1) — "Search projects" option in the funnel dropdown scopes the search bar to project names. Model + artifact filtering still pending.

- **Advanced settings menu**
  - Verbosity toggle & Debug log
  - Language settings
  - Custom CSS
  - Regex mode
  - Custom date/time format
    - Custom format string (e.g. `%d/%m/%Y %H:%M`)
    - Toggle time display on/off

### Low Priority 🟢

- **True cancellation of in-flight bulk export fetches**
  - Cancel button currently hides the modal immediately, but in-flight batch fetches still run in the background until they finish
  - Wire up an `AbortController` so the actual `fetch()` calls and ZIP work get aborted on cancel
  - Mostly cosmetic — saves a few seconds of wasted bandwidth + CPU per cancel

- **In-popup changelog / "What's new"**
  - Link to summary of changes on version bump
  - Surfaces UI updates so changes aren't jarring
  
- **Branch export options**
  - Add option to export all branches vs. only current branch
  - Currently markdown/text only export current branch, JSON exports all
  - Let users choose their preference for all formats
  - Useful for preserving alternate conversation paths

- **Model name/ID toggle in table**
  - Click on model name to toggle between display name and model ID

- **Regex search**
  - Option to use regex patterns in the search bar
  - Toggle between plain text and regex mode

- **Help / tutorial in settings menu**
  - Add a help/getting started option to the settings dropdown
  - Quick overview of features, export options, keyboard shortcuts

- **Minor UI improvements**
  - Export progress spinner
  - Test connection spinner

- **Mark all as..."
  - Condense "Mark all as exported" and "Mark all as new" to a "Mark all as..." submenu with "New" and "Exported" options

- **Update screenshots**
  - Include browse page and popup
  - Include dark and light mode
  - 1280x800 or 640x400 jpeg or 24-bit png (no alpha)

## Bugs 🐛

(none currently open)

## Completed ✅

- **Org ID display shows `[Auto]` when not manually set** (v1.10.19)
  - Browse settings dropdown's org ID field used to show `"Not set"` when no manual org ID was stored, which falsely suggested the user needed to set one. Now reads `[Auto]` and a tooltip clarifies that auto-detection runs on each export. HTML default also updated.

- **Contact & Diagnostics section in Options** (v1.10.3, slimmed v1.10.5)
  - "Email developer" — mailto with pre-filled subject (`Claude Exporter Bug Report — vX.Y.Z`) and a short body template
  - "Generate diagnostics" — downloads a sanitized JSON bundle (extension/browser version, counts of stored records, current preferences, `orgIdConfigured` boolean, last 50 captured errors). All UUIDs redacted at capture time. No conversation content.
  - Each context (popup / browse / content / options) registers `error` + `unhandledrejection` listeners that push to a 50-entry FIFO ring buffer in `chrome.storage.local`
  - v1.10.5 collapsed the original three buttons into two inline links inside a single sentence (less cluttered, same behavior)

- **Removed redundant "View" button from browse table** (v1.10.9)
  - Chat name in the Name column is already a clickable link to the conversation; the "View" button duplicated that. Removed the button, handler, and `.btn-view` CSS. Narrower Actions column lets table `min-width` drop from 1200px to 1100px.

- **Removed redundant "Organization ID not set up" popup banner** (v1.9.9)
  - Org ID auto-detected on every export action (v1.8.12) made the upfront banner redundant
  - Dropped the `#setupNotice` div, the load-time auto-detect-or-warn check, and the options-page link handler
  - Manual override on the options page is preserved as the fallback per the original TODO guidance
  - Export-button error message now reads "Could not detect Organization ID. Make sure you are on a claude.ai tab." instead of pointing at the removed link

- **Artifact format conversion** (v1.3.0)
  - Support for Original/Markdown/Text/JSON formats
  - Code files always kept in original format
  - Non-code markdown documents convert to selected format

- **Flat artifacts export** (v1.4.0)
  - Independent from nested artifacts option
  - Both can be enabled simultaneously for dual export
  - Flat: exports with `ConversationName_filename` prefix

- **UI reorganization** (v1.5.0-1.5.1)
  - Header 1: Title (left), Stats (right)
  - Header 2: Projects dropdown (left), Search (center), Export controls (right)
  - Removed Model filter dropdown (use column sorting instead)
  - Wider search bar (400px → 500px)
  - Wider table container (1400px → 1600px)

- **Artifact extraction fixes** (v1.5.2)
  - Added support for `code_block` display format (newer artifacts)
  - Maintained support for `json_block` format (older artifacts)
  - Fixed missing artifacts in newer conversations

- **Nested/Flat independence** (v1.5.3)
  - Made nested and flat artifact exports independent options
  - Can export in one or both formats simultaneously

- **Export filename improvements** (v1.5.4)
  - Changed from date to datetime format
  - Format: `claude-exports-2025-10-31_14-30-45.zip`
  - Prevents file collisions on same-day exports

- **Progress bar accuracy** (v1.5.4)
  - Fixed to count all scanned conversations
  - Includes skipped conversations (no artifacts when chats disabled)

- **Projects API support** (v1.6.0)
  - Fetch projects from `/api/organizations/{orgId}/projects`
  - Populate Projects dropdown with user's projects
  - Filter conversations by selected project
  - Renamed export files from 'claude-conversations-*' to 'claude-exports-*'

- **Flat artifacts bug fix** (v1.6.1)
  - Fixed: artifacts only extracted if 'Artifacts nested' was checked
  - Now extracts artifacts if EITHER nested OR flat is checked

- **Projects column** (v1.6.2)
  - Added 'Project' column after 'Name' column
  - Display project name or '-' if no project assigned
  - Full sorting capability for Project column
  - Multi-level sorting with shift+click

- **Flat-only artifacts export** (v1.7.0)
  - When ONLY 'Artifacts flat' is checked (no chats, no nested):
    - Export all artifacts from all conversations into single root folder
    - No conversation subfolders - everything in one big folder
    - Each artifact prefixed with conversation name
    - Filename: `claude-artifacts-{timestamp}.zip` (distinguishes from other exports)

- **Firefox support** (v1.8.0-1.8.1)
  - Complete Firefox-compatible version with Manifest V2
  - Separate chrome/ and firefox/ folders with standalone extensions
  - Mozilla-signed .xpi for permanent installation (v1.8.1)
  - Consolidated installation documentation in INSTALL.md
  - Theme syncing between popup and browse window
  - Local timezone support in export filenames
  - Cleaner filename format (YYYYMMDD-HHMMSS)

- **Markdown export formatting** (v1.8.5)
  - `### Thinking` and `### Pasted` headers with quadruple-backtick code blocks
  - Clear visual hierarchy (## Speaker → ### Content type)

- **Pasted text attachment export** (v1.8.5)
  - Exports pasted content with `### Pasted` header and quadruple-backtick code block

- **Store publishing & README update** (v1.8.6-1.8.7)
  - Published to Chrome Web Store and Firefox Add-ons
  - Added store links to README, renamed to "Manual Installation" section
  - Claude Sonnet 4.6 model support
  - Smart model name parsing (no more hardcoded lookup table)
  - Removed `plaintext` language tag from thinking/pasted code blocks

- **Bulk export & script injection fixes** (v1.8.8)
  - Export All from popup now always creates a ZIP (was downloading individual files for markdown/text)
  - JSON Export All now fetches full conversation data per chat (was only exporting summary list)
  - background.js re-injects all three content scripts on reload (fixes "not defined" errors)
  - Removed stale export_summary.json toast reference

- **Automatic organization ID detection** (v1.8.12)
  - Auto-detects org ID from Claude.ai API on every export action (always fresh)
  - Eliminates manual configuration step for most users
  - Falls back to stored org ID if auto-detect fails
  - Fixes issue where manually-set org ID becomes stale

- **New/updated conversation tracking** (v1.8.13)
  - Green dot indicator for conversations not yet exported or updated since last export
  - Status filter dropdown (All / New+Updated / Previously exported)
  - Auto-selects new/updated conversations on browse page load
  - Export timestamps tracked across all export flows

- **Settings dropdown menu** (v1.9.0)
  - Gear icon replaces theme toggle on browse page, opens dropdown
  - Theme toggle, org ID display, mark all exported/new, test connection
  - Gear icon in popup header opens options page

- **Export progress indicator on browse page** (v1.9.1)
  - Show progress bar when exporting from browse view
  - Display current conversation being processed
  - Provide visual feedback during large exports

- **Elaborate README acknowledgments** (v1.9.1)
  - Expand "Written in collaboration with Claude Code" with more detail

- **Click org ID to copy to clipboard** (v1.9.1)
  - Click the org ID row in the browse settings dropdown to copy it
  - Toast confirms "Org ID copied to clipboard"

- **Vitest unit tests for `utils.js`** (v1.9.2)
  - 52 tests covering core export logic, model name parsing, and the recently-fixed bugs
  - Regression coverage for `tool_use.name === 'artifacts'` filter, branch traversal, file extension mapping
  - `npm test` from `src/`; tests live in `src/tests/`
  - Canonical source is `chrome/utils.js`; `firefox/utils.js` mirror must stay in sync

- **Extract model utilities to `utils.js`** (v1.9.2)
  - Moved `formatModelName`, `getModelBadgeClass`, `DEFAULT_MODEL_TIMELINE` out of `content.js`/`browse.js` into shared `utils.js`
  - Doc-linked the Anthropic model-ID schema in code comments

- **Backup & Restore for extension data** (v1.9.5)
  - Options page can download all `chrome.storage.local` + `chrome.storage.sync` data to a JSON file and restore it
  - Solves uninstall/reinstall data loss, and migration between separate extension builds (store vs. GitHub) which have separate storage
  - Backup file is structured `{ _meta, local, sync }`; restore validates `_meta.app` and confirms before overwriting
  - v1.9.6: "Advanced Options" link added to the browse settings dropdown (between Time and Test connection) so the options page is reachable from the browse view
  - v1.9.7: backup/restore logic moved to shared `utils.js`; reachable from the browse dropdown via a "Backup/Restore Database" hover submenu. Date/Time format toggles moved out of the dropdown into the options page.
  - Future enhancement: smart per-key merge on restore (e.g. union `modelSnapshots`, keep earliest `firstSeen`) instead of overwrite

- **Markdown export: truncated flag + attachment metadata** (v1.9.8)
  - Markdown export now includes the `truncated` flag and per-message attachment info (`file_name`, `file_size`, `file_type`) — parity with what JSON export already provided
  - File attachments render as `### Attachment: name _(size, type)_`; pasted content (no `file_name`) keeps the legacy `### Pasted` label
  - Adopted from upstream commit `318d4a7`; skipped the extension-rename-to-"Local" half (we use the "Beta" suffix convention for testing builds)

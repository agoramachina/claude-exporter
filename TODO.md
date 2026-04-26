# Claude Exporter - TODO List

## Completed ✅

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

## Pending 🔄

### Critical Priority 🔴

### High Priority 🟠

- **Track model changes per conversation**
  - `conversation.model` from the API is the *current* model only — when chats get bounced (deprecation, guardrails kicking to Sonnet 4, etc.) the original model is lost
  - Symptom: chats created before Sonnet 4.5 existed now show "Sonnet 4.5" because that's their current default
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
  - Note: `DEFAULT_MODEL_TIMELINE` is duplicated in [browse.js](chrome/browse.js) and [content.js](chrome/content.js) — keep in sync

- **Light theme overhaul**
  - Whole light theme needs work — readability, contrast, color choices across the board
  - Subsumes the existing "model badge color contrast" issue (Sonnet/Opus/Haiku badges hard to read in light mode)
  - Audit every component (popup, browse, options, settings dropdown, modals, toasts) against the dark theme as the reference
  - Consider whether to design light from scratch rather than tweak — current colors feel like dark-mode values dropped onto a light background

### Medium Priority 🟡

- **UI cleanup: Remove redundant "View" button**
  - Chat name already links to conversation, "View" button may be unnecessary
  - Frees up that table cell for future artifact-indicator badges

- **Artifact indicators in browse table**
  - Show icon next to conversation name if it contains artifacts
  - Add filter options in funnel dropdown: with artifacts / without artifacts
  
- **Artifact search/filter in browse view**
  - Add ability to search or filter conversations by artifact content
  - Filter by artifact filename, type, or whether artifacts exist
  - Helps find specific artifacts across all conversations

- **Contact dev / feedback link**
  - Add to settings dropdown on browse page
  - Way for users to reach out (feedback, bug reports)
  
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

- **Advanced settings menu**
  - *Custom date/time format*
    - Custom format string (e.g. `%d/%m/%Y %H:%M`)
    - Toggle time display on/off

### Low Priority 🟢

- **True cancellation of in-flight bulk export fetches**
  - Cancel button currently hides the modal immediately, but in-flight batch fetches still run in the background until they finish
  - Wire up an `AbortController` so the actual `fetch()` calls and ZIP work get aborted on cancel
  - Mostly cosmetic — saves a few seconds of wasted bandwidth + CPU per cancel

- **Click org ID to copy to clipboard**
  - In settings dropdown, clicking org ID copies it with visual feedback (tooltip/toast)

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

- **Help / tutorial in settings menu** (low priority)
  - Add a help/getting started option to the settings dropdown
  - Quick overview of features, export options, keyboard shortcuts


## Bugs 🐛

(none currently open)

## Current Version: 1.9.1

## Notes

- Version bumping helps track changes and catch branch mix-ups
- Projects fully implemented and functional
- All artifact export features are functional and tested
- Flat-only mode makes it easy to get all artifacts in one searchable folder

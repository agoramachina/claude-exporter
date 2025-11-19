# Claude Exporter

A browser extension for Chrome and Firefox that allows you to export your Claude.ai conversations and artifacts in various formats with support for bulk exports, artifact extraction, and conversation browsing.

## Features

- 📥 **Export Individual Conversations** - Export any conversation directly from Claude.ai
- 📚 **Bulk Export** - Export all or filtered conversations as a ZIP file
- 🔍 **Browse & Search** - View all your conversations in a searchable table
- 🌳 **Branch-Aware Export** - Correctly handles conversation branches (exports only the current branch)
- 📝 **Multiple Formats** - JSON (full data), Markdown, or Plain Text
- 📦 **Artifact Export** - Extract artifacts (code, documents, etc.) as separate files
- 🎯 **Flexible Export Options** - Choose to include conversations, artifacts inline, or artifacts as separate files
- 🗂️ **ZIP Archives** - Bulk exports create organized ZIP files with conversations and artifacts
- 🏷️ **Metadata Options** - Include or exclude timestamps, models, and other metadata
- 🤖 **Complete Model Information** - Preserves and displays model information for all conversations (unlike official Claude.ai exports)
- 🔮 **Smart Model Inference** - Automatically infers the correct model for conversations that used the default model at the time

## Installation from Source

### Prerequisites
- **Chrome**: Google Chrome browser (or Chromium-based browser like Edge, Brave, etc.)
- **Firefox**: Mozilla Firefox (version 57 or later)
- A Claude.ai account

### Chrome Installation

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/agoramachina/claude-exporter.git
   # Or download and extract the ZIP file
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `claude-exporter` folder
   - The extension icon should appear in your toolbar

5. **Configure Your Organization ID**
   - Click the extension icon
   - You'll see a notice about configuring your Organization ID
   - Click "Click here to set it up" or right-click the extension icon → Options
   - Go to `https://claude.ai/settings/account`
   - Copy your Organization ID
   - Paste it in the extension options and click Save
   - Click "Test Connection" to verify it works

### Firefox Installation

**🦊 Firefox users**: Please see the [Firefox Installation Guide](FIREFOX_INSTALL.md) for detailed Firefox-specific installation instructions.

**Quick Firefox Setup:**

1. **Download or Clone the Repository** (same as Chrome)
   ```bash
   git clone https://github.com/agoramachina/claude-exporter.git
   ```

2. **Switch to Firefox-Specific Files**

   **Option A: Using the helper script (Linux/Mac)**
   ```bash
   cd claude-exporter
   ./switch-to-firefox.sh
   ```

   **Option B: Manual copy**
   ```bash
   cd claude-exporter
   cp manifest_firefox.json manifest.json
   cp background_firefox.js background.js
   ```

3. **Load in Firefox**
   - Navigate to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on..."
   - Select the `manifest.json` file from the claude-exporter folder

4. **Configure Your Organization ID** (same as Chrome)
   - Follow step 5 from the Chrome installation above

For permanent installation and Firefox-specific troubleshooting, see [FIREFOX_INSTALL.md](FIREFOX_INSTALL.md).

## Usage

### Export Current Conversation
1. Navigate to any conversation on Claude.ai
2. Click the extension icon
3. Choose your export format and metadata preferences
4. Click "Export Current Conversation"

### Browse All Conversations
1. Click the extension icon
2. Click "Browse All Conversations" (green button)
3. In the browse page, you can:
   - Search conversations by name
   - Filter by model
   - Sort by date or name
   - Export individual conversations
   - Export all filtered conversations as ZIP

### Bulk Export
1. In the browse page, select your format and filters
2. Click "Export All"
3. A progress dialog will show the export status
4. Once complete, a ZIP file will download containing all conversations

## Export Formats

### JSON
- Complete data including all branches and metadata
- Best for data preservation and programmatic use
- Includes all message versions and conversation branches

### Markdown
- Human-readable format with formatting
- Shows only the current conversation branch
- Includes optional metadata (timestamps, model info)
- Great for documentation or sharing

### Plain Text
- Simple format following Claude's prompt style
- Uses "Human:" and "Assistant:" prefixes (abbreviated to H:/A: after first occurrence)
- Shows only the current conversation branch
- Ideal for copying into other LLMs or text editors

## File Structure

```
claude-exporter/
├── manifest.json          # Extension configuration (Chrome by default)
├── manifest_firefox.json  # Firefox-specific manifest
├── background.js          # Background service worker (Chrome)
├── background_firefox.js  # Firefox-compatible background script
├── content.js            # Content script for Claude.ai pages
├── content.css           # Styles for content script
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── options.html          # Options page for configuration
├── options.js            # Options page logic
├── browse.html           # Conversation browser interface
├── browse.js             # Browser page functionality
├── utils.js              # Shared utility functions
├── jszip.min.js          # Library for creating ZIP files
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
├── switch-to-firefox.sh  # Helper script to switch to Firefox version
├── switch-to-chrome.sh   # Helper script to switch to Chrome version
├── README.md             # This file
└── FIREFOX_INSTALL.md    # Firefox installation guide
```

## Troubleshooting

### "Organization ID not configured"
- Follow the setup steps in the Configuration section
- Make sure you're copying the complete UUID from the URL

### "Not authenticated" error
- Make sure you're logged into Claude.ai
- Try refreshing the Claude.ai page

### Export fails for some conversations
- Some very old conversations might have different data structures
- Check the browser console for specific error messages
- The ZIP export includes a summary file listing any failed exports

### Content Security Policy errors
- Make sure you're using the latest version of the extension
- Try reloading the extension from chrome://extensions/

## Privacy & Security

- **Local Processing**: All data processing happens in your browser
- **No External Servers**: The extension doesn't send data anywhere
- **Your Authentication**: Uses your existing Claude.ai session
- **Open Source**: You can review all code before installation

## Known Limitations

- Plaintext and markdown formats only export the currently selected branch in conversations with multiple branches
- Large bulk exports may take several minutes
- Some special content types (like artifacts) may not export perfectly
- Rate limiting: The extension processes conversations in small batches to avoid overwhelming the API

## TODO

- Memory export
- Claude Code export
- PDF export for artifacts

## Contributing

Feel free to submit issues or pull requests if you find bugs or have suggestions for improvements!

## License

MIT License - See [LICENSE.md](LICENSE.md) for details.

## Acknowledgments

- **Original Project**: Forked from [socketteer/Claude-Conversation-Exporter](https://github.com/socketteer/Claude-Conversation-Exporter)
- **Code Development**: Enhanced by Claude Sonnet 4.5 in collaboration with a human developer
- **ZIP Library**: Uses [JSZip](https://stuk.github.io/jszip/) for creating ZIP archives

---

**Note**: This extension is not officially affiliated with Anthropic or Claude.ai. It's a community tool that uses the web interface's API endpoints.

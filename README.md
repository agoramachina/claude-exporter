# Claude Exporter

A browser extension for Chrome and Firefox that allows you to export your Claude.ai conversations and artifacts in various formats with support for bulk exports, artifact extraction, and conversation browsing.

## Features

- 📥 **Export Individual Conversations** - Export any conversation directly from Claude.ai
- 📚 **Bulk Export** - Export all or filtered conversations as a ZIP file
- 🔍 **Browse & Search** - View all your conversations in a searchable table
- 🔀 Sort Conversations - Sort by name, date, project, model, and more
- 🌳 **Branch-Aware Export** - Correctly handles conversation branches
- 📝 **Multiple Formats** - JSON (full data), Markdown, or Plain Text
- 📦 **Artifact Export** - Extract artifacts (code, documents, etc.) as separate files
- 🎯 **Flexible Export Options** - Choose to include conversations, artifacts inline, or artifacts as separate files
- 🗂️ **ZIP Archives** - Bulk exports create organized ZIP files with conversations and artifacts
- 🏷️ **Metadata Options** - Include or exclude timestamps, models, and other metadata
- 🤖 **Complete Model Information** - Preserves and displays model information for all conversations
- 🔮 **Smart Model Inference** - Automatically infers the correct model for conversations that used the default model at the time
- 🌙 Light/Dark Mode - Toggle between color schemes

---
### Installation

#### Chrome (and Chromium-based browsers)
1. Download the `claude-exporter-chrome-vX.X.X.zip` from the [Releases page](https://github.com/agoramachina/claude-exporter/releases)
2. Extract the zip into a safe folder (this will be the permanent location - don't move or delete it)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked** and select the extracted `claude-exporter-chrome` folder
6. Done! Proceed to [Configuration](#Configuration)

#### Firefox
1. Download the latest `.xpi` file from the [Releases page](https://github.com/agoramachina/claude-exporter/releases)
2. Drag and drop the `.xpi` file into Firefox
3. Click **Add** when Firefox asks for permission
4. Done! Proceed to [Configuration](#Configuration)

**For detailed installation instructions, troubleshooting, and installing from source**, see [INSTALL.md](INSTALL.md).

---
### Configuration

After installing the extension in either browser:
1. Click the extension icon in your browser toolbar
2. You'll see a notice about configuring your Organization ID
3. Click "Click here to set it up" (or right-click the extension icon → Options)
4. In a new tab, go to `https://claude.ai/settings/account`
5. Copy your Organization ID from the URL
   - It should be in this format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
6. Return to the extension options and paste the Organization ID
7. Click **Save**
8. Click **Test Connection** to verify it works
9. You should see a success message if everything is configured correctly!

---
### Usage

#### Export Current Conversation
1. Navigate to any conversation on claude.ai
2. Click the extension icon
3. Choose your export format and metadata preferences
4. Click "Export Current Conversation"

#### Browse All Conversations
1. Click the extension icon
2. Click "Browse All Conversations" (green button)
3. In the browse page, you can:
   - Search conversations by name
   - Filter by model
   - Sort by date or name
   - Export individual conversations
   - Export all filtered conversations as ZIP
   
#### Bulk Export
1. In the browse page, select your format and filters
2. Click "Export All"
3. A progress dialog will show the export status
4. Once complete, a ZIP file will download containing all conversations

---
### Export Formats

#### JSON
- Complete data including all branches and metadata
- Best for data preservation and programmatic use
- Includes all message versions and conversation branches

#### Markdown
- Human-readable format with formatting
- Shows only the current conversation branch
- Includes optional metadata (timestamps, model info)
- Great for documentation or sharing

#### Plain Text
- Simple format following Claude's prompt style
- Uses "User:" and "Claude:" prefixes
- Shows only the current conversation branch
- Ideal for copying into other LLMs or text editors

---
### Troubleshooting

#### "Organization ID not configured"
- Follow the setup steps in the Configuration section
- Make sure you're copying the complete UUID from the URL

#### "Not authenticated" error
- Make sure you're logged into Claude.ai
- Try refreshing the Claude.ai page

#### Export fails for some conversations
- Some very old conversations might have different data structures
- Check the browser console for specific error messages
- The ZIP export includes a summary file listing any failed exports

#### Content Security Policy errors
- Make sure you're using the latest version of the extension
- Try reloading the extension from chrome://extensions/

**For browser-specific troubleshooting issues**, see [INSTALL.md](./INSTALL.md#Troubleshooting)

---
### Known Limitations

- Plaintext and markdown formats only export the currently selected branch in conversations with multiple branches
- Large bulk exports may take several minutes
- Some special content types (like artifacts) may not export perfectly
- Rate limiting: The extension processes conversations in small batches to avoid overwhelming the API

---
### Privacy & Security

- **Local Processing**: All data processing happens in your browser
- **No External Servers**: The extension doesn't send data anywhere
- **Your Authentication**: Uses your existing Claude.ai session
- **Open Source**: You can review all code before installation

---
### Contributing

Feel free to submit issues or pull requests if you find bugs or have suggestions for improvements!

---
### Acknowledgments

- **Original Project**: Forked from [socketteer/Claude-Conversation-Exporter](https://github.com/socketteer/Claude-Conversation-Exporter)
- **Code Development**: Written in collaboration with Claude Sonnet 4.5
- **ZIP Library**: Uses [JSZip](https://stuk.github.io/jszip/) for creating ZIP archives

---

**Note**: This extension is not officially affiliated with Anthropic or Claude.ai. It's a community tool that uses the web interface's API endpoints.

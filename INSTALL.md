# Installation Guide

Complete installation instructions for Claude Exporter on Chrome and Firefox.

## Quick Install (Recommended)

### Chrome (and Chromium-based browsers)

1. Download the `claude-exporter-chrome-vX.X.X.zip` from the [Releases page](https://github.com/agoramachina/claude-exporter/releases)
2. Extract the zip into a safe folder (this will be the permanent location - don't move or delete it!)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked** and select the extracted `claude-exporter-chrome` folder
6. Done! Proceed to [Configuration](#configuration)

### Firefox

1. Download the latest `.xpi` file from the [Releases page](https://github.com/agoramachina/claude-exporter/releases)
2. Drag and drop the `.xpi` file into Firefox
3. Click **Add** when Firefox asks for permission
4. Done! Proceed to [Configuration](#configuration)

---

## Install from Source

For developers or those who want to build from source:

### Prerequisites
- **Chrome**: Google Chrome browser (or Chromium-based browser like Edge, Brave, etc.)
- **Firefox**: Mozilla Firefox (version 58 or later)
- Git (optional, for cloning)
- A Claude.ai account

### Chrome Installation from Source

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/agoramachina/claude-exporter.git
   cd claude-exporter
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome` folder (inside the repository)
   - The extension icon should appear in your toolbar

5. **Proceed to [Configuration](#configuration)**

### Firefox Installation from Source

#### Option 1: Temporary Installation (For Development)

1. **Clone or Download the Repository** (if not already done)
   ```bash
   git clone https://github.com/agoramachina/claude-exporter.git
   cd claude-exporter
   ```

2. **Load in Firefox**
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on..."
   - Navigate to the `firefox` folder (inside the repository)
   - Select the `manifest.json` file
   - Extension loads until you restart Firefox

3. **Proceed to [Configuration](#configuration)**

#### Option 2: Developer Installation (Unsigned, Permanent)

**Not recommended** - only for advanced development:

1. Clone the repository (see Option 1)
2. Open Firefox and navigate to `about:config`
3. Search for `xpinstall.signatures.required`
4. Set it to `false` (this allows unsigned extensions)
5. Package the extension:
   ```bash
   cd firefox
   zip -r ../claude-exporter-firefox.zip *
   ```
6. Go to `about:addons`
7. Click the gear icon → "Install Add-on From File..."
8. Select the `claude-exporter-firefox.zip` file

**Warning**: Setting `xpinstall.signatures.required` to `false` disables important security protections. Only use for development.

---

## Configuration

After installing the extension in either browser:

1. Click the extension icon in your browser toolbar
2. You'll see a notice about configuring your Organization ID
3. Click "Click here to set it up" (or right-click the extension icon → Options)
4. In a new tab, go to `https://claude.ai/settings/account`
5. Copy your Organization ID from the URL
   - It looks like: `organization_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Copy only the UUID part (the `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
6. Return to the extension options and paste the Organization ID
7. Click **Save**
8. Click **Test Connection** to verify it works
9. You should see a success message if everything is configured correctly!

---

## Troubleshooting

### Common Issues (Both Browsers)

#### "Organization ID not configured"
- Follow the [Configuration](#configuration) steps above
- Make sure you're copying the complete UUID from the URL
- The format should be: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### "Not authenticated" error
- Make sure you're logged into Claude.ai
- Try refreshing the Claude.ai page
- Check that cookies are enabled for claude.ai

#### "downloadFile is not defined" error
If you see this error when trying to export the current conversation:
1. **Refresh the Claude.ai page** (F5 or Ctrl+R)
2. Try the export again
3. This happens when the content script hasn't fully loaded yet

#### Export fails for some conversations
- Some very old conversations might have different data structures
- Check the browser console for specific error messages
- The ZIP export includes a summary file listing any failed exports

### Chrome-Specific Issues

#### Extension doesn't appear after loading
- Make sure you selected the `chrome` folder, not a subfolder
- Check that Developer mode is enabled
- Look in the Extensions page for any error messages

#### Content Security Policy errors
- Make sure you're using the latest version of the extension
- Try removing and re-adding the extension from `chrome://extensions/`

### Firefox-Specific Issues

#### Extension doesn't appear after loading
- Make sure you selected the `manifest.json` file, not the folder
- Check the Browser Console (Ctrl+Shift+J) for errors

#### "Could not establish connection" errors
- Refresh the Claude.ai page after loading the extension
- Check that you're on `https://claude.ai/*`
- Try unloading and reloading the extension from `about:debugging`

#### Content script not injecting
- Firefox may require you to refresh Claude.ai tabs after installing the extension
- Check the extension's permissions in `about:addons`

#### Storage/Options not saving
- Make sure cookies are enabled for `about:addons`
- Try restarting Firefox

#### Extension showing old UI or features after update
Firefox aggressively caches extension files. To force a reload:
1. Go to `about:debugging#/runtime/this-firefox`
2. Find "Claude Exporter" and click **Remove**
3. Close ALL Firefox windows completely
4. Restart Firefox and reload the extension
5. Alternatively, hard-refresh (Ctrl+Shift+R) on Claude.ai after reloading

If you still see old cached content:
- Clear Firefox cache: `Ctrl+Shift+Delete` → Check "Cache" → Clear Now
- Reload the extension from `about:debugging`
- Refresh Claude.ai page

#### "can't access property Symbol.iterator" error (Firefox)
If you see this error when exporting from a conversation page:
1. Make sure you're on the actual conversation page (not the home page)
2. Refresh the page and try again
3. If the problem persists, use "Browse All Conversations" to export instead

#### "This add-on could not be installed because it has not been verified"
- Use the signed `.xpi` from the Releases page, not a self-built zip
- Or use temporary installation via `about:debugging` for development

---

## Browser Differences

### Technical Differences

The Firefox and Chrome versions are functionally identical but use different APIs:

**Firefox version:**
- Manifest V2 (more stable in Firefox)
- `browser_action` instead of `action`
- `tabs.executeScript()` instead of `scripting.executeScript()`
- `options_ui` for better Firefox integration

**Chrome version:**
- Manifest V3 (required for Chrome)
- `action` API
- `scripting.executeScript()` API
- `options_page`

All core functionality remains the same across both browsers!

### Installation Methods Comparison

#### Firefox Installation Methods

| Feature | Signed .xpi (Recommended) | Temporary | Unsigned (Dev Mode) |
|---------|---------------------------|-----------|---------------------|
| Persists after restart | ✅ | ❌ | ✅ |
| Requires dev mode | ❌ | ❌ | ✅ |
| Easy to install | ✅ | ✅ | ⚠️ |
| Mozilla-signed | ✅ | N/A | ❌ |
| Recommended for | General use | Development/testing | Advanced development |

#### Chrome Installation Methods

| Feature | From Releases | From Source |
|---------|---------------|-------------|
| Persists after restart | ✅ | ✅ |
| Requires dev mode | ✅ | ✅ |
| Easy to install | ✅ | ✅ |
| Recommended for | General use | Development |

---

## Using Both Browsers

The repository includes separate folders for Chrome and Firefox, so you can easily use both:
- Use the `chrome/` folder for Chrome installation
- Use the `firefox/` folder for Firefox installation

Both folders are complete, standalone extensions with no need to switch files!

---

## Additional Resources

### Chrome
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)

### Firefox
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API Reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Temporary Installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

---

## Getting Help

If you encounter issues:

1. Check the browser console for errors:
   - **Chrome**: Right-click on page → Inspect → Console tab
   - **Firefox**: Ctrl+Shift+J (Cmd+Option+J on Mac)
2. Verify you're using the correct folder (`chrome/` or `firefox/`)
3. Make sure your browser version is up to date
4. Check the [Troubleshooting](#troubleshooting) section above
5. Open an issue on GitHub with:
   - Browser name and version
   - Error messages from console
   - Steps to reproduce the problem

---

**Note**: This extension is not officially affiliated with Anthropic or Claude.ai. It's a community tool that uses the web interface's API endpoints.

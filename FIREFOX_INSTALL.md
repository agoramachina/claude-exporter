# Firefox Installation Guide

This guide explains how to install Claude Exporter in Mozilla Firefox.

## Prerequisites
- Mozilla Firefox (version 57 or later)
- A Claude.ai account

## Installation Steps

### 1. Download or Clone the Repository

```bash
git clone [repository-url]
# Or download and extract the ZIP file
```

### 2. Prepare Firefox-Specific Files

The extension includes Firefox-specific versions of some files. You need to swap these in:

```bash
cd claude-exporter

# Backup the Chrome manifest (optional)
cp manifest.json manifest_chrome.json

# Use the Firefox manifest
cp manifest_firefox.json manifest.json

# Use the Firefox background script
cp background_firefox.js background.js
```

Alternatively, you can manually:
- Rename `manifest.json` to `manifest_chrome.json`
- Rename `manifest_firefox.json` to `manifest.json`
- Rename `background.js` to `background_chrome.js`
- Rename `background_firefox.js` to `background.js`

### 3. Load the Extension in Firefox

#### Option A: Temporary Installation (For Testing)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the `claude-exporter` folder
5. Select the `manifest.json` file
6. The extension will be loaded temporarily (until you restart Firefox)

#### Option B: Permanent Installation (Developer Mode)

For development and testing, you can:

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (this allows unsigned extensions)
4. Package the extension:
   ```bash
   cd claude-exporter
   zip -r ../claude-exporter-firefox.zip *
   ```
5. Go to `about:addons`
6. Click the gear icon → "Install Add-on From File..."
7. Select the `claude-exporter-firefox.zip` file

**Note**: Setting `xpinstall.signatures.required` to `false` is only recommended for development. For regular use, temporary installation is safer.

### 4. Configure Your Organization ID

1. Click the extension icon in the Firefox toolbar
2. You'll see a notice about configuring your Organization ID
3. Click "Click here to set it up"
4. Go to `https://claude.ai/settings/account`
5. Copy your Organization ID from the URL (it looks like `organization_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
6. Paste it in the extension options and click Save
7. Click "Test Connection" to verify it works

## Differences from Chrome Version

The Firefox version uses:
- **Manifest V2** instead of Manifest V3 (more stable in Firefox)
- **`browser_action`** instead of `action`
- **`tabs.executeScript()`** instead of `scripting.executeScript()`
- **`options_ui`** instead of `options_page` for better Firefox integration

All core functionality remains the same!

## Troubleshooting Firefox-Specific Issues

### Extension doesn't appear after loading
- Make sure you selected the `manifest.json` file, not the folder
- Check the Browser Console (Ctrl+Shift+J) for errors
- Verify that `manifest_firefox.json` was correctly renamed to `manifest.json`

### "Could not establish connection" errors
- Refresh the Claude.ai page after loading the extension
- Check that you're on `https://claude.ai/*`
- Try unloading and reloading the extension

### Content script not injecting
- Firefox may require you to refresh Claude.ai tabs after installing the extension
- Check the extension's permissions in `about:addons`

### Storage/Options not saving
- Firefox's storage API works slightly differently
- Make sure cookies are enabled for `about:addons`
- Try using Firefox's private browsing mode to test

## Publishing to Firefox Add-ons (AMO)

If you want to publish this extension to the Firefox Add-ons marketplace:

### 1. Create a Developer Account
- Go to https://addons.mozilla.org/developers/
- Create an account if you don't have one

### 2. Update the Extension ID
In `manifest_firefox.json`, update the extension ID:
```json
"browser_specific_settings": {
  "gecko": {
    "id": "your-unique-id@yourdomain.com",
    "strict_min_version": "57.0"
  }
}
```

### 3. Package the Extension
```bash
cd claude-exporter
zip -r claude-exporter-firefox.zip * \
  -x "*.git/*" \
  -x "*.DS_Store" \
  -x "manifest_chrome.json" \
  -x "background_chrome.js" \
  -x "*.md"
```

### 4. Submit for Review
1. Go to https://addons.mozilla.org/developers/addon/submit/
2. Upload your ZIP file
3. Fill in the required information
4. Submit for review

Mozilla's review process typically takes a few days to a few weeks.

## Differences Between Temporary and Permanent Installation

| Feature | Temporary | Permanent (Unsigned) | AMO Published |
|---------|-----------|---------------------|---------------|
| Persists after restart | ❌ | ✅ | ✅ |
| Auto-updates | ❌ | ❌ | ✅ |
| Requires dev mode | ❌ | ✅ | ❌ |
| Easy to install | ✅ | ⚠️ | ✅ |
| Recommended for | Testing | Development | Production |

## Switching Back to Chrome

To use the Chrome version again:

```bash
# Restore the Chrome manifest
cp manifest_chrome.json manifest.json

# Restore the Chrome background script (if you backed it up)
# The original background.js works with Chrome
```

Or just clone a fresh copy of the repository.

## Additional Resources

- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API Reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Temporary Installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

## Support

If you encounter issues specific to Firefox, please:
1. Check the Browser Console (Ctrl+Shift+J) for errors
2. Verify you're using the Firefox-specific files (`manifest_firefox.json` → `manifest.json`)
3. Make sure your Firefox version is 57 or later
4. Open an issue on the repository with "Firefox:" in the title

---

**Note**: Firefox supports most Chrome extension APIs through compatibility layers, so the core extension code works in both browsers with minimal changes!

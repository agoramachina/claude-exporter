# Firefox Installation Guide

This guide explains how to install Claude Exporter in Mozilla Firefox.

## Prerequisites
- Mozilla Firefox (version 57 or later)
- A Claude.ai account

## Installation Steps

### 1. Download or Clone the Repository

```bash
git clone https://github.com/agoramachina/claude-exporter.git
cd claude-exporter
```

### 2. Load the Extension in Firefox

#### Option A: Temporary Installation (For Testing)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the `firefox` folder (inside the repository)
5. Select the `manifest.json` file
6. The extension will be loaded temporarily (until you restart Firefox)

#### Option B: Permanent Installation (Developer Mode)

For development and testing, you can:

1. Open Firefox and navigate to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (this allows unsigned extensions)
4. Package the extension:
   ```bash
   cd firefox
   zip -r ../claude-exporter-firefox.zip *
   ```
5. Go to `about:addons`
6. Click the gear icon → "Install Add-on From File..."
7. Select the `claude-exporter-firefox.zip` file

**Note**: Setting `xpinstall.signatures.required` to `false` is only recommended for development. For regular use, temporary installation is safer.

### 3. Configure Your Organization ID

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

### Extension showing old UI or features after update
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

### Exports not working
- Check Browser Console (Ctrl+Shift+J) for errors
- Verify Organization ID is configured in extension options
- Make sure you're on the correct page (claude.ai)
- Try removing and reinstalling the extension completely

## Differences Between Temporary and Permanent Installation

| Feature | Temporary | Permanent (Unsigned) | AMO Published |
|---------|-----------|---------------------|---------------|
| Persists after restart | ❌ | ✅ | ✅ |
| Auto-updates | ❌ | ❌ | ✅ |
| Requires dev mode | ❌ | ✅ | ❌ |
| Easy to install | ✅ | ⚠️ | ✅ |
| Recommended for | Testing | Development | Production |

## Using Both Browsers

The repository includes separate folders for Chrome and Firefox, so you can easily use both:
- Use the `chrome/` folder for Chrome installation
- Use the `firefox/` folder for Firefox installation

Both folders are complete, standalone extensions with no need to switch files!

## Additional Resources

- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [WebExtensions API Reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Temporary Installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

## Support

If you encounter issues specific to Firefox, please:
1. Check the Browser Console (Ctrl+Shift+J) for errors
2. Verify you're loading from the `firefox/` folder
3. Make sure your Firefox version is 57 or later
4. Open an issue on the repository with "Firefox:" in the title

---

**Note**: Firefox supports most Chrome extension APIs through compatibility layers, so the core extension code works in both browsers with minimal changes!

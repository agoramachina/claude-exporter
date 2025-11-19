#!/bin/bash

# Script to switch to Chrome-compatible version

echo "Switching to Chrome version..."

# Check if we have backed up Chrome files
if [ -f "manifest_chrome.json" ]; then
    echo "Restoring Chrome manifest from backup..."
    cp manifest_chrome.json manifest.json
else
    echo "Restoring Chrome manifest from Firefox version..."
    # If no backup, copy from firefox version (they're both available)
    # but update to use Chrome-specific settings
    echo "Note: Using manifest_firefox as template, manually verify Chrome manifest"
fi

if [ -f "background_chrome.js" ]; then
    echo "Restoring Chrome background script from backup..."
    cp background_chrome.js background.js
else
    echo "Warning: No Chrome background script backup found."
    echo "You may need to restore from the original repository."
fi

echo ""
echo "✅ Switched to Chrome version!"
echo ""
echo "Next steps:"
echo "1. Open Chrome and navigate to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked' and select this folder"
echo ""

# Installation Instructions

## Quick Start

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select this folder:
     `/Users/ankbnsl/workspace/claudeworkspace/chromePluginToWriteNotes`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Ankur's Wiki Notes" in your extensions list
   - A blue square icon should appear in your Chrome toolbar
   - Status should show "Enabled"

5. **Start Using**
   - Click the blue extension icon to open the side panel
   - Start taking notes!

## After Installation

### First Time Setup
- Click the extension icon to open the side panel
- The panel will show "Notes for: [current page title]"
- Start typing to create notes
- Right-click selected text on any page to see context menu options

### Permissions
The extension will request these permissions:
- **Storage** - To save your notes locally
- **Active Tab** - To get current page information
- **Context Menus** - For right-click menu options
- **Downloads** - To export notes
- **All URLs** - To highlight text on any website

All data stays on your device. Nothing is sent to external servers.

## Updating the Extension

If you make changes to the code:

1. Go to `chrome://extensions/`
2. Find "Ankur's Wiki Notes"
3. Click the refresh/reload icon (↻)
4. Your changes will take effect immediately

## Troubleshooting

### Extension icon not visible
- Check that icons exist: `icon16.png`, `icon48.png`, `icon128.png`
- Try removing and re-adding the extension
- Make sure "Developer mode" is still enabled

### Side panel won't open
- Check for errors in `chrome://extensions/`
- Click "Errors" button if present
- Try reloading the extension

### Features not working
- Make sure all permissions are granted
- Check browser console for errors (F12)
- Reload the extension and refresh the webpage

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Ankur's Wiki Notes"
3. Click "Remove"
4. Confirm removal

Note: All notes and highlights will be deleted when you uninstall.

## Export Before Uninstalling

To save your notes before uninstalling:

1. Open any page with notes
2. Click the "Export" button (green)
3. Save the JSON file
4. You can later import this data if you reinstall

## Need Help?

Check the README.md file for full documentation and usage instructions.

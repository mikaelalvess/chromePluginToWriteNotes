# Troubleshooting Guide for Ankur's Wiki Notes

## Right-Click Context Menu Not Showing

### Solution 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Ankur's Wiki Notes"
3. Click the **refresh/reload button (↻)**
4. **IMPORTANT:** After reloading, you must **refresh or reload any open web pages** for the content scripts to take effect

### Solution 2: Check Extension Permissions
1. Go to `chrome://extensions/`
2. Click "Details" on Ankur's Wiki Notes
3. Scroll down to "Permissions"
4. Make sure it has:
   - Read and change all your data on all websites
   - Manage your downloads
   - Display notifications

### Solution 3: Test on a Simple Page
Some pages (like `chrome://` URLs or extension pages) block content scripts.
1. Open a regular website like `https://www.google.com`
2. Select some text
3. Right-click and look for the context menu items

## Context Menu Items Not Working

### Check the Console for Errors
1. Open the page where you're testing
2. Press `F12` to open DevTools
3. Go to the "Console" tab
4. Select some text and right-click
5. Look for any error messages in red

### Check Background Service Worker
1. Go to `chrome://extensions/`
2. Find "Ankur's Wiki Notes"
3. Click "service worker" link (it will say "Inspect views service worker")
4. This opens the background script console
5. Try using the context menu again
6. Watch for console messages showing:
   - "Context menu clicked: [menu item name]"
   - "Message sent successfully"

### Check Side Panel Console
1. Open the side panel by clicking the extension icon
2. Right-click anywhere in the side panel
3. Select "Inspect"
4. This opens the side panel's DevTools
5. Watch the Console tab for messages like:
   - "Side panel received message"
   - "Adding text to notes"
   - "Text added successfully"

## "Add as Heading/Paragraph" Not Adding Text

### Symptoms
- Context menu items appear
- You click them but nothing happens
- No text appears in the notes

### Solutions

1. **Make sure side panel is open:**
   - The extension now auto-opens the side panel when you use these options
   - Wait 1-2 seconds after clicking for text to appear

2. **Check if you're on the right page:**
   - In "Per-Page Mode", text is only added if you're viewing notes for the current page
   - Try switching to "Global" mode by clicking the purple button

3. **Verify the note editor is ready:**
   - Click in the notes area first
   - Then try the context menu again

## "Highlight Only" Not Working

### Symptoms
- Right-click menu shows "Highlight Only"
- Click it but text doesn't get highlighted in yellow

### Solutions

1. **Reload the web page:**
   - After updating the extension, content scripts only work on pages loaded AFTER the update
   - Press `Ctrl+R` or `Cmd+R` to reload the page
   - Try highlighting again

2. **Check if content script is injected:**
   - Press `F12` to open DevTools
   - Go to Console tab
   - Type: `document.querySelector('.wiki-notes-highlight')`
   - If it returns `null`, content script is loaded
   - Select text, right-click "Highlight Only"
   - Type the same command again - if it returns an element, highlighting worked!

3. **Test with simple text:**
   - Try highlighting a single word first
   - Some complex HTML structures may not highlight properly
   - Avoid selecting across multiple elements

4. **Check console for errors:**
   - Press `F12` → Console
   - Look for messages starting with "Highlighted:" or error messages

## Highlights Not Persisting

### Symptoms
- Highlighting works but disappears when you reload the page

### Solutions

1. **Check storage permissions:**
   - Go to `chrome://extensions/` → Details
   - Make sure storage permission is granted

2. **View stored highlights:**
   - Press `F12` → Console
   - Type: `chrome.storage.local.get(['allHighlights'], console.log)`
   - You should see your saved highlights

## Buttons Not Fitting in Sidebar

### Symptoms
- Buttons are cut off or overlapping
- Can't click all buttons

### Solutions

1. **Widen the sidebar:**
   - Drag the edge of the sidebar to make it wider
   - Buttons will resize automatically

2. **Buttons will wrap on narrow sidebars:**
   - This is normal behavior
   - Buttons stack vertically when sidebar is < 400px wide

## Export Not Working

### Symptoms
- Click Export button but nothing happens
- Or download fails

### Solutions

1. **Check downloads permission:**
   - Go to `chrome://extensions/` → Details
   - Verify downloads permission is granted

2. **Try keyboard shortcut:**
   - Focus the notes editor
   - Press `Ctrl+E` (Windows/Linux) or `Cmd+E` (Mac)

3. **Check browser download settings:**
   - Go to chrome://settings/downloads
   - Make sure "Ask where to save each file" is enabled

## Getting More Help

### Enable Verbose Logging

All right-click functions now log to the console:

1. **Background Worker Console:**
   - `chrome://extensions/` → service worker → Inspect
   - Shows context menu clicks and message sending

2. **Side Panel Console:**
   - Open side panel → Right-click → Inspect
   - Shows messages received and text being added

3. **Page Console:**
   - `F12` → Console
   - Shows highlighting actions and errors

### What to Check

1. Extension is enabled in `chrome://extensions/`
2. Extension has all required permissions
3. Web page is reloaded after extension update
4. Side panel is open when using "Add to Notes" features
5. Content script is injected (check console)

### Still Not Working?

1. Remove and reinstall the extension:
   - Export your notes first!
   - Remove extension from `chrome://extensions/`
   - Restart Chrome
   - Load unpacked again

2. Try in an Incognito window:
   - Enable extension in Incognito
   - Test if it works there
   - If yes, regular Chrome may have conflicting extensions

3. Check Chrome version:
   - Go to `chrome://version/`
   - Requires Chrome 114+ for side panel API
   - Update Chrome if needed

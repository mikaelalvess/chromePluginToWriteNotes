# Ankur's Wiki Notes - Chrome Extension

A powerful, minimalist Chrome extension for taking notes in wiki markup format, highlighting text with 5 colors, and organizing everything with zero configuration. Built with Apple/Google-style simplicity - features that "just work."

## ✨ Features

### 🎨 Minimalist Design Philosophy
- **Zero configuration needed** - Everything works out of the box
- **Auto-detection** - Dark mode, tags, and more
- **One-click actions** - Export, search, navigate
- **Clean emoji UI** - 🔍 📊 ↓ 👁 for instant recognition
- **System integrated** - Respects your OS theme preferences

### 📝 Core Note-Taking
- **Side panel interface** - Click the extension icon to open
- **Wiki markup syntax** support:
  - Bold: `**text**` or `'''text'''`
  - Italic: `//text//` or `''text''`
  - Headings: `== Heading ==`, `=== Subheading ===`
  - Lists: `* bullet` or `# numbered`
  - Links: `[[link]]` or `[[url|label]]`
  - Tasks: `[ ]` unchecked, `[x]` checked
  - And more!
- **Per-page notes** - Automatically separate notes for each webpage
- **Auto-save** - Saves every 300ms after typing stops
- **Live preview** - Split-pane wiki markup rendering

### 🎨 Smart Highlighting (5 Colors)
- 🟨 **Yellow** - Important information
- 🟩 **Green** - Definitions
- 🟦 **Blue** - Questions
- 🟥 **Red** - Critical points
- 🟪 **Purple** - References
- **Persistent** - Highlights survive page reloads
- **One-click remove** - Right-click → "Remove Highlight"

### 🔍 Instant Search
- **No configuration** - Just type and search
- **Cross-page** - Searches all your notes
- **Context preview** - See matching text snippets
- **One-click navigation** - Jump to any note
- **Keyboard shortcut**: `Ctrl+Shift+F`

### 🌙 Auto Dark Mode
- **System preference detection** - No manual toggle needed
- **Live switching** - Changes when your OS theme changes
- **Full theme** - Every UI element adapts
- **Works everywhere** - macOS, Windows, Linux

### #️⃣ Auto-Detect Tags
- **Just type `#tagname`** - No manual tagging UI
- **Auto extraction** - Tags appear in stats automatically
- **Dashboard display** - See all tags per note
- **Zero effort** - Works like Twitter/Instagram

### 📊 Clean Dashboard
- **Essential stats only** - Total notes, highlights
- **All pages listed** - With word count and date
- **Tag display** - Auto-detected tags shown
- **One-click navigation** - Jump to any page's notes
- **Beautiful design** - Gradient stats header

### ↓ Smart Export
- **One-click** - No dialogs or choices
- **Auto-format** - Picks text or markdown based on length
- **Auto-download** - Saves directly to Downloads
- **Smart naming** - Uses page title
- **Keyboard shortcut**: `Ctrl+E`

## How to Use

### Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the folder containing this extension
5. The blue extension icon will appear in your toolbar

### Taking Notes
1. **Open the side panel**: Click the extension icon in your Chrome toolbar
2. **Start writing**: Use wiki markup syntax in the editor
3. **Auto-save**: Your notes are automatically saved
4. **Preview**: Click "Toggle Preview" to see rendered output

### Highlighting Text (5 Colors)
1. **Select text** on any webpage
2. **Right-click** and choose **"Highlight as..."**
3. **Pick a color**:
   - 🟨 Yellow (Important)
   - 🟩 Green (Definition)
   - 🟦 Blue (Question)
   - 🟥 Red (Critical)
   - 🟪 Purple (Reference)
4. **Text is highlighted** and persists across page reloads
5. **Quick highlight**: `Ctrl+Shift+H` for yellow
6. **Remove**: Right-click highlighted text → "Remove Highlight"

### Adding Selected Text to Notes
1. **Select text** on any webpage
2. **Right-click** and choose:
   - **"Add as Heading"** - Adds as `== Text ==`
   - **"Add as Paragraph"** - Adds as regular text
3. **Side panel opens** automatically
4. **Text appears** at cursor position in your notes

### Using Search
1. **Click** 🔍 button or press `Ctrl+Shift+F`
2. **Type** your search query
3. **See results** with context preview
4. **Click any result** to jump to that page's notes
5. **Press Escape** to exit search

### Viewing Dashboard
1. **Click** 📊 button in header
2. **See stats**: Total notes, highlights
3. **Browse all pages** with word counts and dates
4. **See auto-detected tags** for each page
5. **Click any page** to load its notes

### Using Tags
1. **Just type** `#tagname` anywhere in your notes
2. **Tags auto-appear** in the stats bar
3. **Tags show** in dashboard for each note
4. **No manual tagging** needed - it just works!

### Task Lists
1. **Type** `[ ]` for an unchecked task
2. **Type** `[x]` for a completed task
3. **Toggle preview** (👁) to see rendered checkboxes
4. **Simple and clean** - no complex task manager

### Exporting Notes
1. **Click** ↓ button or press `Ctrl+E`
2. **Auto-downloads** - no dialog needed
3. **Smart format**:
   - Short notes → `.txt`
   - Long notes → `.md` (markdown)
4. **Filename** based on page title
5. **Toast notification** confirms export

## ⌨️ Keyboard Shortcuts

**Side Panel & Notes:**
- `Ctrl+Shift+N` - Open side panel
- `Ctrl+Shift+Q` - Quick note (open panel and focus editor)
- `Ctrl+S` - Manual save (shows toast confirmation)
- `Ctrl+P` - Toggle preview mode
- `Tab` - Insert 2 spaces for indentation

**Highlighting:**
- `Ctrl+Shift+H` - Quick highlight (yellow) for selected text

**Search & Navigation:**
- `Ctrl+Shift+F` - Open search
- `Escape` - Exit search

**Export:**
- `Ctrl+E` - Smart export (auto-downloads)

## Wiki Markup Syntax Guide

### Text Formatting
- `**bold**` or `'''bold'''` - **Bold text**
- `//italic//` or `''italic''` - *Italic text*
- `__underline__` - Underlined text
- `~~strikethrough~~` - Strikethrough text
- `` `code` `` - Inline code

### Headings
- `== Heading ==` - Level 2 heading
- `=== Heading ===` - Level 3 heading
- `==== Heading ====` - Level 4 heading

### Lists
```
* Bullet item 1
* Bullet item 2

# Numbered item 1
# Numbered item 2
```

### Links
- `[[link text]]` - Internal link
- `[[https://example.com|Example]]` - External link with label

### Other
- `----` - Horizontal line

## File Structure

- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - Service worker handling context menus and side panel
- `content.js` - Content script for text highlighting
- `highlight.css` - Styles for highlighted text on web pages
- `sidepanel.html` - Side panel interface
- `sidepanel.js` - Main functionality, storage, and export
- `wiki-parser.js` - Wiki markup parser
- `styles.css` - Side panel styling
- `icon.svg`, `icon*.png` - Extension icons

## Storage

Notes and highlights are stored using Chrome's `storage.local` API:
- **Per-page notes**: Stored with URL-based keys
- **Global notes**: Stored under `wikiNotes_global`
- **Highlights**: Stored per URL in `allHighlights`
- **Page index**: Maintained in `notesIndex` for quick access

## Compatibility

- **Chrome 114+** required (for Side Panel API)
- Works on all websites (requires `<all_urls>` permission)
- Highlights persist across browser sessions
- Notes sync if Chrome Sync is enabled

## Privacy

- All data is stored locally on your device
- No data is sent to external servers
- Highlights are only visible to you
- Export files are saved to your local downloads folder

## Troubleshooting

### Icon not visible
- Make sure you've reloaded the extension after installation
- Check that icon files (icon16.png, icon48.png, icon128.png) exist
- Try removing and re-adding the extension

### Highlights not persisting
- Check that the website allows content scripts
- Some sites (chrome://, file://) block extensions
- Clear browser cache and reload the page

### Export not working
- Ensure downloads permission is granted
- Check your browser's download settings
- Try using Ctrl+E keyboard shortcut

## Development

To modify the extension:

1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Ankur's Wiki Notes extension
4. Test your changes

## License

Free to use and modify.

## 📜 Version History

### v2.0.0 - The Minimalist Update 🎨
**Major redesign with Apple/Google-style simplicity**

**New Features:**
- ✅ 5-color highlighting system (Yellow, Green, Blue, Red, Purple)
- ✅ Instant search across all notes with context preview
- ✅ Auto dark mode (system preference detection)
- ✅ Auto-detect tags from #hashtag syntax
- ✅ Clean dashboard with stats and navigation
- ✅ Task checkboxes ([ ] and [x])
- ✅ Smart one-click export
- ✅ Toast notifications
- ✅ 7 keyboard shortcuts
- ✅ Emoji-based UI (🔍 📊 ↓ 👁)
- ✅ Context menu integration
- ✅ Per-page note storage
- ✅ Fully responsive design

**Design Philosophy:**
- Zero configuration needed
- Features that "just work"
- System-integrated preferences
- Clean, uncluttered interface
- One-click actions

### v1.0.0 - Initial Release
- Basic wiki markup note-taking
- Side panel interface
- Simple text editor

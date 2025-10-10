// Initialize wiki parser
const parser = new WikiParser();

// DOM elements
const noteEditor = document.getElementById('noteEditor');
const preview = document.getElementById('preview');
const togglePreviewBtn = document.getElementById('togglePreview');
const clearNotesBtn = document.getElementById('clearNotes');
const toggleHelpBtn = document.getElementById('toggleHelp');
const helpSection = document.getElementById('helpSection');
const editorPane = document.getElementById('editorPane');
const previewPane = document.getElementById('previewPane');

// New DOM elements (will add to HTML)
let pageTitle;
let exportBtn;
let switchModeBtn;

// State
let isPreviewVisible = false;
let isHelpVisible = false;
let currentPageUrl = '';
let currentPageTitle = '';
let isPerPageMode = true; // Per-page or global notes mode

// Initialize
init();

async function init() {
  // Get references to new UI elements
  pageTitle = document.getElementById('pageTitle');
  exportBtn = document.getElementById('exportBtn');
  switchModeBtn = document.getElementById('switchModeBtn');

  // Get current tab info
  await updateCurrentPage();

  // Load notes for current page
  loadNotes();

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Side panel received message:', request);

    if (request.action === 'addToNotes') {
      addTextToNotes(request.text, request.type, request.url, request.pageTitle);
      sendResponse({ success: true });
      return true;
    }
  });

  setupEventListeners();
}

// Get current active tab information
async function updateCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentPageUrl = tab.url;
      currentPageTitle = tab.title || 'Untitled';

      if (pageTitle) {
        pageTitle.textContent = isPerPageMode ? `Notes for: ${currentPageTitle}` : 'Global Notes';
      }
    }
  } catch (e) {
    console.error('Error getting current tab:', e);
    currentPageUrl = 'global';
    currentPageTitle = 'Global';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auto-save on input with debouncing
  let saveTimeout;
  noteEditor.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNotes();
      if (isPreviewVisible) {
        updatePreview();
      }
    }, 500);
  });

  // Toggle preview
  togglePreviewBtn.addEventListener('click', () => {
    isPreviewVisible = !isPreviewVisible;

    if (isPreviewVisible) {
      previewPane.style.display = 'block';
      editorPane.style.flex = '1';
      previewPane.style.flex = '1';
      updatePreview();
      togglePreviewBtn.textContent = 'Preview ✓';
    } else {
      previewPane.style.display = 'none';
      editorPane.style.flex = '1';
      togglePreviewBtn.textContent = 'Preview';
    }
  });

  // Clear notes
  clearNotesBtn.addEventListener('click', () => {
    const message = isPerPageMode
      ? 'Clear notes for this page?'
      : 'Clear all global notes?';

    if (confirm(message)) {
      noteEditor.value = '';
      saveNotes();
      if (isPreviewVisible) {
        updatePreview();
      }
    }
  });

  // Toggle help
  toggleHelpBtn.addEventListener('click', () => {
    isHelpVisible = !isHelpVisible;
    helpSection.style.display = isHelpVisible ? 'block' : 'none';
    toggleHelpBtn.textContent = isHelpVisible ? 'Hide Wiki Syntax Help' : 'Show Wiki Syntax Help';
  });

  // Export functionality
  if (exportBtn) {
    exportBtn.addEventListener('click', exportNotes);
  }

  // Switch between per-page and global mode
  if (switchModeBtn) {
    switchModeBtn.addEventListener('click', toggleMode);
  }

  // Keyboard shortcuts
  noteEditor.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNotes();
      showSaveIndicator();
    }

    // Ctrl/Cmd + P to toggle preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      togglePreviewBtn.click();
    }

    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      exportNotes();
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = noteEditor.selectionStart;
      const end = noteEditor.selectionEnd;
      const value = noteEditor.value;

      noteEditor.value = value.substring(0, start) + '  ' + value.substring(end);
      noteEditor.selectionStart = noteEditor.selectionEnd = start + 2;
    }
  });
}

// Add text to notes from context menu
function addTextToNotes(text, type, url, pageTitle) {
  console.log('Adding text to notes:', { text, type, url, pageTitle });
  console.log('Current URL:', currentPageUrl, 'Per-page mode:', isPerPageMode);

  let textToAdd = '';

  if (type === 'heading') {
    textToAdd = `\n== ${text} ==\n`;
  } else if (type === 'paragraph') {
    textToAdd = `\n${text}\n`;
  } else if (type === 'highlight') {
    textToAdd = `\n* ${text}\n`;
  }

  // Get cursor position or default to end
  const cursorPos = noteEditor.selectionStart || noteEditor.value.length;
  const currentValue = noteEditor.value;

  // Insert text at cursor position
  noteEditor.value = currentValue.substring(0, cursorPos) + textToAdd + currentValue.substring(cursorPos);
  noteEditor.selectionStart = noteEditor.selectionEnd = cursorPos + textToAdd.length;

  // Focus the editor
  noteEditor.focus();

  saveNotes();
  showSaveIndicator('Text added!');

  console.log('Text added successfully');
}

// Toggle between per-page and global mode
async function toggleMode() {
  isPerPageMode = !isPerPageMode;

  // Save current notes before switching
  saveNotes();

  // Update UI
  await updateCurrentPage();

  // Load notes for new mode
  loadNotes();

  if (switchModeBtn) {
    switchModeBtn.textContent = isPerPageMode ? 'Per-Page' : 'Global';
  }
}

// Get storage key based on current mode
function getStorageKey() {
  if (isPerPageMode) {
    return `notes_${hashCode(currentPageUrl)}`;
  } else {
    return 'wikiNotes_global';
  }
}

// Save notes to Chrome storage
function saveNotes() {
  const notes = noteEditor.value;
  const storageKey = getStorageKey();

  // Save the note with metadata
  const noteData = {
    content: notes,
    url: currentPageUrl,
    title: currentPageTitle,
    timestamp: Date.now()
  };

  chrome.storage.local.set({ [storageKey]: noteData }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving notes:', chrome.runtime.lastError);
    }
  });

  // Also maintain an index of all pages with notes
  updateNotesIndex();
}

// Maintain index of all pages with notes
function updateNotesIndex() {
  chrome.storage.local.get(['notesIndex'], (result) => {
    let index = result.notesIndex || {};

    if (isPerPageMode) {
      index[currentPageUrl] = {
        title: currentPageTitle,
        timestamp: Date.now()
      };
    }

    chrome.storage.local.set({ notesIndex: index });
  });
}

// Load notes from Chrome storage
function loadNotes() {
  const storageKey = getStorageKey();

  chrome.storage.local.get([storageKey], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading notes:', chrome.runtime.lastError);
      return;
    }

    if (result[storageKey]) {
      const noteData = result[storageKey];
      noteEditor.value = noteData.content || '';
    } else {
      noteEditor.value = '';
    }

    if (isPreviewVisible) {
      updatePreview();
    }
  });
}

// Export notes and highlights
async function exportNotes() {
  try {
    // Get current notes
    const notes = noteEditor.value;

    // Get highlights for current page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let highlights = [];
    if (tab && tab.id) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getHighlights' });
        highlights = response.highlights || [];
      } catch (e) {
        console.log('Could not get highlights from page');
      }
    }

    // Get all notes if in global mode
    let allNotes = {};
    if (!isPerPageMode) {
      const result = await chrome.storage.local.get(null);
      for (const key in result) {
        if (key.startsWith('notes_')) {
          allNotes[key] = result[key];
        }
      }
    }

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      mode: isPerPageMode ? 'per-page' : 'global',
      currentPage: {
        url: currentPageUrl,
        title: currentPageTitle,
        notes: notes,
        highlights: highlights
      },
      allNotes: isPerPageMode ? null : allNotes
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const filename = `wiki-notes-${isPerPageMode ? 'page' : 'all'}-${Date.now()}.json`;

    // Download
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    showSaveIndicator('Notes exported!');
  } catch (e) {
    console.error('Export error:', e);
    alert('Error exporting notes: ' + e.message);
  }
}

// Update preview
function updatePreview() {
  const wikiText = noteEditor.value;
  preview.innerHTML = parser.parse(wikiText);
}

// Show save indicator
function showSaveIndicator(message = 'Saved!') {
  const indicator = document.createElement('div');
  indicator.textContent = message;
  indicator.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: #2ecc71;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(indicator);

  setTimeout(() => {
    indicator.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => indicator.remove(), 300);
  }, 2000);
}

// Simple hash function for URLs
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

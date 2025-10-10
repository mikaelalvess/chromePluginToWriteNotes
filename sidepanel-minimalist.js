// Minimalist Wiki Notes - Apple/Google style
// Features that "just work" without configuration

const parser = new WikiParser();

// DOM elements
const noteEditor = document.getElementById('noteEditor');
const preview = document.getElementById('preview');
const togglePreviewBtn = document.getElementById('togglePreview');
const helpSection = document.getElementById('helpSection');
const editorPane = document.getElementById('editorPane');
const previewPane = document.getElementById('previewPane');
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const exportBtn = document.getElementById('exportBtn');
const pageTitle = document.getElementById('pageTitle');
const quickStats = document.getElementById('quickStats');

// State
let isPreviewVisible = false;
let isSearchVisible = false;
let isDashboardVisible = false;
let currentPageUrl = '';
let currentPageTitle = '';
let allNotes = {};

// Auto-detect dark mode from system
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (isDarkMode) document.body.classList.add('dark-mode');

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  document.body.classList.toggle('dark-mode', e.matches);
});

// Initialize
init();

async function init() {
  await updateCurrentPage();
  await loadNotes();
  await updateStats();
  setupEventListeners();

  // Listen for messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addToNotes') {
      addTextToNotes(request.text, request.type);
      sendResponse({ success: true });
    } else if (request.action === 'focusSearch') {
      toggleSearch(true);
    } else if (request.action === 'focusEditor') {
      noteEditor.focus();
    }
    return true;
  });
}

async function updateCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentPageUrl = tab.url;
      currentPageTitle = tab.title || 'Untitled';
      pageTitle.textContent = currentPageTitle;
    }
  } catch (e) {
    console.error(e);
  }
}

function setupEventListeners() {
  // Auto-save with debounce
  let saveTimeout;
  noteEditor.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNotes();
      updateStats();
      if (isPreviewVisible) updatePreview();
    }, 300);
  });

  // Search
  searchBtn.addEventListener('click', () => toggleSearch());
  searchBox.addEventListener('input', (e) => performSearch(e.target.value));
  searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleSearch(false);
  });

  // Dashboard
  dashboardBtn.addEventListener('click', () => toggleDashboard());

  // Export - simple one-click
  exportBtn.addEventListener('click', () => quickExport());

  // Preview
  togglePreviewBtn.addEventListener('click', () => togglePreview());

  // Keyboard shortcuts
  noteEditor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNotes();
      showToast('Saved');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      togglePreview();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      quickExport();
    }
    // Tab for indentation
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

// === HELPER FUNCTIONS ===
function restoreEditor() {
  editorPane.innerHTML = '<textarea id="noteEditor" placeholder="Start writing in wiki markup...\n\nExamples:\n**bold** or \'\'\'bold\'\'\'\n//italic// or \'\'italic\'\'\n[[link]]\n* bullet list\n# numbered list\n== Heading ==\n=== Subheading ===\n----  (horizontal line)\n"></textarea>';
  // Re-assign DOM reference since we recreated it
  const newEditor = document.getElementById('noteEditor');
  if (newEditor) {
    // Copy properties from old reference
    Object.defineProperty(window, 'noteEditor', {
      value: newEditor,
      writable: true,
      configurable: true
    });
  }
}

// === MINIMALIST SEARCH ===
function toggleSearch(show) {
  isSearchVisible = show !== undefined ? show : !isSearchVisible;
  searchBox.style.display = isSearchVisible ? 'block' : 'none';
  if (isSearchVisible) {
    searchBox.focus();
    searchBox.select();
  } else {
    searchBox.value = '';
    // If we had search results displayed, restore the editor
    if (editorPane.querySelector('.search-results')) {
      restoreEditor();
      loadNotes();
      setupEventListeners();
    }
  }
}

async function performSearch(query) {
  if (!query.trim()) {
    noteEditor.style.display = 'block';
    return;
  }

  // Search in current note
  const currentNotes = noteEditor.value.toLowerCase();
  if (currentNotes.includes(query.toLowerCase())) {
    // Highlight matches in editor (simple visual feedback)
    const regex = new RegExp(`(${query})`, 'gi');
    noteEditor.focus();
    // Simple: just show the editor
  }

  // Search across all notes
  const allData = await chrome.storage.local.get(null);
  let results = [];

  for (const [key, data] of Object.entries(allData)) {
    if (key.startsWith('notes_') && data.content) {
      if (data.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          title: data.title || 'Untitled',
          url: data.url,
          preview: getContextPreview(data.content, query)
        });
      }
    }
  }

  // Show results in simple list
  if (results.length > 0) {
    showSearchResults(results);
  }
}

function getContextPreview(text, query) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + query.length + 40);
  return '...' + text.substring(start, end) + '...';
}

function showSearchResults(results) {
  let html = `<div class="search-results">`;
  results.forEach(r => {
    html += `<div class="search-result" data-url="${r.url}">
      <div class="result-title">${r.title}</div>
      <div class="result-preview">${r.preview}</div>
    </div>`;
  });
  html += `</div>`;

  // Replace editor view temporarily
  editorPane.innerHTML = html;

  // Add click handlers
  document.querySelectorAll('.search-result').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-url');
      // Restore editor first, then load notes
      restoreEditor();
      loadNotesForUrl(url);
      setupEventListeners();
      toggleSearch(false);
    });
  });
}

// === MINIMALIST DASHBOARD ===
async function toggleDashboard() {
  isDashboardVisible = !isDashboardVisible;

  if (isDashboardVisible) {
    await showDashboard();
  } else {
    // Back to editor - restore original structure
    restoreEditor();
    await loadNotes();
    setupEventListeners();
  }
}

async function showDashboard() {
  const allData = await chrome.storage.local.get(null);
  let pages = [];
  let totalNotes = 0;
  let totalHighlights = 0;

  for (const [key, data] of Object.entries(allData)) {
    if (key.startsWith('notes_') && data.content) {
      totalNotes++;
      pages.push({
        title: data.title || 'Untitled',
        url: data.url,
        wordCount: data.content.split(/\s+/).length,
        timestamp: data.timestamp,
        tags: extractTags(data.content)
      });
    }
    if (key === 'allHighlights') {
      totalHighlights = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
    }
  }

  pages.sort((a, b) => b.timestamp - a.timestamp);

  let html = `
    <div class="dashboard">
      <div class="dashboard-stats">
        <div class="stat"><span class="stat-number">${totalNotes}</span> notes</div>
        <div class="stat"><span class="stat-number">${totalHighlights}</span> highlights</div>
      </div>
      <div class="dashboard-list">
  `;

  pages.forEach(p => {
    const date = new Date(p.timestamp).toLocaleDateString();
    const tagsList = p.tags.length > 0 ? p.tags.map(t => `<span class="tag">${t}</span>`).join(' ') : '';
    html += `
      <div class="dashboard-item" data-url="${p.url}">
        <div class="item-title">${p.title}</div>
        <div class="item-meta">
          <span>${p.wordCount} words</span>
          <span>${date}</span>
        </div>
        ${tagsList ? `<div class="item-tags">${tagsList}</div>` : ''}
      </div>
    `;
  });

  html += `</div></div>`;

  editorPane.innerHTML = html;

  // Add click handlers
  document.querySelectorAll('.dashboard-item').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-url');
      // Restore editor first
      restoreEditor();
      loadNotesForUrl(url);
      setupEventListeners();
      isDashboardVisible = false; // Close dashboard without full toggle
    });
  });
}

// === AUTO-DETECT TAGS ===
function extractTags(text) {
  const regex = /#[\w-]+/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches)]; // unique tags
}

async function updateStats() {
  const text = noteEditor.value;
  const words = text.trim() ? text.split(/\s+/).length : 0;
  const tags = extractTags(text);

  let statsHTML = `<span class="stat-item">${words} words</span>`;
  if (tags.length > 0) {
    statsHTML += ` <span class="stat-item">${tags.map(t => `<span class="mini-tag">${t}</span>`).join(' ')}</span>`;
  }

  quickStats.innerHTML = statsHTML;
}

// === SIMPLE TASKS (Auto-render checkboxes) ===
// This is handled by wiki-parser.js which we'll update

// === QUICK EXPORT (One-click, smart format) ===
async function quickExport() {
  const notes = noteEditor.value;
  const format = notes.length > 500 ? 'markdown' : 'text';

  let content, filename, mimeType;

  if (format === 'markdown') {
    content = notes; // Wiki markup is close to markdown
    filename = `${currentPageTitle.substring(0, 30)}.md`;
    mimeType = 'text/markdown';
  } else {
    content = notes;
    filename = `${currentPageTitle.substring(0, 30)}.txt`;
    mimeType = 'text/plain';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false // Auto-download, no dialog
  });

  showToast('Exported');
}

// === CORE FUNCTIONS ===
function togglePreview() {
  isPreviewVisible = !isPreviewVisible;
  previewPane.style.display = isPreviewVisible ? 'block' : 'none';
  if (isPreviewVisible) {
    editorPane.style.flex = '1';
    previewPane.style.flex = '1';
    updatePreview();
    togglePreviewBtn.textContent = '👁✓';
  } else {
    editorPane.style.flex = '1';
    togglePreviewBtn.textContent = '👁';
  }
}

function updatePreview() {
  let html = parser.parse(noteEditor.value);
  // Auto-render tasks
  html = html.replace(/\[ \]/g, '<input type="checkbox" disabled>');
  html = html.replace(/\[x\]/gi, '<input type="checkbox" checked disabled>');
  preview.innerHTML = html;
}

function addTextToNotes(text, type) {
  let textToAdd = type === 'heading' ? `\n== ${text} ==\n` : `\n${text}\n`;
  const pos = noteEditor.selectionStart || noteEditor.value.length;
  noteEditor.value = noteEditor.value.substring(0, pos) + textToAdd + noteEditor.value.substring(pos);
  noteEditor.focus();
  saveNotes();
  showToast('Added');
}

function saveNotes() {
  const noteData = {
    content: noteEditor.value,
    url: currentPageUrl,
    title: currentPageTitle,
    timestamp: Date.now()
  };

  chrome.storage.local.set({ [`notes_${hashCode(currentPageUrl)}`]: noteData });
}

async function loadNotes() {
  const key = `notes_${hashCode(currentPageUrl)}`;
  const result = await chrome.storage.local.get([key]);
  noteEditor.value = result[key]?.content || '';
  updateStats();
}

async function loadNotesForUrl(url) {
  const key = `notes_${hashCode(url)}`;
  const result = await chrome.storage.local.get([key]);
  noteEditor.value = result[key]?.content || '';
  currentPageUrl = url;
  currentPageTitle = result[key]?.title || 'Untitled';
  pageTitle.textContent = currentPageTitle;
  updateStats();
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

// Content script for highlighting text on web pages

// Store highlights for this page
let highlights = [];
const HIGHLIGHT_CLASS = 'wiki-notes-highlight';

// Load highlights for current page when script loads
loadHighlights();

// Store last right-clicked element
let lastRightClickedElement = null;

// Track right-click position
document.addEventListener('contextmenu', (e) => {
  lastRightClickedElement = e.target;
}, true);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightText') {
    highlightSelection(request.text, request.color || 'yellow');
    sendResponse({ success: true });
  } else if (request.action === 'getHighlights') {
    sendResponse({ highlights: highlights });
  } else if (request.action === 'clearHighlights') {
    clearAllHighlights();
    sendResponse({ success: true });
  } else if (request.action === 'removeHighlightAtClick') {
    removeHighlightAtElement(lastRightClickedElement);
    sendResponse({ success: true });
  }
  return true;
});

// Highlight currently selected text
function highlightSelection(textToFind, color = 'yellow') {
  const selection = window.getSelection();

  if (!selection.rangeCount || selection.isCollapsed) {
    console.log('No valid selection found');
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = textToFind || selection.toString();

  if (!selectedText || selectedText.trim().length === 0) {
    console.log('No text selected');
    return;
  }

  // Create highlight span with color class
  const highlightSpan = document.createElement('span');
  highlightSpan.className = `${HIGHLIGHT_CLASS} highlight-${color}`;
  const highlightId = Date.now().toString();
  highlightSpan.setAttribute('data-highlight-id', highlightId);
  highlightSpan.setAttribute('data-highlight-color', color);

  // Wrap the selected content
  try {
    range.surroundContents(highlightSpan);
  } catch (e) {
    // If surroundContents fails (complex selection), use different approach
    try {
      const fragment = range.extractContents();
      highlightSpan.appendChild(fragment);
      range.insertNode(highlightSpan);
    } catch (err) {
      console.error('Failed to highlight:', err);
      return;
    }
  }

  // Save highlight info
  const highlightInfo = {
    id: highlightId,
    text: selectedText.trim(),
    timestamp: Date.now(),
    color: color
  };

  highlights.push(highlightInfo);
  saveHighlights();

  // Clear selection
  selection.removeAllRanges();

  console.log('Highlighted:', selectedText, 'with color:', color);
}

// Get XPath for an element (for persistence)
function getXPath(element) {
  if (element.id !== '') {
    return 'id("' + element.id + '")';
  }

  if (element === document.body) {
    return element.tagName;
  }

  let ix = 0;
  const siblings = element.parentNode.childNodes;

  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];

    if (sibling === element) {
      return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
    }

    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
}

// Get element by XPath
function getElementByXPath(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Save highlights to storage
function saveHighlights() {
  const pageUrl = window.location.href;
  const storageKey = `highlights_${hashCode(pageUrl)}`;

  chrome.storage.local.get(['allHighlights'], (result) => {
    const allHighlights = result.allHighlights || {};
    allHighlights[pageUrl] = highlights;

    chrome.storage.local.set({ allHighlights: allHighlights });
  });
}

// Load highlights for current page
function loadHighlights() {
  const pageUrl = window.location.href;

  chrome.storage.local.get(['allHighlights'], (result) => {
    const allHighlights = result.allHighlights || {};
    highlights = allHighlights[pageUrl] || [];

    // Restore highlights on page
    restoreHighlights();
  });
}

// Restore highlights on the page
function restoreHighlights() {
  highlights.forEach(highlight => {
    try {
      // Try to find text nodes containing the highlighted text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent;
        if (text.includes(highlight.text) && !node.parentElement.classList.contains(HIGHLIGHT_CLASS)) {
          const index = text.indexOf(highlight.text);
          if (index !== -1) {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + highlight.text.length);

            const span = document.createElement('span');
            const color = highlight.color || 'yellow';
            span.className = `${HIGHLIGHT_CLASS} highlight-${color}`;
            span.setAttribute('data-highlight-id', highlight.id);
            span.setAttribute('data-highlight-color', color);

            range.surroundContents(span);
            break;
          }
        }
      }
    } catch (e) {
      console.log('Could not restore highlight:', e);
    }
  });
}

// Clear all highlights
function clearAllHighlights() {
  const highlightElements = document.querySelectorAll('.' + HIGHLIGHT_CLASS);
  highlightElements.forEach(el => {
    const parent = el.parentNode;
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
  });

  highlights = [];
  saveHighlights();
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

// Remove highlight from specific element
function removeHighlightAtElement(element) {
  if (!element) return;

  // Check if the element itself is highlighted
  if (element.classList.contains(HIGHLIGHT_CLASS)) {
    removeHighlightElement(element);
    return;
  }

  // Check if any parent is highlighted (in case clicked on child element)
  let current = element;
  while (current && current !== document.body) {
    if (current.classList && current.classList.contains(HIGHLIGHT_CLASS)) {
      removeHighlightElement(current);
      return;
    }
    current = current.parentNode;
  }

  console.log('No highlight found at clicked position');
}

// Helper function to remove a highlight element
function removeHighlightElement(element) {
  const highlightId = element.getAttribute('data-highlight-id');

  // Remove from DOM
  const parent = element.parentNode;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);

  // Remove from storage
  highlights = highlights.filter(h => h.id !== highlightId);
  saveHighlights();

  console.log('Highlight removed:', highlightId);
}

// Allow clicking highlighted text to remove it (legacy - keep for Alt/Ctrl+Click)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains(HIGHLIGHT_CLASS)) {
    if (e.altKey || e.ctrlKey) { // Hold Alt or Ctrl and click to remove
      removeHighlightElement(e.target);
    }
  }
});

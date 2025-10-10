// Background service worker for Ankur's Wiki Notes extension

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Create context menu items
function createContextMenus() {
  // Remove existing menus first to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'addAsHeading',
      title: "Add to Ankur's Wiki Notes as Heading",
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'addAsParagraph',
      title: "Add to Ankur's Wiki Notes as Paragraph",
      contexts: ['selection']
    });

    // Highlight submenu with colors
    chrome.contextMenus.create({
      id: 'highlightMenu',
      title: 'Highlight as...',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'highlightYellow',
      parentId: 'highlightMenu',
      title: '🟨 Yellow (Important)',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'highlightGreen',
      parentId: 'highlightMenu',
      title: '🟩 Green (Definition)',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'highlightBlue',
      parentId: 'highlightMenu',
      title: '🟦 Blue (Question)',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'highlightRed',
      parentId: 'highlightMenu',
      title: '🟥 Red (Critical)',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'highlightPurple',
      parentId: 'highlightMenu',
      title: '🟪 Purple (Reference)',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'removeHighlight',
      title: 'Remove Highlight',
      contexts: ['all']
    });

    console.log('Context menus created');
  });
}

// Create menus on install and startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  createContextMenus();
});

// Also create on service worker activation
createContextMenus();

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  const pageUrl = tab.url;

  console.log('Context menu clicked:', info.menuItemId, 'Text:', selectedText);

  if (info.menuItemId === 'addAsHeading') {
    // Open side panel first
    await chrome.sidePanel.open({ windowId: tab.windowId });

    // Wait a bit for side panel to load, then send message
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'addToNotes',
        text: selectedText,
        type: 'heading',
        url: pageUrl,
        pageTitle: tab.title
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Message sent successfully');
        }
      });
    }, 500);

  } else if (info.menuItemId === 'addAsParagraph') {
    // Open side panel first
    await chrome.sidePanel.open({ windowId: tab.windowId });

    // Wait a bit for side panel to load, then send message
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'addToNotes',
        text: selectedText,
        type: 'paragraph',
        url: pageUrl,
        pageTitle: tab.title
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Message sent successfully');
        }
      });
    }, 500);

  } else if (info.menuItemId.startsWith('highlight')) {
    // Determine color based on menu item
    let color = 'yellow'; // default
    if (info.menuItemId === 'highlightYellow') color = 'yellow';
    else if (info.menuItemId === 'highlightGreen') color = 'green';
    else if (info.menuItemId === 'highlightBlue') color = 'blue';
    else if (info.menuItemId === 'highlightRed') color = 'red';
    else if (info.menuItemId === 'highlightPurple') color = 'purple';

    // Send message to content script to highlight with color
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightText',
        text: selectedText,
        color: color
      });
      console.log('Highlight response:', response);
    } catch (error) {
      console.error('Error highlighting:', error);
      // Try to inject content script if it's not already there
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Try again after injection
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'highlightText',
              text: selectedText,
              color: color
            });
          } catch (e) {
            console.error('Still failed after injection:', e);
          }
        }, 100);
      } catch (injectionError) {
        console.error('Could not inject content script:', injectionError);
      }
    }
  } else if (info.menuItemId === 'removeHighlight') {
    // Send message to content script to remove highlight at clicked position
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'removeHighlightAtClick'
      });
      console.log('Remove highlight response:', response);
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  }
});

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (command === 'open-sidepanel') {
    chrome.sidePanel.open({ windowId: tab.windowId });
  } else if (command === 'highlight-yellow') {
    // Send message to content script to highlight with yellow
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightSelection',
        color: 'yellow'
      });
    } catch (e) {
      console.error('Could not highlight:', e);
    }
  } else if (command === 'search-notes') {
    // Open side panel and trigger search
    await chrome.sidePanel.open({ windowId: tab.windowId });
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'focusSearch' });
    }, 300);
  } else if (command === 'quick-note') {
    // Open side panel and focus editor
    await chrome.sidePanel.open({ windowId: tab.windowId });
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'focusEditor' });
    }, 300);
  }
});

// Listen for messages from content script or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  if (request.action === 'openSidePanel') {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
    sendResponse({ success: true });
  }

  return true; // Keep channel open for async response
});

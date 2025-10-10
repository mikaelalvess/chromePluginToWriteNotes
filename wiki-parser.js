// Wiki markup parser
class WikiParser {
  constructor() {
    this.rules = [
      // Headings
      { pattern: /^====\s*(.+?)\s*====$/gm, replacement: '<h4>$1</h4>' },
      { pattern: /^===\s*(.+?)\s*===$/gm, replacement: '<h3>$1</h3>' },
      { pattern: /^==\s*(.+?)\s*==$/gm, replacement: '<h2>$1</h2>' },

      // Horizontal line
      { pattern: /^----+$/gm, replacement: '<hr>' },

      // Bold - both MediaWiki and alternative syntax
      { pattern: /'''(.+?)'''/g, replacement: '<strong>$1</strong>' },
      { pattern: /\*\*(.+?)\*\*/g, replacement: '<strong>$1</strong>' },

      // Italic - both MediaWiki and alternative syntax
      { pattern: /''(.+?)''/g, replacement: '<em>$1</em>' },
      { pattern: /\/\/(.+?)\/\//g, replacement: '<em>$1</em>' },

      // Underline
      { pattern: /__(.+?)__/g, replacement: '<u>$1</u>' },

      // Strikethrough
      { pattern: /~~(.+?)~~/g, replacement: '<del>$1</del>' },

      // Inline code
      { pattern: /`(.+?)`/g, replacement: '<code>$1</code>' },

      // Links with label [[url|label]]
      { pattern: /\[\[([^\|\]]+)\|([^\]]+)\]\]/g, replacement: '<a href="$1" target="_blank">$2</a>' },

      // Simple links [[text]]
      { pattern: /\[\[([^\]]+)\]\]/g, replacement: '<a href="#$1" class="internal-link">$1</a>' },
    ];
  }

  parse(text) {
    if (!text) return '';

    // Escape HTML to prevent XSS
    let html = this.escapeHtml(text);

    // Split into lines for list processing
    let lines = html.split('\n');
    let inList = false;
    let listType = null;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmedLine = line.trim();

      // Handle bullet lists
      if (trimmedLine.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul>');
          listType = 'ul';
          inList = true;
        }
        result.push('<li>' + trimmedLine.substring(2) + '</li>');
        continue;
      }

      // Handle numbered lists
      if (trimmedLine.startsWith('# ')) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol>');
          listType = 'ol';
          inList = true;
        }
        result.push('<li>' + trimmedLine.substring(2) + '</li>');
        continue;
      }

      // Close list if we're in one and hit a non-list line
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }

      // Regular line
      if (trimmedLine === '') {
        result.push('<br>');
      } else {
        result.push(line);
      }
    }

    // Close any open list
    if (inList) {
      result.push(`</${listType}>`);
    }

    html = result.join('\n');

    // Apply inline formatting rules
    for (let rule of this.rules) {
      html = html.replace(rule.pattern, rule.replacement);
    }

    // Wrap paragraphs
    html = html.replace(/^(?!<[huo]|<br|<hr)(.+)$/gm, '<p>$1</p>');

    return html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WikiParser;
}

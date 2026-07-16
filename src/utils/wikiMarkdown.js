export function extractWikiHeadings(markdown = '') {
  return [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match, index) => ({
    id: `wiki-heading-${index}`,
    title: match[1],
  }));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderWikiMarkdown(markdown = '') {
  let headingIndex = 0;
  let html = escapeHtml(markdown)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, (match, title) => `<h2 id="wiki-heading-${headingIndex++}">${title}</h2>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter((cell) => cell.trim());
      if (cells.every((cell) => /^[-:]+$/.test(cell.trim()))) return '';
      return `<tr>${cells.map((cell) => `<td>${cell.trim()}</td>`).join('')}</tr>`;
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/(<tr>.*?<\/tr>\s*)+/g, (match) => `<table>${match}</table>`);
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  return html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h2|h3|ul|table|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

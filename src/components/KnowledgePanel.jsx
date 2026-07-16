import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findKnowledgeArticle } from '../data/knowledge';
import { getWikiHref } from '../data/wiki';

// 简单的 Markdown 转 HTML
function simpleMarkdown(text) {
  let html = text
    // 标题
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 表格
    .replace(/^\|(.+)\|$/gm, (line) => {
      const cells = line.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^[-:]+$/))) return '<tr class="sep"></tr>';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 代码块
    .replace(/~~~([\s\S]*?)~~~/g, '<pre><code>$1</code></pre>')
    // 换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // 包裹连续的 li
  html = html.replace(/(<li>.*?<\/li>(<br\/>)?)+/g, (match) => `<ul>${match.replace(/<br\/>/g, '')}</ul>`);
  // 包裹连续的 tr
  html = html.replace(/(<tr>.*?<\/tr>\s*)+/g, (match) => `<table>${match}</table>`);

  return `<p>${html}</p>`;
}

export default function KnowledgePanel({ knowledgeId, category }) {
  const [expanded, setExpanded] = useState(false);

  const article = findKnowledgeArticle(knowledgeId, category);

  if (!article) return null;

  return (
    <div className="knowledge-panel">
      {!expanded ? (
        <button className="knowledge-toggle" onClick={() => setExpanded(true)}>
          查看对应知识点：{article.title}
        </button>
      ) : (
        <div className="knowledge-content">
          <div className="knowledge-header">
            <h3>{article.title}</h3>
            <span className="category-tag">{article.category}</span>
            <Link className="knowledge-open-link" to={getWikiHref(knowledgeId, category)}>
              在知识库中学习 →
            </Link>
            <button className="knowledge-close" onClick={() => setExpanded(false)}>
              收起 ▲
            </button>
          </div>
          <div
            className="knowledge-body"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(article.content) }}
          />
        </div>
      )}
    </div>
  );
}

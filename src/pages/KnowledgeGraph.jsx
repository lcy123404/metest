import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Search, Target, ZoomIn, ZoomOut } from 'lucide-react';
import wikiSections, { findWikiPage } from '../data/wiki';
import questions from '../data/questions';

const positions = [
  { left: '50%', top: '8%' },
  { left: '75%', top: '16%' },
  { left: '88%', top: '38%' },
  { left: '84%', top: '65%' },
  { left: '64%', top: '82%' },
  { left: '37%', top: '84%' },
  { left: '15%', top: '68%' },
  { left: '9%', top: '40%' },
  { left: '24%', top: '15%' },
];

export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(wikiSections[0]?.id || '');
  const [query, setQuery] = useState('');
  const [scale, setScale] = useState(1);
  const sections = wikiSections.slice(0, 9);
  const selected = sections.find((section) => section.id === selectedId) || sections[0];

  const filteredPages = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const pages = keyword ? wikiSections.flatMap((section) => section.pages).filter((page) => [page.title, page.summary, page.content].join(' ').toLowerCase().includes(keyword)) : selected?.pages || [];
    return pages.slice(0, 12).map((page) => ({
      ...page,
      count: questions.filter((question) => findWikiPage(question.knowledge_id, question.category)?.id === page.id).length,
    }));
  }, [query, selected]);

  return (
    <div className="workspace-page graph-page">
      <header className="page-intro">
        <div><span className="workspace-eyebrow">KNOWLEDGE NETWORK</span><h1>结构设计知识图谱</h1><p>从能力域进入知识节点，查看前置关系、关联题目和个人复盘路径。</p></div>
        <button className="button primary" onClick={() => navigate(`/learn?pack=all&count=30&shuffle=1`)}><Target size={17} />随机检验 30 题</button>
      </header>

      <div className="graph-workbench">
        <section className="graph-canvas-shell">
          <div className="graph-toolbar">
            <div className="graph-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索知识节点" /></div>
            <div><button className="icon-button" onClick={() => setScale((value) => Math.max(.8, value - .1))} aria-label="缩小图谱" title="缩小"><ZoomOut size={17} /></button><button className="icon-button" onClick={() => setScale((value) => Math.min(1.2, value + .1))} aria-label="放大图谱" title="放大"><ZoomIn size={17} /></button></div>
          </div>
          <div className="graph-canvas" style={{ '--graph-scale': scale }}>
            <div className="graph-orbit orbit-one" />
            <div className="graph-orbit orbit-two" />
            <button className="graph-center" onClick={() => setQuery('')}><BrainCircuit size={23} /><strong>产品结构设计</strong><span>{questions.length} 道关联题</span></button>
            {sections.map((section, index) => (
              <button key={section.id} className={`graph-node node-${index + 1} ${selectedId === section.id ? 'active' : ''}`} style={positions[index]} onClick={() => { setSelectedId(section.id); setQuery(''); }}>
                <span>{String(index + 1).padStart(2, '0')}</span><strong>{section.title.replace(/^第[一二三四五六七八九]模块：/, '')}</strong><small>{section.pages.length} 个节点</small>
              </button>
            ))}
          </div>
          <div className="graph-legend"><span><i className="core" />核心能力</span><span><i className="domain" />能力域</span><span><i className="edge" />知识关联</span></div>
        </section>

        <aside className="graph-inspector">
          <div className="graph-inspector-head"><span>{query ? 'SEARCH RESULT' : 'SELECTED DOMAIN'}</span><h2>{query ? `“${query}”` : selected?.title}</h2><p>{query ? `找到 ${filteredPages.length} 个相关知识节点` : `包含 ${selected?.pages.length || 0} 个知识节点，可继续进入知识页或关联训练。`}</p></div>
          <div className="graph-node-list">
            {filteredPages.map((page, index) => (
              <button key={page.id} onClick={() => navigate(`/kb?topic=${page.id}`)}>
                <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{page.title}</strong><small>{page.summary}</small></div><em>{page.count || '—'} 题</em><ArrowRight size={15} />
              </button>
            ))}
          </div>
          {filteredPages.length === 0 && <div className="graph-no-result"><Search size={22} /><strong>没有匹配节点</strong><span>试试“壁厚”“公差”或“DFM”。</span></div>}
          {!query && selected && <button className="graph-domain-action" onClick={() => navigate(`/kb?topic=${selected.pages[0]?.id || ''}`)}>进入 {selected.title} 知识路径 <ArrowRight size={15} /></button>}
        </aside>
      </div>
    </div>
  );
}

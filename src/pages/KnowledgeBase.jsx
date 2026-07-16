import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import questions from '../data/questions';
import wikiSections, { findWikiPage, resolveWikiPage } from '../data/wiki';
import { loadPublishedWikiContent, loadWikiStructure } from '../services/wikiContent';
import { extractWikiHeadings, renderWikiMarkdown } from '../utils/wikiMarkdown';
import { mergeWikiStructure } from '../utils/wikiStructure';

function questionsForPage(pageId) {
  return questions.filter((question) => findWikiPage(question.knowledge_id, question.category)?.id === pageId);
}

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [pointQuery, setPointQuery] = useState('');
  const [showMorePoints, setShowMorePoints] = useState(false);
  const [publishedRecords, setPublishedRecords] = useState([]);
  const [structureRecords, setStructureRecords] = useState([]);

  const displayStructure = useMemo(
    () => mergeWikiStructure(wikiSections, structureRecords, publishedRecords),
    [structureRecords, publishedRecords]
  );
  const displaySections = displayStructure.sections;
  const displayPages = displayStructure.pages;

  const topic = searchParams.get('topic') || '';
  const point = searchParams.get('point') || '';
  const pointQuestion = point ? questions.find((question) => question.knowledge_id === point || `question-${question.id}` === point) : null;
  const resolvedPage = resolveWikiPage(topic, point, pointQuestion?.category || '');
  const activePage = displayPages.find((page) => page.id === topic)
    || displayPages.find((page) => page.id === resolvedPage.id)
    || displayPages[0]
    || resolvedPage;
  const activeSection = displaySections.find((section) => section.id === activePage.sectionId) || displaySections[0];
  const [openSections, setOpenSections] = useState(() => new Set(activeSection?.id ? [activeSection.id] : []));

  const pageQuestions = useMemo(() => questionsForPage(activePage.id), [activePage.id]);
  const headings = useMemo(() => extractWikiHeadings(activePage.content), [activePage.content]);
  const activePointQuestions = point
    ? pageQuestions.filter((question) => question.knowledge_id === point || `question-${question.id}` === point)
    : [];
  const activePoint = activePointQuestions[0];
  const pageIndex = displayPages.findIndex((page) => page.id === activePage.id);
  const previousPage = pageIndex > 0 ? displayPages[pageIndex - 1] : null;
  const nextPage = pageIndex < displayPages.length - 1 ? displayPages[pageIndex + 1] : null;

  const pageStats = useMemo(() => Object.fromEntries(
    displayPages.map((page) => [page.id, questionsForPage(page.id).length])
  ), [displayPages]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadPublishedWikiContent(), loadWikiStructure()])
      .then(([contentItems, nodeItems]) => {
        if (!cancelled) {
          setPublishedRecords(contentItems);
          setStructureRecords(nodeItems);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPublishedRecords([]);
          setStructureRecords([]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeSection?.id) return;
    setOpenSections((current) => new Set([...current, activeSection.id]));
  }, [activeSection?.id]);

  const keyword = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!keyword) return [];
    const pageMatches = displayPages
      .filter((page) => [page.title, page.summary, page.content].join(' ').toLowerCase().includes(keyword))
      .slice(0, 8)
      .map((page) => ({ type: 'page', id: page.id, label: page.title, meta: page.sectionTitle }));
    const questionMatches = questions
      .filter((question) => [question.question, question.explanation, question.category].join(' ').toLowerCase().includes(keyword))
      .slice(0, 12)
      .map((question) => ({ type: 'question', id: question.id, label: question.question, meta: question.category, question }));
    return [...pageMatches, ...questionMatches].slice(0, 16);
  }, [keyword, displayPages]);

  const filteredQuestions = pageQuestions.filter((question) => {
    const value = pointQuery.trim().toLowerCase();
    return !value || [question.question, question.explanation, question.knowledge_id].join(' ').toLowerCase().includes(value);
  });

  const toggleSection = (sectionId) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const selectPage = (pageId) => {
    const page = displayPages.find((item) => item.id === pageId);
    if (!page) return;
    setOpenSections((current) => new Set([...current, page.sectionId]));
    setPointQuery('');
    setShowMorePoints(false);
    setSearchParams({ topic: page.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSearchResult = (result) => {
    setQuery('');
    if (result.type === 'page') {
      selectPage(result.id);
      return;
    }
    const mappedPage = findWikiPage(result.question.knowledge_id, result.question.category);
    const page = displayPages.find((item) => item.id === mappedPage.id) || activePage;
    setOpenSections((current) => new Set([...current, page.sectionId]));
    setSearchParams({ topic: page.id, point: result.question.knowledge_id || `question-${result.question.id}` });
  };

  return (
    <div className="kb-page wiki-page">
      <header className="wiki-toolbar">
        <div className="wiki-toolbar-brand">
          <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>
          <div><span>STRUCTURE WIKI</span><h1>结构设计知识库</h1></div>
        </div>
        <div className="wiki-search-wrap">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索页面、知识点或题目" />
          {keyword && (
            <div className="wiki-search-results">
              <strong>{searchResults.length ? `${searchResults.length} 个结果` : '没有匹配结果'}</strong>
              {searchResults.map((result) => (
                <button key={`${result.type}-${result.id}`} onClick={() => openSearchResult(result)}>
                  <span>{result.type === 'page' ? '页面' : '题目'} · {result.meta}</span>
                  {result.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="wiki-mobile-page-select">
        <label htmlFor="wiki-page-select">当前页面</label>
        <select id="wiki-page-select" value={activePage.id} onChange={(event) => selectPage(event.target.value)}>
          {displaySections.map((section) => (
            <optgroup key={section.id} label={section.title}>
              {section.pages.flatMap((page) => [
                <option key={page.id} value={page.id}>{page.title}</option>,
                ...(page.children || []).map((child) => (
                  <option key={child.id} value={child.id}>　{child.title}</option>
                )),
              ])}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="wiki-layout">
        <aside className="wiki-tree" aria-label="知识库目录">
          <div className="wiki-tree-title">知识库</div>
          {displaySections.map((section) => {
            const expanded = openSections.has(section.id);
            return (
              <div key={section.id} className="wiki-tree-group">
                <button className="wiki-tree-section" onClick={() => toggleSection(section.id)} aria-expanded={expanded}>
                  <span>{expanded ? '−' : '+'}</span>
                  <strong>{section.title}</strong>
                  <small>{section.pages.length}</small>
                </button>
                {expanded && (
                  <div className="wiki-tree-pages">
                    {section.pages.map((page) => {
                      const childActive = page.children?.some((child) => child.id === activePage.id);
                      return (
                        <div className={`wiki-tree-page-group${childActive ? ' child-active' : ''}`} key={page.id}>
                          <button className={`wiki-tree-page${activePage.id === page.id ? ' active' : ''}`} onClick={() => selectPage(page.id)}>
                            <span />
                            <div><strong>{page.title}</strong>{pageStats[page.id] > 0 && <small>{pageStats[page.id]} 道关联题</small>}</div>
                          </button>
                          {page.children?.length > 0 && (
                            <div className="wiki-tree-children">
                              {page.children.map((child) => (
                                <button key={child.id} className={activePage.id === child.id ? 'active' : ''} onClick={() => selectPage(child.id)}>
                                  <span>{child.title.split(' ')[0]}</span>
                                  <strong>{child.title.replace(/^3\.1\.\d+\s*/, '')}</strong>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        <main className="wiki-content">
          <div className="wiki-breadcrumb">
            知识库 / {activeSection.title} / {activePage.parentTitle ? `${activePage.parentTitle} / ` : ''}{activePage.title}
          </div>
          <div className="wiki-page-head">
            <h1>{activePage.title}</h1>
            <p>{activePage.summary}</p>
            <div className="wiki-page-meta"><span>{activePage.level}</span>{pageQuestions.length > 0 && <span>{pageQuestions.length} 道关联题</span>}</div>
          </div>

          {headings.length > 1 && (
            <nav className="wiki-page-outline" aria-label="本页目录">
              <strong>本页目录</strong>
              <div>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>)}</div>
            </nav>
          )}

          {activePoint && (
            <section className="wiki-point-callout">
              <span>从题目进入的知识点</span>
              <h2>{activePoint.question}</h2>
              <p>{activePoint.explanation}</p>
              <div><small>出处：{activePoint.reference}</small><button onClick={() => navigate(`/learn?ids=${activePointQuestions.map((question) => question.id).join(',')}&autostart=1`)}>练习相关题目 →</button></div>
            </section>
          )}

          <article className="wiki-article" dangerouslySetInnerHTML={{ __html: renderWikiMarkdown(activePage.content) }} />

          {activePage.sources?.length > 0 && (
            <section className="wiki-sources"><h2>参考资料</h2>{activePage.sources.map((source) => <p key={source}>{source}</p>)}</section>
          )}

          <nav className="wiki-page-nav" aria-label="页面切换">
            {previousPage ? <button onClick={() => selectPage(previousPage.id)}><span>上一页</span><strong>{previousPage.title}</strong></button> : <span />}
            {nextPage && <button className="next" onClick={() => selectPage(nextPage.id)}><span>下一页</span><strong>{nextPage.title}</strong></button>}
          </nav>

          {pageQuestions.length > 0 && <section className="wiki-related">
            <div className="wiki-related-head">
              <div><span>RELATED</span><h2>本页关联题目</h2></div>
              <input value={pointQuery} onChange={(event) => setPointQuery(event.target.value)} placeholder="在本页题目中搜索" />
            </div>
            <div className="wiki-question-list">
              {filteredQuestions.slice(0, showMorePoints || pointQuery ? 40 : 8).map((question, index) => (
                <button key={question.id} onClick={() => setSearchParams({ topic: activePage.id, point: question.knowledge_id || `question-${question.id}` })}>
                  <span>{index + 1}</span><strong>{question.question}</strong><small>{question.difficulty === 'hard' ? '困难' : question.difficulty === 'medium' ? '中等' : '基础'}</small>
                </button>
              ))}
            </div>
            {!pointQuery && filteredQuestions.length > 8 && <button className="wiki-more" onClick={() => setShowMorePoints((value) => !value)}>{showMorePoints ? '收起' : `查看全部 ${filteredQuestions.length} 道题`}</button>}
          </section>}
        </main>
      </div>
    </div>
  );
}

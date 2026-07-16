import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bold,
  CheckCircle2,
  Eye,
  FilePenLine,
  Heading2,
  Heading3,
  List,
  ListTree,
  LoaderCircle,
  PencilLine,
  Quote,
  RotateCcw,
  Save,
  Search,
  Send,
} from 'lucide-react';
import wikiSections from '../data/wiki';
import {
  loadAdminWikiContent,
  loadWikiStructure,
  resetWikiContent,
  saveWikiContent,
} from '../services/wikiContent';
import { renderWikiMarkdown } from '../utils/wikiMarkdown';
import { mergeWikiStructure } from '../utils/wikiStructure';

const DEFAULT_PAGE_ID = 'plastic-materials';

function formatTime(value) {
  if (!value) return '尚未保存';
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AdminKnowledge() {
  const [searchParams] = useSearchParams();
  const textareaRef = useRef(null);
  const [records, setRecords] = useState({});
  const [nodeRecords, setNodeRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(() => searchParams.get('page') || DEFAULT_PAGE_ID);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('edit');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const managedStructure = useMemo(
    () => mergeWikiStructure(wikiSections, nodeRecords),
    [nodeRecords]
  );
  const selectedPage = managedStructure.pages.find((page) => page.id === selectedId) || managedStructure.pages[0];
  const selectedRecord = records[selectedId];

  const visibleSections = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return managedStructure.sections
      .map((section) => {
        const pages = managedStructure.pages.filter((page) => page.sectionId === section.id);
        return {
          ...section,
          pages: keyword
            ? pages.filter((page) => [page.title, page.summary, page.id].join(' ').toLowerCase().includes(keyword))
            : pages,
        };
      })
      .filter((section) => section.pages.length > 0);
  }, [query, managedStructure]);

  const stats = useMemo(() => {
    const values = Object.values(records);
    return {
      published: values.filter((item) => item.status === 'published').length,
      drafts: values.filter((item) => item.status === 'draft').length,
    };
  }, [records]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAdminWikiContent(), loadWikiStructure(true)])
      .then(([items, nodes]) => {
        if (cancelled) return;
        setRecords(Object.fromEntries(items.map((item) => [item.page_id, item])));
        setNodeRecords(nodes);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const page = managedStructure.pages.find((item) => item.id === selectedId) || managedStructure.pages[0];
    if (!page) return;
    const record = records[selectedId];
    setSummary(record?.summary || page.summary || '');
    setContent(record?.content || page.content || '');
    setDirty(false);
  }, [selectedId, loading, records, managedStructure]);

  useEffect(() => {
    const warnBeforeLeave = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, [dirty]);

  const selectPage = (pageId) => {
    if (pageId === selectedId) return;
    if (dirty && !window.confirm('当前修改尚未保存，确定切换页面吗？')) return;
    setError('');
    setNotice('');
    setSelectedId(pageId);
  };

  const updateSummary = (value) => {
    setSummary(value);
    setDirty(true);
  };

  const updateContent = (value) => {
    setContent(value);
    setDirty(true);
  };

  const insertMarkdown = (prefix, suffix = '', placeholder = '正文') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${prefix}${selected}${suffix}${content.slice(end)}`;
    updateContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const persist = async (status) => {
    if (!content.trim()) {
      setError('正文不能为空。');
      return;
    }
    setSaving(status);
    setError('');
    setNotice('');
    try {
      const saved = await saveWikiContent(selectedId, { summary, content, status });
      setRecords((current) => ({ ...current, [selectedId]: saved }));
      setDirty(false);
      setNotice(status === 'published' ? '已发布，知识库刷新后立即生效。' : '草稿已保存，线上内容不会改变。');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving('');
    }
  };

  const restoreOriginal = async () => {
    if (!selectedRecord) {
      setSummary(selectedPage.summary || '');
      setContent(selectedPage.content || '');
      setDirty(false);
      return;
    }
    if (!window.confirm('确定删除后台版本并恢复为网站内置原文吗？')) return;
    setSaving('reset');
    setError('');
    try {
      await resetWikiContent(selectedId);
      setRecords((current) => {
        const next = { ...current };
        delete next[selectedId];
        return next;
      });
      setSummary(selectedPage.summary || '');
      setContent(selectedPage.content || '');
      setDirty(false);
      setNotice('已恢复网站内置原文。');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="knowledge-admin">
      <header className="knowledge-admin-head">
        <div>
          <span>KNOWLEDGE CMS</span>
          <h1>知识库内容管理</h1>
          <p>选择知识页，使用 Markdown 编写内容，再保存草稿或发布。</p>
        </div>
        <div className="knowledge-admin-head-actions">
          <Link to="/admin/knowledge-structure" className="knowledge-admin-view-link">
            <ListTree size={16} />目录管理
          </Link>
          <Link to={`/kb?topic=${selectedId}`} className="knowledge-admin-view-link">
            <Eye size={16} />查看知识页
          </Link>
        </div>
      </header>

      <div className="knowledge-admin-layout">
        <aside className="knowledge-admin-sidebar">
          <div className="knowledge-admin-stats">
            <div><strong>{managedStructure.pages.length}</strong><span>知识页</span></div>
            <div><strong>{stats.published}</strong><span>已发布</span></div>
            <div><strong>{stats.drafts}</strong><span>草稿</span></div>
          </div>
          <label className="knowledge-admin-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索知识页" />
          </label>
          <div className="knowledge-admin-page-list">
            {visibleSections.map((section) => (
              <section key={section.id}>
                <h2>{section.title}</h2>
                {section.pages.map((page) => {
                  const record = records[page.id];
                  return (
                    <button key={page.id} className={selectedId === page.id ? 'active' : ''} onClick={() => selectPage(page.id)}>
                      <FilePenLine size={14} />
                      <span>{page.title}</span>
                      {record && <i className={record.status} title={record.status === 'published' ? '已发布' : '草稿'} />}
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
        </aside>

        <main className="knowledge-editor">
          <div className="knowledge-editor-titlebar">
            <div>
              <span>{selectedPage.sectionTitle}{selectedPage.parentTitle ? ` / ${selectedPage.parentTitle}` : ''}</span>
              <h2>{selectedPage.title}</h2>
              <small>页面 ID：{selectedPage.id}</small>
            </div>
            <div className="knowledge-editor-state">
              {selectedRecord?.status === 'published' && <span className="published"><CheckCircle2 size={13} />已发布</span>}
              {selectedRecord?.status === 'draft' && <span className="draft"><PencilLine size={13} />草稿</span>}
              {selectedRecord?.status === 'draft' && selectedRecord.published_at && <span className="published">线上保留旧版</span>}
              {!selectedRecord && <span>内置内容</span>}
              <small>{formatTime(selectedRecord?.updated_at)}</small>
            </div>
          </div>

          <label className="knowledge-editor-summary">
            <span>页面摘要</span>
            <input value={summary} maxLength={500} onChange={(event) => updateSummary(event.target.value)} />
          </label>

          <div className="knowledge-editor-toolbar">
            <div className="knowledge-editor-tools">
              <button title="二级标题" onClick={() => insertMarkdown('\n## ', '\n', '标题')}><Heading2 size={17} /></button>
              <button title="三级标题" onClick={() => insertMarkdown('\n### ', '\n', '小标题')}><Heading3 size={17} /></button>
              <button title="加粗" onClick={() => insertMarkdown('**', '**', '重点内容')}><Bold size={17} /></button>
              <button title="无序列表" onClick={() => insertMarkdown('\n- ', '', '列表内容')}><List size={17} /></button>
              <button title="引用" onClick={() => insertMarkdown('\n> ', '', '提示内容')}><Quote size={17} /></button>
            </div>
            <div className="knowledge-editor-mode" aria-label="编辑模式">
              <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}><PencilLine size={14} />编辑</button>
              <button className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}><Eye size={14} />预览</button>
            </div>
          </div>

          <div className="knowledge-editor-canvas">
            {mode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => updateContent(event.target.value)}
                spellCheck={false}
                aria-label="Markdown 正文编辑器"
              />
            ) : (
              <article className="wiki-article knowledge-editor-preview" dangerouslySetInnerHTML={{ __html: renderWikiMarkdown(content) }} />
            )}
          </div>

          <footer className="knowledge-editor-footer">
            <div>
              <span>{content.length.toLocaleString('zh-CN')} 字符</span>
              <span>{content.split(/\n/).length} 行</span>
              {dirty && <strong>有未保存修改</strong>}
            </div>
            <div>
              <button className="knowledge-editor-reset" disabled={Boolean(saving)} onClick={restoreOriginal}>
                <RotateCcw size={15} />恢复原文
              </button>
              <button className="knowledge-editor-draft" disabled={Boolean(saving) || !dirty} onClick={() => persist('draft')}>
                {saving === 'draft' ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}保存草稿
              </button>
              <button className="knowledge-editor-publish" disabled={Boolean(saving)} onClick={() => persist('published')}>
                {saving === 'published' ? <LoaderCircle className="spin" size={15} /> : <Send size={15} />}发布
              </button>
            </div>
          </footer>

          {(error || notice) && <div className={`knowledge-editor-message ${error ? 'error' : 'success'}`}>{error || notice}</div>}
          {loading && <div className="knowledge-editor-loading"><LoaderCircle className="spin" size={18} />正在读取后台内容</div>}
        </main>
      </div>
    </div>
  );
}

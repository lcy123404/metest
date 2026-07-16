import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FilePlus2, Link2, Search, Trash2 } from 'lucide-react';
import questions from '../data/questions';
import { getNotes, setNote } from '../utils/favorites';
import { getWikiHref } from '../data/wiki';

function noteTitle(key, question) {
  if (question) return question.question;
  return key.startsWith('general-') ? '独立学习笔记' : `题目 #${key}`;
}

function MarkdownPreview({ value }) {
  if (!value.trim()) return <p className="note-preview-empty">开始输入后，这里会显示阅读预览。</p>;
  return value.split('\n').map((line, index) => {
    if (line.startsWith('### ')) return <h4 key={index}>{line.slice(4)}</h4>;
    if (line.startsWith('## ')) return <h3 key={index}>{line.slice(3)}</h3>;
    if (line.startsWith('# ')) return <h2 key={index}>{line.slice(2)}</h2>;
    if (line.startsWith('- ')) return <li key={index}>{line.slice(2)}</li>;
    return <p key={index}>{line || '\u00A0'}</p>;
  });
}

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(() => getNotes());
  const [query, setQuery] = useState('');
  const initialKey = Object.keys(notes)[0] || '';
  const [activeKey, setActiveKey] = useState(initialKey);
  const [draft, setDraft] = useState(initialKey ? notes[initialKey] : '');
  const [saved, setSaved] = useState(true);

  const questionMap = useMemo(() => new Map(questions.map((question) => [String(question.id), question])), []);
  const entries = useMemo(() => Object.entries(notes)
    .map(([key, content]) => ({ key, content, question: questionMap.get(String(key)) }))
    .filter((item) => [noteTitle(item.key, item.question), item.content, item.question?.category].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(b.key.replace('general-', '')) - Number(a.key.replace('general-', ''))), [notes, query, questionMap]);

  const activeQuestion = questionMap.get(String(activeKey));

  const openNote = (key) => {
    setActiveKey(key);
    setDraft(notes[key] || '');
    setSaved(true);
  };

  const createNote = () => {
    const key = `general-${Date.now()}`;
    const content = '# 学习笔记\n\n';
    setNote(key, content);
    setNotes(getNotes());
    setActiveKey(key);
    setDraft(content);
    setSaved(true);
  };

  const saveCurrent = () => {
    if (!activeKey) return;
    setNote(activeKey, draft);
    const next = getNotes();
    setNotes(next);
    setSaved(true);
    if (!next[activeKey]) {
      const nextKey = Object.keys(next)[0] || '';
      setActiveKey(nextKey);
      setDraft(next[nextKey] || '');
    }
  };

  const deleteCurrent = () => {
    if (!activeKey) return;
    setNote(activeKey, '');
    const next = getNotes();
    setNotes(next);
    const nextKey = Object.keys(next)[0] || '';
    setActiveKey(nextKey);
    setDraft(next[nextKey] || '');
    setSaved(true);
  };

  return (
    <div className="workspace-page notes-page">
      <header className="page-intro">
        <div><span className="workspace-eyebrow">PERSONAL KNOWLEDGE</span><h1>我的笔记</h1><p>把题目解析转化成自己的判断依据，沉淀可检索的结构设计经验。</p></div>
        <button className="button primary" onClick={createNote}><FilePlus2 size={17} />新建笔记</button>
      </header>

      <div className="notes-workbench">
        <aside className="notes-index">
          <div className="notes-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索笔记内容" /></div>
          <div className="notes-index-meta"><span>{entries.length} 条笔记</span><span>Markdown</span></div>
          <div className="notes-list">
            {entries.map((item) => (
              <button key={item.key} className={activeKey === item.key ? 'active' : ''} onClick={() => openNote(item.key)}>
                <span>{item.question ? item.question.category : '独立笔记'}</span>
                <strong>{noteTitle(item.key, item.question)}</strong>
                <small>{item.content.replace(/[#*\n]/g, ' ').slice(0, 54) || '空白笔记'}</small>
              </button>
            ))}
          </div>
          {entries.length === 0 && <div className="notes-empty"><BookOpen size={22} /><strong>还没有匹配笔记</strong><span>刷题后可直接记录，也可以新建独立笔记。</span></div>}
        </aside>

        <main className="note-editor-shell">
          {activeKey ? (
            <>
              <div className="note-editor-head">
                <div><span>{activeQuestion?.category || '独立笔记'}</span><h2>{noteTitle(activeKey, activeQuestion)}</h2></div>
                <div className="note-editor-actions">
                  {activeQuestion && <button className="button secondary" onClick={() => navigate(`/learn?ids=${activeQuestion.id}&autostart=1`)}><Link2 size={16} />回到题目</button>}
                  <button className="icon-button danger" onClick={deleteCurrent} aria-label="删除笔记" title="删除笔记"><Trash2 size={17} /></button>
                  <button className="button primary" onClick={saveCurrent} disabled={saved}>保存笔记</button>
                </div>
              </div>
              {activeQuestion && <div className="note-context"><strong>关联知识：</strong><button onClick={() => navigate(getWikiHref(activeQuestion.knowledge_id, activeQuestion.category))}>{activeQuestion.knowledge_id || activeQuestion.category}</button></div>}
              <div className="note-editor-grid">
                <div className="note-write-pane"><span>编辑</span><textarea value={draft} onChange={(event) => { setDraft(event.target.value); setSaved(false); }} placeholder="# 记录你的判断依据\n\n- 为什么这样设计？\n- 量产风险是什么？" /></div>
                <div className="note-preview-pane"><span>预览</span><article><MarkdownPreview value={draft} /></article></div>
              </div>
            </>
          ) : (
            <div className="editor-empty-state"><FilePlus2 size={28} /><h2>建立你的第一条工程笔记</h2><p>可以独立记录，也可以在刷题解析下直接关联题目与知识点。</p><div><button className="button primary" onClick={createNote}>新建笔记</button><button className="button secondary" onClick={() => navigate('/learn')}>去刷题</button></div></div>
          )}
        </main>
      </div>
    </div>
  );
}

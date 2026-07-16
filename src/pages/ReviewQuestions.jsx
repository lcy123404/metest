import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultQuestions from '../data/questions';
import { useAuth } from '../contexts/AuthContext';
import { MAJOR_CATEGORIES, getMajorCategory } from '../utils/categories';

const ADMIN_STORAGE_KEY = 'admin_questions';

function loadCustomQuestions() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomQuestions(data) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
}

const ALL_CATEGORIES = [
  '材料与性能', '模具基础', '结构设计原则', '表面处理与后加工',
  '公差与装配', '产品开发流程', '缺陷分析与解决', '结构件设计',
  '热管理设计', '安全与合规', '钣金冲压', '压铸', '型材挤压',
  '塑胶材料', '金属材料', '连接与紧固', '注塑成型',
];

const TYPE_LABELS = { single: '单选题', multiple: '多选题', judge: '判断题' };
const DIFF_LABELS = { easy: '简单', medium: '中等', hard: '困难' };
const OPTION_PREFIX = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ReviewQuestions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customQuestions, setCustomQuestions] = useState(loadCustomQuestions);
  const allQuestions = useMemo(() => [...defaultQuestions, ...customQuestions], [customQuestions]);

  // Filters
  const [filterCategory, setFilterCategory] = useState('全部');
  const [filterType, setFilterType] = useState('全部');
  const [filterDifficulty, setFilterDifficulty] = useState('全部');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [dirtyFields, setDirtyFields] = useState(new Set());

  const filtered = useMemo(() => {
    let qs = [...allQuestions];
    if (filterCategory !== '全部') qs = qs.filter(q => getMajorCategory(q.category) === filterCategory);
    if (filterType !== '全部') qs = qs.filter(q => q.type === filterType);
    if (filterDifficulty !== '全部') qs = qs.filter(q => q.difficulty === filterDifficulty);
    if (search.trim()) {
      const s = search.toLowerCase();
      qs = qs.filter(q =>
        q.question.toLowerCase().includes(s) ||
        q.explanation?.toLowerCase().includes(s) ||
        q.category?.toLowerCase().includes(s)
      );
    }
    return qs;
  }, [allQuestions, filterCategory, filterType, filterDifficulty, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageQuestions = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Persist
  useEffect(() => { saveCustomQuestions(customQuestions); }, [customQuestions]);

  // Check if question is custom
  const isCustom = (id) => id >= 1000;

  // Start editing
  const handleEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      type: q.type, category: q.category, difficulty: q.difficulty,
      question: q.question, options: [...(q.options || [])],
      answer: q.type === 'multiple' ? (Array.isArray(q.answer) ? [...q.answer] : []) : q.answer,
      explanation: q.explanation || '', reference: q.reference || '',
      knowledge_id: q.knowledge_id || '',
    });
    setDirtyFields(new Set());
    setSaveMsg('');
  };

  const handleCancel = () => { setEditingId(null); setEditForm(null); setSaveMsg(''); };

  const handleFieldChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setDirtyFields(prev => new Set([...prev, field]));
    setSaveMsg('');
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...editForm.options];
    newOptions[idx] = value;
    setEditForm(prev => ({ ...prev, options: newOptions }));
    setDirtyFields(prev => new Set([...prev, 'options']));
  };

  // Save edited question
  const handleSave = () => {
    const id = editingId;
    const updated = { ...editForm, id, answer: editForm.type === 'multiple' ? [...editForm.answer] : editForm.answer };

    if (isCustom(id)) {
      setCustomQuestions(prev => prev.map(q => q.id === id ? updated : q));
    } else {
      // For default questions, save to custom storage as override
      const existing = customQuestions.find(q => q.id === id);
      if (existing) {
        setCustomQuestions(prev => prev.map(q => q.id === id ? updated : q));
      } else {
        setCustomQuestions(prev => [...prev, updated]);
      }
    }
    setSaveMsg('已保存');
    setDirtyFields(new Set());
    setTimeout(() => setSaveMsg(''), 2000);
  };

  // Reset to default for a built-in question
  const handleReset = (id) => {
    const defaultQ = defaultQuestions.find(q => q.id === id);
    if (!defaultQ) return;
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
    setEditForm({
      type: defaultQ.type, category: defaultQ.category, difficulty: defaultQ.difficulty,
      question: defaultQ.question, options: [...(defaultQ.options || [])],
      answer: defaultQ.type === 'multiple' ? (Array.isArray(defaultQ.answer) ? [...defaultQ.answer] : []) : defaultQ.answer,
      explanation: defaultQ.explanation || '', reference: defaultQ.reference || '',
      knowledge_id: defaultQ.knowledge_id || '',
    });
    setDirtyFields(new Set());
  };

  // Delete custom question
  const handleDelete = (id) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
    if (editingId === id) { setEditingId(null); setEditForm(null); }
  };

  // Answer display
  const answerDisplay = (q) => {
    if (q.type === 'multiple') {
      return (Array.isArray(q.answer) ? q.answer.map(i => OPTION_PREFIX[i]).join('、') : '');
    }
    if (q.type === 'judge') return q.answer === 0 ? '正确 ✓' : '错误 ✗';
    if (typeof q.answer === 'number') {
      return `${OPTION_PREFIX[q.answer]}. ${q.options?.[q.answer] || ''}`;
    }
    return '';
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterCategory('全部'); setFilterType('全部');
    setFilterDifficulty('全部'); setSearch(''); setPage(0);
  };

  if (!user) {
    return (
      <div className="page-container">
        <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>
        <div className="login-prompt" style={{ padding: '48px 20px' }}>
          <h2>需要登录</h2>
          <p>题库审核需要登录后使用</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>去登录</button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(allQuestions.map(q => q.category))].sort();

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/questions')}>题库管理</button>
        </div>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>题库审核</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
        共 {allQuestions.length} 道题目，当前筛选 {filtered.length} 道。
        点击题目卡片进入编辑模式，检查题面、答案、解析。
      </p>

      {/* Filters */}
      <div className="setup-card" style={{ padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>分类</label>
            <select className="form-select" value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(0); }}>
              <option value="全部">全部分类</option>
              {MAJOR_CATEGORIES.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>题型</label>
            <select className="form-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }}>
              <option value="全部">全部题型</option>
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
              <option value="judge">判断题</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>难度</label>
            <select className="form-select" value={filterDifficulty} onChange={e => { setFilterDifficulty(e.target.value); setPage(0); }}>
              <option value="全部">全部难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>搜索</label>
            <input
              className="form-input" placeholder="搜索题面、解析、分类..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={clearFilters}>清除筛选</button>
        </div>
      </div>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pageQuestions.map((q, idx) => {
          const isEditing = editingId === q.id;
          const actualQ = isEditing ? { ...editForm, id: q.id } : q;

          return (
            <div key={q.id} className="setup-card" style={{ padding: '20px 24px' }}>
              {/* Question header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isEditing ? 16 : 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                    #{q.id}
                  </span>
                  {isEditing ? (
                    <>
                      <select className="form-select" style={{ width: 90, padding: '4px 6px', fontSize: 11 }} value={editForm.type} onChange={e => handleFieldChange('type', e.target.value)}>
                        <option value="single">单选题</option>
                        <option value="multiple">多选题</option>
                        <option value="judge">判断题</option>
                      </select>
                      <select className="form-select" style={{ width: 180, padding: '4px 6px', fontSize: 11 }} value={editForm.category} onChange={e => handleFieldChange('category', e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className="form-select" style={{ width: 80, padding: '4px 6px', fontSize: 11 }} value={editForm.difficulty} onChange={e => handleFieldChange('difficulty', e.target.value)}>
                        <option value="easy">简单</option>
                        <option value="medium">中等</option>
                        <option value="hard">困难</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <span className={`difficulty-tag ${q.difficulty}`}>{DIFF_LABELS[q.difficulty]}</span>
                      <span className="type-tag">{TYPE_LABELS[q.type]}</span>
                      <span className="category-tag">{q.category}</span>
                    </>
                  )}
                  {isCustom(q.id) && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>自定义</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {isEditing && !isCustom(q.id) && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleReset(q.id)}>恢复默认</button>
                  )}
                  {isEditing && isCustom(q.id) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>删除</button>
                  )}
                  {isEditing ? (
                    <>
                      {saveMsg && <span style={{ fontSize: 13, color: 'var(--success)' }}>{saveMsg}</span>}
                      <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={dirtyFields.size === 0}>
                        保存
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={handleCancel}>收起</button>
                    </>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(q)}>展开编辑</button>
                  )}
                </div>
              </div>

              {/* Question text */}
              {isEditing ? (
                <textarea className="form-textarea" style={{ minHeight: 50, marginBottom: 14, fontWeight: 600 }}
                  value={editForm.question} onChange={e => handleFieldChange('question', e.target.value)} />
              ) : (
                <p className="question-text" style={{ fontSize: 15, marginBottom: 14 }}>{idx + 1 + page * PAGE_SIZE}. {q.question}</p>
              )}

              {/* Options */}
              {q.type !== 'judge' && (
                <div style={{ marginBottom: 14 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>选项：</span>
                      {editForm.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, minWidth: 20 }}>{OPTION_PREFIX[i]}.</span>
                          <input className="form-input" style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
                            value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {q.options?.map((opt, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '2px 0' }}>
                          <strong>{OPTION_PREFIX[i]}.</strong> {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Answer */}
              <div style={{ marginBottom: 14 }}>
                {isEditing ? (
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>正确答案：</span>
                    {editForm.type === 'judge' ? (
                      <div style={{ display: 'flex', gap: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                          <input type="radio" checked={editForm.answer === 0} onChange={() => handleFieldChange('answer', 0)} /> 正确 ✓
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                          <input type="radio" checked={editForm.answer === 1} onChange={() => handleFieldChange('answer', 1)} /> 错误 ✗
                        </label>
                      </div>
                    ) : editForm.type === 'multiple' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {editForm.options.map((opt, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={(editForm.answer || []).includes(i)}
                              onChange={() => {
                                const arr = editForm.answer || [];
                                const next = arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i];
                                handleFieldChange('answer', next.sort());
                              }} />
                            {OPTION_PREFIX[i]}. {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {editForm.options.map((opt, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                            <input type="radio" checked={editForm.answer === i} onChange={() => handleFieldChange('answer', i)} />
                            {OPTION_PREFIX[i]}. {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'var(--success-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>答案：</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{answerDisplay(q)}</span>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>解析：</span>
                {isEditing ? (
                  <textarea className="form-textarea" style={{ minHeight: 60 }}
                    value={editForm.explanation} onChange={e => handleFieldChange('explanation', e.target.value)} />
                ) : (
                  <div style={{ background: 'var(--warning-light)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, lineHeight: 1.7 }}>
                    {q.explanation || '（暂无解析）'}
                  </div>
                )}
              </div>

              {/* Reference */}
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>参考资料：</span>
                {isEditing ? (
                  <input className="form-input" style={{ fontSize: 13 }} value={editForm.reference} onChange={e => handleFieldChange('reference', e.target.value)} placeholder="参考书名或章节" />
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{q.reference || '（未标注）'}</span>
                )}
              </div>

              {/* Knowledge ID info */}
              {q.knowledge_id && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  知识文章：{q.knowledge_id}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>没有匹配的题目</p>
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>清除筛选</button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
          <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            ← 上一页
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            第 {page + 1} / {totalPages} 页
          </span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
}

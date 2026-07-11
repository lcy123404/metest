import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultQuestions from '../data/questions';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_STORAGE_KEY = 'admin_questions';

const CATEGORIES = [
  '材料与性能', '模具基础', '结构设计原则', '表面处理与后加工',
  '公差与装配', '产品开发流程', '缺陷分析与解决', '结构件设计',
  '热管理设计', '安全与合规', '钣金冲压', '压铸', '型材挤压',
];

const KNOWLEDGE_IDS = [
  'plastic-wear', 'pc-thermal', 'mold-draft-angle', 'rib-design',
  'boss-design', 'snapfit-design', 'sheet-bending', 'die-casting-alloy',
  'extrusion-tongue', 'injection-warpage', 'weld-line', 'ul94-standard',
  'dfm-review',
];

const emptyForm = () => ({
  type: 'single',
  category: CATEGORIES[0],
  difficulty: 'easy',
  question: '',
  options: ['', '', '', ''],
  answer: null,
  explanation: '',
  reference: '',
  reference_url: '',
  knowledge_id: '',
});

function loadCustomQuestions() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomQuestions(data) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
}

function nextCustomId(customQuestions) {
  if (customQuestions.length === 0) return 1000;
  return Math.max(...customQuestions.map((q) => q.id), 999) + 1;
}

// ---- Sub-components ----

function QuestionRow({ q, isCustom, onEdit, onDelete, onDeleteConfirm, confirmId, onCancelConfirm }) {
  const typeLabel = q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断';
  const answerStr = q.type === 'multiple'
    ? (Array.isArray(q.answer) ? q.answer.map((i) => q.options[i]).join('、') : '')
    : q.type === 'judge'
      ? (q.answer === 0 ? '正确' : '错误')
      : (q.options[q.answer] ?? '');

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '8px 10px', fontSize: 13, color: 'var(--text-secondary)' }}>{q.id}</td>
      <td style={{ padding: '8px 10px' }}>
        <span className="type-tag" style={{ marginRight: 4 }}>{typeLabel}</span>
        <span className="category-tag" style={{ marginRight: 4 }}>{q.category}</span>
        <span className={`difficulty-tag ${q.difficulty}`}>{q.difficulty}</span>
      </td>
      <td style={{ padding: '8px 10px', fontSize: 14, maxWidth: 320 }}>{q.question}</td>
      <td style={{ padding: '8px 10px', fontSize: 13, color: 'var(--accent)' }}>{answerStr}</td>
      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
        <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px', marginRight: 6 }} onClick={() => onEdit(q)}>
          编辑
        </button>
        {isCustom && confirmId !== q.id && (
          <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => onDelete(q.id)}>
            删除
          </button>
        )}
        {isCustom && confirmId === q.id && (
          <span style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--danger)', marginRight: 6 }}>确认删除？</span>
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px', marginRight: 4 }} onClick={() => onDeleteConfirm(q.id)}>
              确认
            </button>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={onCancelConfirm}>
              取消
            </button>
          </span>
        )}
      </td>
    </tr>
  );
}

function QuestionForm({ form, onChange, onSubmit, onCancel, isEditing }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    onChange({ ...form, options: newOptions });
  };

  const addOption = () => {
    onChange({ ...form, options: [...form.options, ''] });
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const newOptions = form.options.filter((_, i) => i !== index);
    // Adjust answer if needed
    let newAnswer = form.answer;
    if (form.type === 'single' && typeof newAnswer === 'number') {
      if (newAnswer === index) newAnswer = null;
      else if (newAnswer > index) newAnswer -= 1;
    }
    if (form.type === 'multiple' && Array.isArray(newAnswer)) {
      newAnswer = newAnswer.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i));
    }
    onChange({ ...form, options: newOptions, answer: newAnswer });
  };

  const onTypeChange = (newType) => {
    const updates = { type: newType };
    if (newType === 'judge') {
      updates.answer = null;
    } else if (newType === 'multiple') {
      updates.answer = [];
    } else {
      updates.answer = null;
    }
    onChange({ ...form, ...updates });
  };

  const fieldStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    fontSize: 13,
    background: 'var(--bg)',
    color: 'var(--text)',
    boxSizing: 'border-box',
  };

  const labelStyle = { display: 'block', marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' };

  return (
    <div className="setup-card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0, marginBottom: 20 }}>{isEditing ? '编辑题目' : '新增题目'}</h3>

      {/* Row 1: type, category, difficulty */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>题型</label>
          <select value={form.type} onChange={(e) => onTypeChange(e.target.value)} style={fieldStyle}>
            <option value="single">单选题</option>
            <option value="multiple">多选题</option>
            <option value="judge">判断题</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>分类</label>
          <select value={form.category} onChange={(e) => onChange({ ...form, category: e.target.value })} style={fieldStyle}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>难度</label>
          <select value={form.difficulty} onChange={(e) => onChange({ ...form, difficulty: e.target.value })} style={fieldStyle}>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>

      {/* Question text */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>题目</label>
        <textarea
          value={form.question}
          onChange={(e) => onChange({ ...form, question: e.target.value })}
          rows={3}
          style={{ ...fieldStyle, resize: 'vertical' }}
          placeholder="请输入题目内容"
        />
      </div>

      {/* Options */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>选项</label>
        {form.options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 20 }}>
              {String.fromCharCode(65 + idx)}.
            </span>
            <input
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              style={{ ...fieldStyle, flex: 1 }}
              placeholder={`选项 ${String.fromCharCode(65 + idx)}`}
            />
            {form.options.length > 2 && (
              <button
                className="btn btn-danger"
                style={{ fontSize: 11, padding: '4px 8px' }}
                onClick={() => removeOption(idx)}
              >
                删除
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 12px' }} onClick={addOption}>
          + 添加选项
        </button>
      </div>

      {/* Answer (varies by type) */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>正确答案</label>
        {form.type === 'judge' ? (
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="judge-answer"
                checked={form.answer === 0}
                onChange={() => onChange({ ...form, answer: 0 })}
              />
              正确
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="judge-answer"
                checked={form.answer === 1}
                onChange={() => onChange({ ...form, answer: 1 })}
              />
              错误
            </label>
          </div>
        ) : form.type === 'multiple' ? (
          <div>
            {form.options.map((opt, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={Array.isArray(form.answer) && form.answer.includes(idx)}
                  onChange={() => {
                    const arr = Array.isArray(form.answer) ? [...form.answer] : [];
                    const pos = arr.indexOf(idx);
                    if (pos >= 0) arr.splice(pos, 1);
                    else arr.push(idx);
                    arr.sort((a, b) => a - b);
                    onChange({ ...form, answer: arr });
                  }}
                />
                {String.fromCharCode(65 + idx)}. {opt || '(空)'}
              </label>
            ))}
          </div>
        ) : (
          <div>
            {form.options.map((opt, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio"
                  name="single-answer"
                  checked={form.answer === idx}
                  onChange={() => onChange({ ...form, answer: idx })}
                />
                {String.fromCharCode(65 + idx)}. {opt || '(空)'}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>解析</label>
        <textarea
          value={form.explanation}
          onChange={(e) => onChange({ ...form, explanation: e.target.value })}
          rows={3}
          style={{ ...fieldStyle, resize: 'vertical' }}
          placeholder="请输入答案解析"
        />
      </div>

      {/* Reference & URL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>参考资料</label>
          <input
            value={form.reference}
            onChange={(e) => onChange({ ...form, reference: e.target.value })}
            style={fieldStyle}
            placeholder="来源名称"
          />
        </div>
        <div>
          <label style={labelStyle}>参考链接</label>
          <input
            value={form.reference_url}
            onChange={(e) => onChange({ ...form, reference_url: e.target.value })}
            style={fieldStyle}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Knowledge ID */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>知识ID</label>
        <select
          value={form.knowledge_id || ''}
          onChange={(e) => onChange({ ...form, knowledge_id: e.target.value })}
          style={fieldStyle}
        >
          <option value="">-- 请选择 --</option>
          {KNOWLEDGE_IDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={onSubmit}>
          {isEditing ? '保存修改' : '添加题目'}
        </button>
        <button className="btn btn-back" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

// ---- Main Component ----

export default function AdminQuestions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customQuestions, setCustomQuestions] = useState(loadCustomQuestions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');

  const allQuestions = [...defaultQuestions, ...customQuestions];

  // Persist custom questions
  useEffect(() => {
    saveCustomQuestions(customQuestions);
  }, [customQuestions]);

  const handleAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (q) => {
    setForm({
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: [...q.options],
      answer: q.type === 'multiple' ? [...q.answer] : q.answer,
      explanation: q.explanation || '',
      reference: q.reference || '',
      reference_url: q.reference_url || '',
      knowledge_id: q.knowledge_id || '',
    });
    setEditingId(q.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = useCallback(() => {
    if (!form.question.trim()) {
      alert('请输入题目内容');
      return;
    }
    if (form.options.some((o) => !o.trim())) {
      alert('请填写所有选项');
      return;
    }
    if (form.type !== 'multiple' && (form.answer === null || form.answer === undefined)) {
      alert('请选择正确答案');
      return;
    }
    if (form.type === 'multiple' && (!Array.isArray(form.answer) || form.answer.length === 0)) {
      alert('请至少选择一个正确答案');
      return;
    }

    const questionData = {
      ...form,
      answer: form.type === 'multiple' ? [...form.answer] : form.answer,
    };

    let updated;
    if (editingId !== null) {
      updated = customQuestions.map((q) =>
        q.id === editingId ? { ...questionData, id: editingId } : q
      );
    } else {
      const newId = nextCustomId(customQuestions);
      updated = [...customQuestions, { ...questionData, id: newId }];
    }
    setCustomQuestions(updated);
    setShowForm(false);
    setEditingId(null);
  }, [form, editingId, customQuestions]);

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
    setDeleteConfirmId(null);
    if (editingId === id) {
      setShowForm(false);
      setEditingId(null);
    }
  };

  const handleBulkImport = () => {
    setBulkError('');
    if (!bulkText.trim()) {
      setBulkError('请粘贴 JSON 数据');
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(bulkText);
    } catch {
      setBulkError('JSON 格式错误，请检查');
      return;
    }
    if (!Array.isArray(parsed)) {
      setBulkError('请输入 JSON 数组');
      return;
    }

    let nextId = nextCustomId(customQuestions);
    const imported = parsed.map((item) => ({
      id: nextId++,
      type: item.type || 'single',
      category: item.category || CATEGORIES[0],
      difficulty: item.difficulty || 'easy',
      question: item.question || '',
      options: item.options || ['', '', '', ''],
      answer: item.answer ?? null,
      explanation: item.explanation || '',
      reference: item.reference || '',
      reference_url: item.reference_url || '',
      knowledge_id: item.knowledge_id || '',
    }));

    setCustomQuestions([...customQuestions, ...imported]);
    setBulkText('');
    setBulkOpen(false);
  };

  return (
    <div className="page-container">
      <button className="btn btn-back" onClick={() => navigate('/')}>
        ← 返回首页
      </button>

      <div style={{ maxWidth: 1100, margin: '20px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>题库管理</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => setBulkOpen(!bulkOpen)}>
              批量导入
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              + 新增题目
            </button>
          </div>
        </div>

        {/* Bulk import panel */}
        {bulkOpen && (
          <div className="setup-card" style={{ marginBottom: 20 }}>
            <h4 style={{ marginTop: 0 }}>批量导入题目</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              粘贴 JSON 数组，每个元素为题目对象。字段：type, category, difficulty, question, options, answer, explanation, reference, reference_url, knowledge_id
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontFamily: 'monospace',
                background: 'var(--bg)',
                color: 'var(--text)',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
              placeholder='[{"type":"single","category":"模具基础","difficulty":"easy","question":"...","options":["A","B","C","D"],"answer":0}]'
            />
            {bulkError && (
              <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{bulkError}</div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <button className="btn btn-accent" onClick={handleBulkImport}>确认导入</button>
              <button className="btn btn-back" onClick={() => { setBulkOpen(false); setBulkText(''); setBulkError(''); }}>取消</button>
            </div>
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <QuestionForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
            isEditing={editingId !== null}
          />
        )}

        {/* Questions table */}
        <div className="setup-card" style={{ overflowX: 'auto' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>
            共 {allQuestions.length} 道题目（内置 {defaultQuestions.length} 道 + 自定义 {customQuestions.length} 道）
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 13 }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 13 }}>标签</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 13 }}>题目</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 13 }}>答案</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 13 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {allQuestions.map((q) => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  isCustom={q.id >= 1000}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDeleteConfirm={handleDeleteConfirm}
                  confirmId={deleteConfirmId}
                  onCancelConfirm={() => setDeleteConfirmId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

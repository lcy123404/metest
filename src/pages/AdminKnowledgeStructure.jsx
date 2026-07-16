import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  AlertTriangle,
  Eye,
  FileText,
  FilePenLine,
  FilePlus2,
  FolderPlus,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import wikiSections from '../data/wiki';
import {
  createWikiNode,
  deleteWikiNode,
  importWikiMarkdown,
  loadWikiStructure,
  updateWikiNode,
} from '../services/wikiContent';
import { mergeWikiStructure } from '../utils/wikiStructure';
import { parseKnowledgeMarkdown } from '../utils/parseKnowledgeMarkdown';

const emptyForm = {
  mode: 'create',
  node_id: '',
  node_type: 'section',
  parent_id: '',
  title: '',
  description: '',
  summary: '',
  level: '基础',
  sort_order: 0,
  is_custom: true,
  is_hidden: false,
};

function nodePayload(node, changes = {}) {
  return {
    node_type: node.nodeType,
    parent_id: node.parentId || null,
    title: node.title,
    description: node.description || '',
    summary: node.summary || '',
    level: node.level || '基础',
    sort_order: node.sortOrder || 0,
    is_custom: Boolean(node.isCustom),
    is_hidden: false,
    ...changes,
  };
}

export default function AdminKnowledgeStructure() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importStatus, setImportStatus] = useState('draft');
  const [importing, setImporting] = useState(false);

  const structure = useMemo(() => mergeWikiStructure(wikiSections, records), [records]);
  const hiddenRecords = records.filter((record) => record.is_hidden);

  useEffect(() => {
    loadWikiStructure(true)
      .then(setRecords)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const replaceRecord = (record) => {
    setRecords((current) => {
      const exists = current.some((item) => item.node_id === record.node_id);
      return exists
        ? current.map((item) => item.node_id === record.node_id ? record : item)
        : [...current, record];
    });
  };

  const selectMarkdownFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/\.md$/i.test(file.name)) {
      setError('请选择 .md 格式的 Markdown 文件。');
      return;
    }
    if (file.size > 1200000) {
      setError('文件超过 1.2 MB，请拆分后导入。');
      return;
    }
    try {
      const parsed = parseKnowledgeMarkdown(await file.text(), file.name);
      const existingTitles = new Set(structure.sections.map((section) => section.title.trim()));
      const duplicateTitles = parsed.modules.filter((module) => existingTitles.has(module.title.trim())).map((module) => module.title);
      setImportPreview({
        ...parsed,
        fileName: file.name,
        warnings: [
          ...parsed.warnings,
          ...(duplicateTitles.length ? [`发现同名模块：${duplicateTitles.join('、')}。本次导入会创建新的模块，请确认后再继续。`] : []),
        ],
      });
      setError('');
    } catch (parseError) {
      setImportPreview(null);
      setError(parseError.message);
    }
  };

  const confirmMarkdownImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    setError('');
    try {
      const result = await importWikiMarkdown(importPreview.modules, importStatus);
      setRecords(await loadWikiStructure(true));
      setImportOpen(false);
      setImportPreview(null);
      setNotice(`Markdown 导入完成，共生成 ${result.nodes} 个目录节点。`);
    } catch (importError) {
      setError(importError.message);
    } finally {
      setImporting(false);
    }
  };

  const openCreate = (nodeType, parentId = '') => {
    const siblings = nodeType === 'section'
      ? structure.sections
      : structure.pages.filter((page) => page.parentId === parentId);
    setForm({
      ...emptyForm,
      node_type: nodeType,
      parent_id: parentId,
      sort_order: (siblings.at(-1)?.sortOrder || 0) + 1000,
    });
    setError('');
    setNotice('');
  };

  const openEdit = (node, nodeType) => {
    setForm({
      mode: 'edit',
      node_id: node.id,
      node_type: nodeType,
      parent_id: nodeType === 'page' ? node.parentId : '',
      title: node.title,
      description: node.description || '',
      summary: node.summary || '',
      level: node.level || '基础',
      sort_order: node.sortOrder || 0,
      is_custom: Boolean(node.isCustom),
      is_hidden: false,
    });
    setError('');
    setNotice('');
  };

  const saveForm = async () => {
    if (!form.title.trim()) {
      setError('请填写标题。');
      return;
    }
    if (form.node_type === 'page' && !form.parent_id) {
      setError('请选择上级模块或知识页。');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, title: form.title.trim() };
      const saved = form.mode === 'create'
        ? await createWikiNode(payload)
        : await updateWikiNode(form.node_id, payload);
      replaceRecord(saved);
      setNotice(form.mode === 'create' ? '节点已创建，可继续前往内容管理编写正文。' : '目录信息已更新。');
      setForm(null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const hideNode = async (node, nodeType) => {
    if (!window.confirm(`确定删除“${node.title}”吗？内置节点删除后可在“已删除项目”中恢复。`)) return;
    setSaving(true);
    try {
      const saved = await updateWikiNode(node.id, nodePayload({ ...node, nodeType }, { is_hidden: true }));
      replaceRecord(saved);
      setNotice('内置节点已删除，可在“已删除项目”中恢复。');
    } catch (hideError) {
      setError(hideError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCustomNode = async (node) => {
    if (!window.confirm(`确定永久删除“${node.title}”及其下级内容吗？此操作不可撤销。`)) return;
    setSaving(true);
    try {
      const result = await deleteWikiNode(node.id);
      const deleted = new Set(result.deleted || [node.id]);
      setRecords((current) => current.filter((item) => !deleted.has(item.node_id)));
      setNotice('自定义节点已删除。');
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  };

  const restoreNode = async (record) => {
    setSaving(true);
    try {
      const saved = await updateWikiNode(record.node_id, {
        node_type: record.node_type,
        parent_id: record.parent_id,
        title: record.title,
        description: record.description,
        summary: record.summary,
        level: record.level,
        sort_order: record.sort_order,
        is_custom: Boolean(record.is_custom),
        is_hidden: false,
      });
      replaceRecord(saved);
      setNotice('节点已恢复显示。');
    } catch (restoreError) {
      setError(restoreError.message);
    } finally {
      setSaving(false);
    }
  };

  const moveNode = async (node, siblings, direction, nodeType) => {
    const index = siblings.findIndex((item) => item.id === node.id);
    const target = siblings[index + direction];
    if (!target) return;
    setSaving(true);
    try {
      const [savedNode, savedTarget] = await Promise.all([
        updateWikiNode(node.id, nodePayload({ ...node, nodeType }, { sort_order: target.sortOrder })),
        updateWikiNode(target.id, nodePayload({ ...target, nodeType }, { sort_order: node.sortOrder })),
      ]);
      replaceRecord(savedNode);
      replaceRecord(savedTarget);
    } catch (moveError) {
      setError(moveError.message);
    } finally {
      setSaving(false);
    }
  };

  const renderActions = (node, siblings, nodeType) => (
    <div className="structure-node-actions">
      {nodeType === 'section' && <button title="新增知识页" onClick={() => openCreate('page', node.id)}><FilePlus2 size={14} /></button>}
      {nodeType === 'page' && !node.parentTitle && <button title="新增三级知识页" onClick={() => openCreate('page', node.id)}><FilePlus2 size={14} /></button>}
      <button title="上移" disabled={siblings[0]?.id === node.id || saving} onClick={() => moveNode(node, siblings, -1, nodeType)}><ArrowUp size={14} /></button>
      <button title="下移" disabled={siblings.at(-1)?.id === node.id || saving} onClick={() => moveNode(node, siblings, 1, nodeType)}><ArrowDown size={14} /></button>
      <button title="修改标题与信息" onClick={() => openEdit(node, nodeType)}><Pencil size={14} /></button>
      {nodeType === 'page' && <Link title="编辑正文" to={`/admin/knowledge?page=${node.id}`}><FilePenLine size={14} /></Link>}
      <button title={nodeType === 'section' ? '删除模块' : '删除知识页'} onClick={() => node.isCustom ? removeCustomNode(node) : hideNode(node, nodeType)}>
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="structure-admin">
      <header className="structure-admin-head">
        <div>
          <Link to="/admin/knowledge"><ArrowLeft size={15} />返回内容编辑</Link>
          <h1>知识库目录管理</h1>
          <p>管理一级模块、二级知识页与三级课程页。内置节点删除后会进入“已删除项目”，可以恢复。</p>
        </div>
        <div className="structure-admin-head-actions">
          <button className="secondary" onClick={() => { setImportOpen(true); setImportPreview(null); setError(''); }}><Upload size={16} />导入 Markdown</button>
          <button onClick={() => openCreate('section')}><FolderPlus size={16} />新增模块</button>
        </div>
      </header>

      <div className="structure-admin-layout">
        <main className="structure-tree-editor">
          {structure.sections.map((section) => (
            <section className="structure-section-row" key={section.id}>
              <div className="structure-section-title">
                <div><strong>{section.title}</strong><span>{section.description || '暂无模块说明'}</span></div>
                {renderActions(section, structure.sections, 'section')}
              </div>
              <div className="structure-page-rows">
                {section.pages.map((page) => {
                  const rootSiblings = section.pages;
                  return (
                    <div className="structure-page-group" key={page.id}>
                      <div className="structure-page-row">
                        <div><strong>{page.title}</strong><span>{page.summary || '暂无摘要'}</span></div>
                        {renderActions(page, rootSiblings, 'page')}
                      </div>
                      {page.children.map((child) => (
                        <div className="structure-page-row child" key={child.id}>
                          <div><strong>{child.title}</strong><span>{child.summary || '暂无摘要'}</span></div>
                          {renderActions(child, page.children, 'page')}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {!section.pages.length && <p className="structure-empty">该模块还没有知识页。</p>}
              </div>
            </section>
          ))}

          {hiddenRecords.length > 0 && (
            <section className="structure-hidden">
              <h2>已删除项目</h2>
              {hiddenRecords.map((record) => (
                <div key={record.node_id}>
                  <span>{record.title}</span>
                  <button onClick={() => restoreNode(record)}><Eye size={14} />恢复</button>
                </div>
              ))}
            </section>
          )}
        </main>

        <aside className="structure-form-panel">
          {form ? (
            <>
              <div className="structure-form-head">
                <div><span>{form.mode === 'create' ? 'NEW NODE' : 'EDIT NODE'}</span><h2>{form.mode === 'create' ? '新增目录节点' : '编辑目录节点'}</h2></div>
                <button title="关闭" onClick={() => setForm(null)}><X size={17} /></button>
              </div>
              <label><span>节点类型</span><input value={form.node_type === 'section' ? '一级模块' : '知识页'} disabled /></label>
              {form.node_type === 'page' && (
                <label>
                  <span>上级节点</span>
                  <select value={form.parent_id} onChange={(event) => setForm({ ...form, parent_id: event.target.value })}>
                    <option value="">请选择</option>
                    {structure.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                    {structure.pages.filter((page) => !page.parentTitle && page.id !== form.node_id).map((page) => (
                      <option key={page.id} value={page.id}>　{page.title}</option>
                    ))}
                  </select>
                </label>
              )}
              <label><span>标题</span><input value={form.title} maxLength={120} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              {form.node_type === 'section' ? (
                <label><span>模块说明</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              ) : (
                <>
                  <label><span>页面摘要</span><textarea rows={4} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></label>
                  <label><span>学习级别</span><select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}><option>基础</option><option>核心</option><option>进阶</option></select></label>
                </>
              )}
              <button className="structure-save" disabled={saving} onClick={saveForm}>{saving ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}保存目录</button>
            </>
          ) : (
            <div className="structure-form-placeholder"><FolderPlus size={24} /><h2>选择一个操作</h2><p>可以修改标题、新增模块或在现有模块下创建知识页。</p></div>
          )}
          {(error || notice) && <div className={`knowledge-editor-message ${error ? 'error' : 'success'}`}>{error || notice}</div>}
          {loading && <div className="knowledge-editor-loading"><LoaderCircle className="spin" size={18} />正在读取目录</div>}
        </aside>
      </div>

      {importOpen && (
        <div className="markdown-import-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !importing) setImportOpen(false);
        }}>
          <section className="markdown-import-dialog" role="dialog" aria-modal="true" aria-labelledby="markdown-import-title">
            <header>
              <div><span>MARKDOWN IMPORT</span><h2 id="markdown-import-title">从 Markdown 生成知识目录</h2></div>
              <button title="关闭" disabled={importing} onClick={() => setImportOpen(false)}><X size={18} /></button>
            </header>

            {!importPreview ? (
              <label className="markdown-file-picker">
                <FileText size={28} />
                <strong>选择 Markdown 文件</strong>
                <span>自动识别 # 标题层级，以及 3.1、3.1.1 等编号</span>
                <input type="file" accept=".md,text/markdown" onChange={selectMarkdownFile} />
              </label>
            ) : (
              <>
                <div className="markdown-import-summary">
                  <div><span>文件</span><strong>{importPreview.fileName}</strong></div>
                  <div><span>一级模块</span><strong>{importPreview.stats.modules}</strong></div>
                  <div><span>二级页面</span><strong>{importPreview.stats.pages}</strong></div>
                  <div><span>三级页面</span><strong>{importPreview.stats.children}</strong></div>
                </div>

                {importPreview.warnings.length > 0 && (
                  <div className="markdown-import-warnings">
                    <AlertTriangle size={16} />
                    <div>{importPreview.warnings.map((warning, index) => <p key={`${warning}-${index}`}>{warning}</p>)}</div>
                  </div>
                )}

                <div className="markdown-import-tree">
                  {importPreview.modules.map((module, moduleIndex) => (
                    <section key={`${module.title}-${moduleIndex}`}>
                      <h3>{module.title}</h3>
                      {module.pages.map((page, pageIndex) => (
                        <div key={`${page.title}-${pageIndex}`}>
                          <strong>{page.title}</strong>
                          {page.children.map((child, childIndex) => <span key={`${child.title}-${childIndex}`}>{child.title}</span>)}
                        </div>
                      ))}
                    </section>
                  ))}
                </div>

                <div className="markdown-import-options">
                  <span>正文状态</span>
                  <div>
                    <button className={importStatus === 'draft' ? 'active' : ''} onClick={() => setImportStatus('draft')}>保存为草稿</button>
                    <button className={importStatus === 'published' ? 'active' : ''} onClick={() => setImportStatus('published')}>直接发布</button>
                  </div>
                </div>
              </>
            )}

            {error && <div className="markdown-import-error">{error}</div>}
            <footer>
              {importPreview && <label><FileText size={14} />重新选择<input type="file" accept=".md,text/markdown" onChange={selectMarkdownFile} /></label>}
              <div>
                <button className="cancel" disabled={importing} onClick={() => setImportOpen(false)}>取消</button>
                <button className="confirm" disabled={!importPreview || importing} onClick={confirmMarkdownImport}>
                  {importing ? <LoaderCircle className="spin" size={15} /> : <Upload size={15} />}确认导入
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

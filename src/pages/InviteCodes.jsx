import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateCodes, listCodes, toggleCode, deleteCode, validateCode } from '../utils/inviteCodes';

export default function InviteCodes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genCount, setGenCount] = useState(1);
  const [maxUses, setMaxUses] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const data = await listCodes();
      setCodes(data);
    } catch (e) {
      setError('加载失败：' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCodes(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const newCodes = await generateCodes(genCount, maxUses, user?.email || 'admin');
      setGeneratedCodes(newCodes);
      await loadCodes();
    } catch (e) {
      setError('生成失败：' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await toggleCode(id, !current);
      await loadCodes();
    } catch (e) {
      setError('操作失败：' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该邀请码？未使用的码将永久失效。')) return;
    try {
      await deleteCode(id);
      await loadCodes();
    } catch (e) {
      setError('删除失败：' + e.message);
    }
  };

  const activeCodes = codes.filter(c => c.is_active && (c.max_uses === 0 || c.used_count < c.max_uses));
  const usedCodes = codes.filter(c => !c.is_active || (c.max_uses > 0 && c.used_count >= c.max_uses));

  if (!user) {
    return (
      <div className="page-container">
        <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>
        <div className="login-prompt" style={{ padding: '48px 20px' }}>
          <h2>需要登录</h2>
          <p>邀请码管理需要管理员权限</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>去登录</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>邀请码管理</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
        生成和管理注册邀请码。将邀请码分发给需要注册的用户。
      </p>

      {/* 生成区域 */}
      <div className="setup-card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>生成新邀请码</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>生成数量</label>
            <input
              type="number"
              className="form-input"
              style={{ width: 80 }}
              min="1"
              max="100"
              value={genCount}
              onChange={e => setGenCount(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>每个可用次数</label>
            <select className="form-select" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value))}>
              <option value={1}>1 次（一次性）</option>
              <option value={5}>5 次</option>
              <option value={10}>10 次</option>
              <option value={50}>50 次</option>
              <option value={0}>无限次</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? '生成中...' : `生成 ${genCount} 个邀请码`}
          </button>
        </div>

        {generatedCodes.length > 0 && (
          <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <h4 style={{ fontSize: 14, marginBottom: 8, color: '#166534' }}>新生成的邀请码（请立即复制保存）</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {generatedCodes.map((code, i) => (
                <code key={i} style={{
                  padding: '6px 14px',
                  background: '#fff',
                  border: '1px solid #86efac',
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  color: '#166534',
                }}>
                  {code}
                </code>
              ))}
            </div>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => {
                navigator.clipboard.writeText(generatedCodes.join('\n'));
                alert('已复制到剪贴板');
              }}
            >
              一键复制全部
            </button>
          </div>
        )}

        {error && <div className="form-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* 邀请码列表 */}
      <div className="setup-card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          邀请码列表（{codes.length} 个，{activeCodes.length} 个可用）
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-tertiary)', padding: 20 }}>加载中...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>邀请码</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>已用/总量</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>状态</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>创建时间</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', opacity: c.is_active ? 1 : 0.5 }}>
                    <td style={{ padding: '10px 8px' }}>
                      <code style={{
                        fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: 2,
                        background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4,
                      }}>
                        {c.code}
                      </code>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ color: c.used_count >= c.max_uses && c.max_uses > 0 ? '#ef4444' : 'var(--text)' }}>
                        {c.used_count}/{c.max_uses || '∞'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {c.is_active && (c.max_uses === 0 || c.used_count < c.max_uses)
                        ? <span style={{ color: '#22c55e', fontWeight: 600 }}>可用</span>
                        : <span style={{ color: '#ef4444' }}>{c.is_active ? '用完' : '停用'}</span>}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {new Date(c.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggle(c.id, c.is_active)} style={{ marginRight: 6 }}>
                        {c.is_active ? '停用' : '启用'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>删除</button>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      暂无邀请码，请先生成
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

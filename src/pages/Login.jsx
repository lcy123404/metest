import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(email, password);
        setSuccessMsg('注册成功！如需真实认证，请配置 Supabase。');
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      if (err?.message?.includes('not configured') || err?.message?.includes('supabaseUrl')) {
        setError('Supabase 未配置，当前为演示模式。如需真实认证，请配置 Supabase 环境变量。');
      } else {
        setError(err?.message || (isRegister ? '注册失败，请重试' : '登录失败，请检查邮箱和密码'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <button className="btn btn-back" onClick={() => navigate('/')}>
        ← 返回首页
      </button>

      <div className="setup-card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          {isRegister ? '注册账号' : '登录'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                fontSize: 14,
                background: 'var(--bg)',
                color: 'var(--text)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码（至少6位）"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                fontSize: 14,
                background: 'var(--bg)',
                color: 'var(--text)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  fontSize: 14,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(220, 53, 69, 0.1)',
              color: 'var(--danger)',
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              marginBottom: 16,
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(40, 167, 69, 0.1)',
              color: '#28a745',
              padding: '10px 12px',
              borderRadius: 'var(--radius)',
              marginBottom: 16,
              fontSize: 13,
            }}>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {submitting ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            style={{ fontSize: 13 }}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 12,
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: 'var(--radius)',
        }}>
          提示：当前为演示模式。如需真实用户认证功能，请在项目根目录配置 Supabase 环境变量 (REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY)。
        </div>
      </div>
    </div>
  );
}

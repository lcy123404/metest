import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo-user-local',
  email: 'demo@structure-quiz.local',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_USER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // 尝试获取 session，失败则静默忽略（CORS/网络问题）
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setUser(session?.user ?? DEMO_USER);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Supabase 连接失败（CORS/网络），登录功能暂不可用', err.message);
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? DEMO_USER);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(DEMO_USER);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

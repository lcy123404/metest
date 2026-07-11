import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import LearnMode from './pages/LearnMode';
import ExamMode from './pages/ExamMode';
import Result from './pages/Result';
import WrongBook from './pages/WrongBook';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminQuestions from './pages/AdminQuestions';
import './App.css';

function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <h1>🔧 产品结构设计 · 面试刷题</h1>
          <span className="app-subtitle">塑胶 · 钣金 · 压铸 · 型材</span>
        </Link>
        <div className="header-actions">
          {user ? (
            <div className="header-user">
              <Link to="/profile" className="btn btn-header">
                👤 {user.email?.split('@')[0]}
              </Link>
              <button className="btn btn-header" onClick={signOut}>
                退出
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-header">
              🔑 登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<LearnMode />} />
              <Route path="/exam" element={<ExamMode />} />
              <Route path="/result" element={<Result />} />
              <Route path="/wrong-book" element={<WrongBook />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

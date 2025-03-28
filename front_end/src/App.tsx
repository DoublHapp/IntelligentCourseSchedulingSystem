import './App.css'
//添加路由导航
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//添加登录页面
import LoginPage from './pages/Login/Login';
//添加控制面板(主要功能)页面

import Dashboard from './pages/Dashboard/Dashboard';

function App() {

  return (

    <div className="app-container">
      {/* 添加路由导航 */}
      <Router>
        <Routes>
          
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>

  )
}


// 欢迎页组件
function WelcomePage() {
  return (
    <div className="welcome-container">
      <h1>智能排课系统</h1>
      <p>欢迎使用智能排课系统，请点击下方按钮登录</p>
      <Link to="/login" className="login-link-button">
        进入登录页面
      </Link>
    </div>
  );
}

export default App

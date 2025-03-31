import './App.css'
//添加路由导航
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//添加登录页面
import LoginPage from './pages/Login/Login';
//添加控制面板(主要功能)页面
import Dashboard from './pages/DashBoard/DashBoard';
//添加手动排课页面
import ManualScheduling from './pages/ManualScheduling/ManualScheduling';
//添加排课结果页面
import ScheduleResult from './pages/ScheduleResult/ScheduleResult';
//添加教室管理页面
import ClassroomManagement from './pages/ClassroomManagement/ClassroomManagement';
//添加课程管理页面
import CourseManagement from './pages/CourseManagement/CourseManagement';
//添加教师管理页面
import TeacherManagement from './pages/TeacherManagement/TeacherManagement';
//添加用户管理页面
import UserManagement from './pages/UserManagement/UserManagement';
//添加部门管理页面
import DepartmentManagement from './pages/DepartmentManagement/DepartmentManagement';
//添加个性化申请页面
import PersonalizedRequest from './pages/PersonalizedRequest/PersonalizedRequest';
//添加排课结果分析页面
import ScheduleResultAnalysis from './pages/ScheduleResultAnalysis/ScheduleResultAnalysis';



function App() {

  return (

    <div className="app-container">
      {/* 添加路由导航 */}
      <Router>
        <Routes>

          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manual-scheduling" element={<ManualScheduling />} />
          <Route path="/schedule-result" element={<ScheduleResult />} />
          <Route path="/classroom-management" element={<ClassroomManagement />} />
          <Route path="/course-management" element={<CourseManagement />} />
          <Route path="/teacher-management" element={<TeacherManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/department-management" element={<DepartmentManagement />} />
          <Route path="/personalized-request" element={<PersonalizedRequest />} />
          <Route path="/schedule-result-analysis" element={<ScheduleResultAnalysis />} />
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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';

const Dashboard = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // 检查用户是否已登录
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        
        const user = JSON.parse(userStr);
        if (user.userIdentity !== 'administrator') {
            navigate('/login');
        }
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };
    
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>控制面板</h1>
                <button onClick={handleLogout} className="logout-button">退出登录</button>
            </header>
            <main className="dashboard-content">
                <h2>欢迎使用智能排课系统管理界面</h2>
                <p>在这里您可以管理课程、教师、教室等资源</p>
                
                <div className="dashboard-menu">
                    <div className="menu-item">
                        <h3>部门管理</h3>
                        <p>管理学院和系部信息</p>
                    </div>
                    <div className="menu-item">
                        <h3>教师管理</h3>
                        <p>管理教师信息和授课安排</p>
                    </div>
                    <div className="menu-item">
                        <h3>课程管理</h3>
                        <p>管理课程信息和教学计划</p>
                    </div>
                    <div className="menu-item">
                        <h3>教室管理</h3>
                        <p>管理教学楼和教室资源</p>
                    </div>
                    <div className="menu-item">
                        <h3>排课任务</h3>
                        <p>创建和管理排课任务</p>
                    </div>
                    <div className="menu-item">
                        <h3>用户管理</h3>
                        <p>管理系统用户和权限</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';


interface User {
    id: number;
    username: string;
    userIdentity: string;
  }

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        // 检查用户是否已登录
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        // 解析用户数据
        // 如果解析失败，清除localStorage中的用户数据并跳转到登录页面
        try {
            const userData = JSON.parse(userStr);
            setUser(userData);
        } catch (error) {
            console.error('用户数据解析错误:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);
    
    // 处理退出登录
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };
    // 处理跳转到手动排课页面
    const navigateToManualScheduling = () => {
        navigate('/manual-scheduling');
    };

    if (!user) {
        return <div className="loading">加载中...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>控制面板-{user.username}({user.userIdentity==='administrator'?'管理员':user.userIdentity==='teacher'?'教师':'学生'})</h1>

                <button onClick={handleLogout} className="logout-button">退出登录</button>
            </header>
            <main className="dashboard-content">
                <h2>欢迎使用智能排课系统管理界面</h2>
                <p>在这里您可以管理课程、教师、教室等资源</p>
                
                <div className="dashboard-menu">
                    {/* 根据用户身份显示不同的菜单项 */}
                    {user.userIdentity === 'administrator' && (
                        <>
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
                            <div 
                                className="menu-item highlight"
                                onClick={navigateToManualScheduling}
                            >
                                <h3>手动排课</h3>
                                <p>手动安排课程时间与教室</p>
                            </div>
                            <div className="menu-item">
                                <h3>自动排课</h3>
                                <p>使用算法自动生成课表</p>
                            </div>
                            <div className="menu-item">
                                <h3>用户管理</h3>
                                <p>管理系统用户和权限</p>
                            </div>
                        </>
                    )}

                       {user.userIdentity === 'teacher' && (
                        <>
                            <div className="menu-item">
                                <h3>我的课表</h3>
                                <p>查看个人教学安排</p>
                            </div>
                            <div className="menu-item">
                                <h3>我的课程</h3>
                                <p>管理教授的课程</p>
                            </div>
                            <div 
                                className="menu-item highlight"
                                onClick={navigateToManualScheduling}
                            >
                                <h3>课程排期</h3>
                                <p>调整课程时间安排</p>
                            </div>
                        </>
                    )}

                        {user.userIdentity === 'student' && (
                        <>
                            <div className="menu-item">
                                <h3>我的课表</h3>
                                <p>查看个人课表安排</p>
                            </div>
                            <div className="menu-item">
                                <h3>选修课程</h3>
                                <p>选择选修课程</p>
                            </div>
                        </>
                    )}


                    
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
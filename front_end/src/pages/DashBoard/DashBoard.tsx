import { useState, useEffect } from 'react';
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
    //处理自动排课
    const generateSchedule = () => {
        // TODO:待测试
        fetch('http://localhost:8080/api/assignments/generate', {
            method: 'GET',
        }).then((response) => {
            if (!response.ok) {
                alert('课表生成失败！：' + response.statusText);
            }
            else alert('课表生成成功！');
            console.log(response);
            const data = response.json();
            console.log(data);
        })
    }
    // 处理跳转到排课结果页面
    const navigateToScheduleResult = () => {
        navigate('/schedule-result');
    };

    //处理跳转到教室管理页面
    const navigateToClassroomManagement = () => {
        navigate('/classroom-management');
    };

    //处理跳转到课程管理页面
    const navigateToCourseManagement = () => {
        navigate('/course-management');
    };
    //处理跳转到教师管理页面
    const navigateToTeacherManagement = () => {
        navigate('/teacher-management');
    };
    //处理跳转到用户管理页面
    const navigateToUserManagement = () => {
        navigate('/user-management');
    };
    //处理跳转到部门管理页面
    const navigateToDepartmentManagement = () => {
        navigate('/department-management');
    };

    //处理跳转到个性化申请页面
    const navigateToPersonalizedRequest = () => {
        navigate('/personalized-request');
    }

    //处理跳转到排课结果分析页面
    const navigateToScheduleResultAnalysis = () => {
        navigate('/schedule-result-analysis');
    }

    if (!user) {
        return <div className="loading">加载中...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>控制面板-{user.username}({user.userIdentity === 'administrator' ? '管理员' : user.userIdentity === 'teacher' ? '教师' : '学生'})</h1>

                <button onClick={handleLogout} className="logout-button">退出登录</button>
            </header>
            <main className="dashboard-content">
                <h2>欢迎使用智能排课系统功能界面</h2>
                <p>在这里您可以使用查看排课结果、导出课表等功能</p>

                <div className="dashboard-menu">
                    {/* 根据用户身份显示不同的菜单项 */}
                    {user.userIdentity === 'administrator' && (
                        <>
                            <div className="menu-item"
                                onClick={navigateToDepartmentManagement}
                            >
                                <h3>部门管理</h3>
                                <p>管理学院和系部信息</p>
                            </div>
                            <div className="menu-item"
                                onClick={navigateToTeacherManagement}
                            >
                                <h3>教师管理</h3>
                                <p>管理教师信息和授课安排</p>
                            </div>
                            <div className="menu-item"
                                onClick={navigateToCourseManagement}
                            >
                                <h3>课程管理</h3>
                                <p>管理课程信息和教学计划</p>
                            </div>
                            <div className="menu-item"
                                onClick={navigateToClassroomManagement}
                            >
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
                            <div
                                className="menu-item"
                                onClick={generateSchedule}>
                                <h3>自动排课</h3>
                                <p>使用算法自动生成课表</p>
                            </div>
                            <div className="menu-item highlight"
                                onClick={navigateToScheduleResult}
                            >
                                <h3>排课结果</h3>
                                <p>查看课表安排结果</p>
                            </div>

                            <div className="menu-item highlight"
                                onClick={navigateToScheduleResultAnalysis}
                            >
                                <h3>排课结果分析</h3>
                                <p>深度分析排课结果数据与资源利用情况</p>
                            </div>
                            <div className="menu-item"
                                onClick={navigateToUserManagement}
                            >
                                <h3>用户管理</h3>
                                <p>管理系统用户和权限</p>
                            </div>
                        </>
                    )}

                    {user.userIdentity === 'teacher' && (
                        <>

                            <div
                                className="menu-item highlight"
                                onClick={navigateToPersonalizedRequest}
                            >
                                <h3>个性化申请</h3>
                                <p>申请调整课程时间等安排</p>
                            </div>

                            <div className="menu-item highlight"
                                onClick={navigateToScheduleResult}
                            >
                                <h3>排课结果</h3>
                                <p>查看课表安排结果</p>
                            </div>
                        </>
                    )}

                    {user.userIdentity === 'student' && (
                        <>
                            <div className="menu-item hightlight"
                                onClick={navigateToScheduleResult}>
                                <h3>排课结果</h3>
                                <p>查看课表安排结果</p>
                            </div>
                            <div className="menu-item highlight"
                                onClick={navigateToPersonalizedRequest}
                            >
                                <h3>个性化申请</h3>
                                <p>申请调整课程时间等安排</p>
                            </div>
                        </>
                    )}



                </div>
            </main>
        </div>
    );
};

export default Dashboard;
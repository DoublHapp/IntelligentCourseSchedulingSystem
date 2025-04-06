import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.scss';

// 定义用户角色类型
type UserRole = 'student' | 'teacher' | 'administrator';

// 定义后端API返回的用户数据类型
interface UserData {
    id: number;
    username: string;
    userIdentity: string;
}

// 定义登录响应类型
interface LoginResponse {
    success: boolean;
    message: string;
    user: UserData | null;
}

const LoginForm = () => {
    const navigate = useNavigate();
    // 状态管理
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 表单提交处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 表单验证
        if (!username.trim() || !password.trim()) {
            setError('请输入用户名和密码');
            return;
        }

        // 清除错误信息
        setError('');
        setIsLoading(true);

        try {
            // 调用后端登录API
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    userIdentity: role,
                }),
            });

            const data = await response.json();

            if (data.success && data.data) {
                // 登录成功，保存用户信息到本地存储
                localStorage.setItem('user', JSON.stringify(data.data));

                // 都导航到Dashboard页面
                navigate('/dashboard');
            } else {
                setError(data.message || '登录失败，请检查您的凭据');
            }
        } catch (err) {
            setError('登录过程中发生错误，请确保后端服务已启动');
            console.error('登录错误:', err);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="login-form-container">
            <div className="login-form">
                <h2>智能排课系统</h2>
                <h3>用户登录</h3>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role">用户角色</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="form-control"
                            disabled={isLoading}
                        >
                            <option value="student">学生</option>
                            <option value="teacher">教师</option>
                            <option value="administrator">管理员</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="请输入用户名"
                            className="form-control"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            className="form-control"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? '登录中...' : '登录'}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default LoginForm;
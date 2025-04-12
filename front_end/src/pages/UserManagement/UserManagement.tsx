import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.scss';

// 用户类型定义，与后端User实体保持一致
interface User {
  id: number;
  username: string;
  password?: string; // 在前端显示时不会包含密码
  userIdentity: string; // 'administrator', 'teacher', 'student'
  createdAt?: string;
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIdentity, setSelectedUserIdentity] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 添加控制用户列表显示的状态
  const [showUserList, setShowUserList] = useState(true);
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    password: '',
    userIdentity: 'student'
  });

  // 验证用户登录状态
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setCurrentUser(userData);
      
      // 只有管理员可以访问用户管理页面
      if (userData.userIdentity !== 'administrator') {
        navigate('/dashboard');
        return;
      }
      
      // 加载数据
      fetchData();
    } catch (error) {
      console.error('用户数据解析错误:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // 获取用户数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result: ApiResponse<User[]> = await response.json();
      
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || '获取用户数据失败');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(`加载数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setLoading(false);
    }
  };

  // 根据搜索条件和选中的用户类型筛选用户
  const filteredUsers = users.filter(user => {
    const matchesUserIdentity = selectedUserIdentity ? user.userIdentity === selectedUserIdentity : true;
    const matchesSearch = searchTerm 
      ? user.username.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesUserIdentity && matchesSearch;
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 切换用户列表显示状态
  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  // 选择用户进行编辑
  const handleEditUser = async (user: User) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/users/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result: ApiResponse<User> = await response.json();
      
      if (result.success && result.data) {
        setSelectedUser(user);
        setFormData({
          username: result.data.username,
          password: '', // 不回显密码，用户可以重设
          userIdentity: result.data.userIdentity
        });
        setIsEditMode(true);
        setIsAddMode(false);
        setError(null);
        // 隐藏用户列表
        setShowUserList(false);
      } else {
        throw new Error(result.message || '获取用户详情失败');
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
      setError(`获取用户详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 准备添加新用户
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      userIdentity: 'student'
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setError(null);
    // 隐藏用户列表
    setShowUserList(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      userIdentity: 'student'
    });
    setError(null);
    // 显示用户列表
    setShowUserList(true);
  };

  // 保存用户信息
  const handleSaveUser = async () => {
    if (!formData.username) {
      setError('用户名不能为空');
      return;
    }

    if (isAddMode && !formData.password) {
      setError('密码不能为空');
      return;
    }

    try {
      const userData = {
        ...formData
      };

      let url: string;
      let method: string;

      if (isEditMode && selectedUser) {
        // 更新现有用户
        url = `http://localhost:8080/api/auth/users/${selectedUser.id}`;
        method = 'PUT';
      } else {
        // 创建新用户
        url = 'http://localhost:8080/api/auth/register';
        method = 'POST';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 成功保存后，重新获取最新的用户列表
        await fetchData();
        setError(null);
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedUser(null);
        // 显示用户列表
        setShowUserList(true);
      } else {
        setError(result.message || (isEditMode ? '更新用户失败' : '创建用户失败'));
      }
    } catch (error) {
      console.error(isEditMode ? '更新用户失败:' : '创建用户失败:', error);
      setError(`${isEditMode ? '更新' : '创建'}用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    // 不允许删除自己
    if (user.id === currentUser.id) {
      setError('不能删除当前登录的用户账号');
      return;
    }
    
    // 确保至少保留一个管理员账号
    const adminCount = users.filter(u => u.userIdentity === 'administrator').length;
    if (user.userIdentity === 'administrator' && adminCount <= 1) {
      setError('系统必须至少保留一个管理员账号');
      return;
    }

    if (window.confirm(`确定要删除用户 ${user.username} 吗？`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/users/${user.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // 成功删除后，重新获取最新的用户列表
          await fetchData();

          if (selectedUser && selectedUser.id === user.id) {
            setSelectedUser(null);
            setIsEditMode(false);
          }
        } else {
          throw new Error(result.message || '删除用户失败');
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        setError(`删除用户失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 切换密码显示/隐藏
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 生成随机密码
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({
      ...formData,
      password
    });
  };

  // 格式化创建时间
  const formatCreatedAt = (dateTime?: string) => {
    if (!dateTime) return '未知';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateTime;
    }
  };

  return (
    <div className="user-management">
      <header className="user-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>用户管理</h1>
        </div>
      </header>

      <div className="user-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="management-container">
              <div className="sidebar">
                <div className="user-type-filter">
                  <h3>用户类型</h3>
                  <ul className="user-type-list">
                    <li 
                      className={selectedUserIdentity === null ? 'active' : ''}
                      onClick={() => setSelectedUserIdentity(null)}
                    >
                      全部用户
                    </li>
                    <li 
                      className={selectedUserIdentity === 'administrator' ? 'active' : ''}
                      onClick={() => setSelectedUserIdentity('administrator')}
                    >
                      管理员
                    </li>
                    <li 
                      className={selectedUserIdentity === 'teacher' ? 'active' : ''}
                      onClick={() => setSelectedUserIdentity('teacher')}
                    >
                      教师
                    </li>
                    <li 
                      className={selectedUserIdentity === 'student' ? 'active' : ''}
                      onClick={() => setSelectedUserIdentity('student')}
                    >
                      学生
                    </li>
                  </ul>
                </div>
                
                <div className="actions">
                  <button className="add-button" onClick={handleAddUser}>
                    添加新用户
                  </button>
                  {(isEditMode || isAddMode) && !showUserList && (
                    <button
                      className="show-list-button"
                      onClick={() => setShowUserList(true)}
                    >
                      显示用户列表
                    </button>
                  )}
                </div>
              </div>

              <div className="main-content">
                {/* 只在需要显示列表时渲染 */}
                {showUserList && (
                  <>
                    <div className="search-bar">
                      <input 
                        type="text" 
                        placeholder="搜索用户名..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="users-list">
                      <h2>
                        {selectedUserIdentity 
                          ? `${selectedUserIdentity === 'administrator' ? '管理员' : selectedUserIdentity === 'teacher' ? '教师' : '学生'}用户列表` 
                          : '所有用户'}
                      </h2>
                      
                      {filteredUsers.length === 0 ? (
                        <div className="no-users">暂无用户信息</div>
                      ) : (
                        <table className="users-table">
                          <thead>
                            <tr>
                              <th>用户名</th>
                              <th>用户类型</th>
                              <th>创建时间</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map(user => (
                              <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>
                                  {user.userIdentity === 'administrator' && '管理员'}
                                  {user.userIdentity === 'teacher' && '教师'}
                                  {user.userIdentity === 'student' && '学生'}
                                </td>
                                <td>{formatCreatedAt(user.createdAt)}</td>
                                <td className="actions-cell">
                                  <button 
                                    className="edit-button"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    编辑
                                  </button>
                                  <button 
                                    className="delete-button"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    删除
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}

                {(isEditMode || isAddMode) && (
                  <div className={`user-form ${showUserList ? 'with-list' : 'no-list'}`}>
                    <div className="form-header">
                      <h3>{isAddMode ? '添加新用户' : '编辑用户'}</h3>
                      <button
                        className="toggle-list-button"
                        onClick={toggleUserList}
                      >
                        {showUserList ? '隐藏用户列表' : '显示用户列表'}
                      </button>
                    </div>
                    
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="username">用户名 <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="username" 
                          name="username" 
                          value={formData.username} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="password">
                          密码 {isAddMode && <span className="required">*</span>}
                          {isEditMode && <span className="note">(留空表示不修改)</span>}
                        </label>
                        <div className="password-input-container">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required={isAddMode}
                          />
                          <button 
                            type="button" 
                            className="toggle-password-button" 
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? '隐藏' : '显示'}
                          </button>
                          <button 
                            type="button" 
                            className="generate-password-button"
                            onClick={generateRandomPassword}
                          >
                            生成随机密码
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="userIdentity">用户类型 <span className="required">*</span></label>
                        <select 
                          id="userIdentity" 
                          name="userIdentity" 
                          value={formData.userIdentity} 
                          onChange={handleInputChange}
                        >
                          <option value="student">学生</option>
                          <option value="teacher">教师</option>
                          <option value="administrator">管理员</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleSaveUser}
                      >
                        保存
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={handleCancel}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
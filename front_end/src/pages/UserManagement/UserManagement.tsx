import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.scss';

// 用户类型定义
interface User {
  id: number;
  username: string;
  password: string; // 在实际应用中，密码不应该直接展示
  userIdentity: 'administrator' | 'teacher' | 'student';
  realName: string;
  email: string;
  phone: string;
  departmentId?: number;
  departmentName?: string;
  isActive: boolean;
  lastLogin?: string;
}

// 部门类型定义
interface Department {
  id: number;
  name: string;
  code: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUserIdentity, setSelectedUserIdentity] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    password: '',
    userIdentity: 'student',
    realName: '',
    email: '',
    phone: '',
    departmentId: undefined,
    isActive: true
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

  // 获取用户和部门数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 在实际项目中，这里应该调用API获取数据
      // 这里使用模拟数据，基于示例数据文件夹中的内容构建
      
      // 模拟部门数据
      const mockDepartments: Department[] = [
        { id: 1, name: '计算机科学与技术学院', code: 'CS' },
        { id: 2, name: '数学学院', code: 'MATH' },
        { id: 3, name: '物理学院', code: 'PHY' },
        { id: 4, name: '外国语学院', code: 'FL' }
      ];
      
      // 模拟用户数据
      const mockUsers: User[] = [
        { 
          id: 1, 
          username: 'admin', 
          password: '******',
          userIdentity: 'administrator',
          realName: '系统管理员',
          email: 'admin@university.edu',
          phone: '13800138000',
          isActive: true,
          lastLogin: '2023-06-01 08:30:00'
        },
        { 
          id: 2, 
          username: 'teacher1', 
          password: '******',
          userIdentity: 'teacher',
          realName: '张教授',
          email: 'zhang@university.edu',
          phone: '13800138001',
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          isActive: true,
          lastLogin: '2023-06-02 09:15:00'
        },
        { 
          id: 3, 
          username: 'teacher2', 
          password: '******',
          userIdentity: 'teacher',
          realName: '李教授',
          email: 'li@university.edu',
          phone: '13800138002',
          departmentId: 2,
          departmentName: '数学学院',
          isActive: true,
          lastLogin: '2023-06-02 10:20:00'
        },
        { 
          id: 4, 
          username: 'student1', 
          password: '******',
          userIdentity: 'student',
          realName: '王同学',
          email: 'wang@student.university.edu',
          phone: '13800138003',
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          isActive: true,
          lastLogin: '2023-06-03 14:30:00'
        },
        { 
          id: 5, 
          username: 'student2', 
          password: '******',
          userIdentity: 'student',
          realName: '赵同学',
          email: 'zhao@student.university.edu',
          phone: '13800138004',
          departmentId: 3,
          departmentName: '物理学院',
          isActive: false,
          lastLogin: '2023-05-20 16:45:00'
        }
      ];

      setDepartments(mockDepartments);
      setUsers(mockUsers);
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请重试');
      setLoading(false);
    }
  };

  // 根据搜索条件和选中的用户类型筛选用户
  const filteredUsers = users.filter(user => {
    const matchesUserIdentity = selectedUserIdentity ? user.userIdentity === selectedUserIdentity : true;
    const matchesSearch = searchTerm 
      ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.realName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesUserIdentity && matchesSearch;
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkboxInput.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 选择用户进行编辑
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '', // 不回显密码，用户可以重设
      userIdentity: user.userIdentity,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      departmentId: user.departmentId,
      isActive: user.isActive
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  // 准备添加新用户
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      userIdentity: 'student',
      realName: '',
      email: '',
      phone: '',
      departmentId: undefined,
      isActive: true
    });
    setIsAddMode(true);
    setIsEditMode(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      userIdentity: 'student',
      realName: '',
      email: '',
      phone: '',
      departmentId: undefined,
      isActive: true
    });
  };

  // 保存用户信息
  const handleSaveUser = () => {
    if (!formData.username || (!isEditMode && !formData.password)) {
      setError('用户名和密码不能为空');
      return;
    }

    if (isAddMode) {
      // 检查用户名是否重复
      const isDuplicate = users.some(user => user.username === formData.username);
      if (isDuplicate) {
        setError('用户名已存在，请使用不同的用户名');
        return;
      }

      // 添加新用户
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        username: formData.username || '',
        password: '******', // 实际应用中，密码应该加密存储
        userIdentity: formData.userIdentity as 'administrator' | 'teacher' | 'student' || 'student',
        realName: formData.realName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        departmentId: formData.departmentId,
        departmentName: formData.departmentId ? departments.find(d => d.id === formData.departmentId)?.name : undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        lastLogin: undefined
      };
      
      setUsers([...users, newUser]);
      setError(null);
      setIsAddMode(false);
      setFormData({
        username: '',
        password: '',
        userIdentity: 'student',
        realName: '',
        email: '',
        phone: '',
        departmentId: undefined,
        isActive: true
      });
    } else if (isEditMode && selectedUser) {
      // 检查用户名是否重复（除了当前正在编辑的用户）
      const isDuplicate = users.some(user => 
        user.id !== selectedUser.id && user.username === formData.username
      );
      if (isDuplicate) {
        setError('用户名已存在，请使用不同的用户名');
        return;
      }

      // 更新现有用户
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            username: formData.username || user.username,
            password: formData.password ? '******' : user.password, // 如果用户输入了新密码，则更新
            userIdentity: formData.userIdentity as 'administrator' | 'teacher' | 'student' || user.userIdentity,
            realName: formData.realName || user.realName,
            email: formData.email || user.email,
            phone: formData.phone || user.phone,
            departmentId: formData.departmentId,
            departmentName: formData.departmentId ? departments.find(d => d.id === formData.departmentId)?.name : user.departmentName,
            isActive: formData.isActive !== undefined ? formData.isActive : user.isActive
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setError(null);
      setIsEditMode(false);
      setSelectedUser(null);
    }
  };

  // 删除用户
  const handleDeleteUser = (user: User) => {
    // 不允许删除自己
    if (user.id === currentUser.id) {
      alert('不能删除当前登录的用户账号');
      return;
    }
    
    // 确保至少保留一个管理员账号
    const adminCount = users.filter(u => u.userIdentity === 'administrator').length;
    if (user.userIdentity === 'administrator' && adminCount <= 1) {
      alert('系统必须至少保留一个管理员账号');
      return;
    }

    if (window.confirm(`确定要删除用户 ${user.realName} (${user.username}) 吗？`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(null);
        setIsEditMode(false);
      }
    }
  };

  // 启用/禁用用户
  const handleToggleUserStatus = (user: User) => {
    // 不允许禁用自己
    if (user.id === currentUser.id) {
      alert('不能禁用当前登录的用户账号');
      return;
    }
    
    // 确保至少保留一个启用的管理员账号
    const activeAdminCount = users.filter(u => u.userIdentity === 'administrator' && u.isActive).length;
    if (user.userIdentity === 'administrator' && user.isActive && activeAdminCount <= 1) {
      alert('系统必须至少保留一个活跃的管理员账号');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    
    setUsers(updatedUsers);
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
                </div>
              </div>

              <div className="main-content">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="搜索用户名或姓名..." 
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
                          <th>姓名</th>
                          <th>用户类型</th>
                          <th>部门</th>
                          <th>联系方式</th>
                          <th>状态</th>
                          <th>最后登录</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id} className={!user.isActive ? 'inactive-user' : ''}>
                            <td>{user.username}</td>
                            <td>{user.realName}</td>
                            <td>
                              {user.userIdentity === 'administrator' && '管理员'}
                              {user.userIdentity === 'teacher' && '教师'}
                              {user.userIdentity === 'student' && '学生'}
                            </td>
                            <td>{user.departmentName || '无'}</td>
                            <td>
                              <div>{user.email}</div>
                              <div>{user.phone}</div>
                            </td>
                            <td className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                              {user.isActive ? '正常' : '禁用'}
                            </td>
                            <td>{user.lastLogin || '未登录'}</td>
                            <td className="actions-cell">
                              <button 
                                className="edit-button"
                                onClick={() => handleEditUser(user)}
                              >
                                编辑
                              </button>
                              <button 
                                className={`status-button ${user.isActive ? 'disable-button' : 'enable-button'}`}
                                onClick={() => handleToggleUserStatus(user)}
                              >
                                {user.isActive ? '禁用' : '启用'}
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

                {(isEditMode || isAddMode) && (
                  <div className="user-form">
                    <h3>{isAddMode ? '添加新用户' : '编辑用户'}</h3>
                    
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
                        <label htmlFor="realName">姓名</label>
                        <input 
                          type="text" 
                          id="realName" 
                          name="realName" 
                          value={formData.realName} 
                          onChange={handleInputChange} 
                        />
                      </div>

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

                    {(formData.userIdentity === 'teacher' || formData.userIdentity === 'student') && (
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="departmentId">所属部门</label>
                          <select 
                            id="departmentId" 
                            name="departmentId" 
                            value={formData.departmentId || ''} 
                            onChange={handleInputChange}
                          >
                            <option value="">请选择</option>
                            {departments.map(department => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="phone">电话</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group checkbox-group">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          name="isActive" 
                          checked={formData.isActive} 
                          onChange={handleInputChange} 
                        />
                        <label htmlFor="isActive">账号启用</label>
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
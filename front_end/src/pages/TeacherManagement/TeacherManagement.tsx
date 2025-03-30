import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherManagement.scss';

// 教师类型定义
interface Teacher {
  id: number;
  teacherId: string;  // 工号
  name: string;
  gender: '男' | '女';
  title: string;  // 职称
  departmentId: number;
  departmentName: string;
  email: string;
  phone: string;
  specialization: string[];  // 专业方向
  maxWeeklyHours: number;  // 最大周课时数
}

// 部门类型定义
interface Department {
  id: number;
  name: string;
  code: string;
}

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Teacher>>({
    teacherId: '',
    name: '',
    gender: '男',
    title: '',
    departmentId: 0,
    email: '',
    phone: '',
    specialization: [],
    maxWeeklyHours: 16
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
      setUser(userData);
      
      // 只有管理员可以访问教师管理页面
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

  // 获取教师和部门数据
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
      
      // 模拟教师数据
      const mockTeachers: Teacher[] = [
        { 
          id: 1, 
          teacherId: 'T001',
          name: '张三', 
          gender: '男',
          title: '教授',
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          email: 'zhang@university.edu',
          phone: '13800138001',
          specialization: ['人工智能', '机器学习'],
          maxWeeklyHours: 16
        },
        { 
          id: 2, 
          teacherId: 'T002',
          name: '李四', 
          gender: '女',
          title: '副教授',
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          email: 'li@university.edu',
          phone: '13800138002',
          specialization: ['数据库', '软件工程'],
          maxWeeklyHours: 18
        },
        { 
          id: 3, 
          teacherId: 'T003',
          name: '王五', 
          gender: '男',
          title: '讲师',
          departmentId: 2,
          departmentName: '数学学院',
          email: 'wang@university.edu',
          phone: '13800138003',
          specialization: ['高等数学', '线性代数'],
          maxWeeklyHours: 20
        },
        { 
          id: 4, 
          teacherId: 'T004',
          name: '赵六', 
          gender: '女',
          title: '助教',
          departmentId: 3,
          departmentName: '物理学院',
          email: 'zhao@university.edu',
          phone: '13800138004',
          specialization: ['普通物理', '量子力学'],
          maxWeeklyHours: 16
        },
        { 
          id: 5, 
          teacherId: 'T005',
          name: '钱七', 
          gender: '男',
          title: '教授',
          departmentId: 4,
          departmentName: '外国语学院',
          email: 'qian@university.edu',
          phone: '13800138005',
          specialization: ['英语语法', '英美文学'],
          maxWeeklyHours: 14
        }
      ];

      setDepartments(mockDepartments);
      setTeachers(mockTeachers);
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请重试');
      setLoading(false);
    }
  };

  // 根据搜索条件和选中的部门筛选教师
  const filteredTeachers = teachers.filter(teacher => {
    const matchesDepartment = selectedDepartmentId ? teacher.departmentId === selectedDepartmentId : true;
    const matchesSearch = searchTerm 
      ? teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesDepartment && matchesSearch;
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理专业方向选择
  const handleSpecializationChange = (specialization: string) => {
    const currentSpecializations = formData.specialization || [];
    const updatedSpecializations = currentSpecializations.includes(specialization)
      ? currentSpecializations.filter(s => s !== specialization)
      : [...currentSpecializations, specialization];
      
    setFormData({
      ...formData,
      specialization: updatedSpecializations
    });
  };

  // 选择教师进行编辑
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      teacherId: teacher.teacherId,
      name: teacher.name,
      gender: teacher.gender,
      title: teacher.title,
      departmentId: teacher.departmentId,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      maxWeeklyHours: teacher.maxWeeklyHours
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  // 准备添加新教师
  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setFormData({
      teacherId: '',
      name: '',
      gender: '男',
      title: '',
      departmentId: selectedDepartmentId || departments[0]?.id || 0,
      email: '',
      phone: '',
      specialization: [],
      maxWeeklyHours: 16
    });
    setIsAddMode(true);
    setIsEditMode(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedTeacher(null);
    setFormData({
      teacherId: '',
      name: '',
      gender: '男',
      title: '',
      departmentId: 0,
      email: '',
      phone: '',
      specialization: [],
      maxWeeklyHours: 16
    });
  };

  // 保存教师信息
  const handleSaveTeacher = () => {
    if (!formData.teacherId || !formData.name || !formData.departmentId) {
      setError('工号、姓名和所属部门不能为空');
      return;
    }

    if (isAddMode) {
      // 检查工号是否重复
      const isDuplicate = teachers.some(teacher => teacher.teacherId === formData.teacherId);
      if (isDuplicate) {
        setError('工号已存在，请使用不同的工号');
        return;
      }

      // 添加新教师
      const newTeacher: Teacher = {
        id: Math.max(...teachers.map(t => t.id), 0) + 1,
        teacherId: formData.teacherId || '',
        name: formData.name || '',
        gender: formData.gender as '男' | '女' || '男',
        title: formData.title || '',
        departmentId: formData.departmentId || 0,
        departmentName: departments.find(d => d.id === formData.departmentId)?.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        specialization: formData.specialization || [],
        maxWeeklyHours: formData.maxWeeklyHours || 16
      };
      
      setTeachers([...teachers, newTeacher]);
      setError(null);
      setIsAddMode(false);
      setFormData({
        teacherId: '',
        name: '',
        gender: '男',
        title: '',
        departmentId: selectedDepartmentId || 0,
        email: '',
        phone: '',
        specialization: [],
        maxWeeklyHours: 16
      });
    } else if (isEditMode && selectedTeacher) {
      // 检查工号是否重复（除了当前正在编辑的教师）
      const isDuplicate = teachers.some(teacher => 
        teacher.id !== selectedTeacher.id && teacher.teacherId === formData.teacherId
      );
      if (isDuplicate) {
        setError('工号已存在，请使用不同的工号');
        return;
      }

      // 更新现有教师
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.id === selectedTeacher.id) {
          return {
            ...teacher,
            teacherId: formData.teacherId || teacher.teacherId,
            name: formData.name || teacher.name,
            gender: formData.gender as '男' | '女' || teacher.gender,
            title: formData.title || teacher.title,
            departmentId: formData.departmentId || teacher.departmentId,
            departmentName: departments.find(d => d.id === formData.departmentId)?.name || teacher.departmentName,
            email: formData.email || teacher.email,
            phone: formData.phone || teacher.phone,
            specialization: formData.specialization || teacher.specialization,
            maxWeeklyHours: formData.maxWeeklyHours || teacher.maxWeeklyHours
          };
        }
        return teacher;
      });
      
      setTeachers(updatedTeachers);
      setError(null);
      setIsEditMode(false);
      setSelectedTeacher(null);
    }
  };

  // 删除教师
  const handleDeleteTeacher = (teacher: Teacher) => {
    if (window.confirm(`确定要删除教师 ${teacher.name} (${teacher.teacherId}) 吗？`)) {
      const updatedTeachers = teachers.filter(t => t.id !== teacher.id);
      setTeachers(updatedTeachers);
      
      if (selectedTeacher && selectedTeacher.id === teacher.id) {
        setSelectedTeacher(null);
        setIsEditMode(false);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 专业方向选项
  const specializationOptions = [
    '人工智能', '机器学习', '数据库', '软件工程', '计算机网络',
    '高等数学', '线性代数', '概率统计', '普通物理', '量子力学',
    '英语语法', '英美文学', '大学语文', '编译原理', '操作系统'
  ];

  // 职称选项
  const titleOptions = ['教授', '副教授', '讲师', '助教'];

  return (
    <div className="teacher-management">
      <header className="teacher-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>教师管理</h1>
        </div>
      </header>

      <div className="teacher-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="management-container">
              <div className="sidebar">
                <div className="department-filter">
                  <h3>部门筛选</h3>
                  <ul className="department-list">
                    <li 
                      className={selectedDepartmentId === null ? 'active' : ''}
                      onClick={() => setSelectedDepartmentId(null)}
                    >
                      全部部门
                    </li>
                    {departments.map(department => (
                      <li 
                        key={department.id}
                        className={selectedDepartmentId === department.id ? 'active' : ''}
                        onClick={() => setSelectedDepartmentId(department.id)}
                      >
                        {department.name}
                        <span className="department-code">({department.code})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="actions">
                  <button className="add-button" onClick={handleAddTeacher}>
                    添加新教师
                  </button>
                </div>
              </div>

              <div className="main-content">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="搜索教师姓名或工号..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="teachers-list">
                  <h2>
                    {selectedDepartmentId 
                      ? `${departments.find(d => d.id === selectedDepartmentId)?.name} 的教师` 
                      : '所有教师'}
                  </h2>
                  
                  {filteredTeachers.length === 0 ? (
                    <div className="no-teachers">暂无教师信息</div>
                  ) : (
                    <table className="teachers-table">
                      <thead>
                        <tr>
                          <th>工号</th>
                          <th>姓名</th>
                          <th>性别</th>
                          <th>职称</th>
                          <th>所属部门</th>
                          <th>专业方向</th>
                          <th>最大周课时</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map(teacher => (
                          <tr key={teacher.id}>
                            <td>{teacher.teacherId}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.gender}</td>
                            <td>{teacher.title}</td>
                            <td>{teacher.departmentName}</td>
                            <td className="specialization-cell">
                              {teacher.specialization.join(', ')}
                            </td>
                            <td>{teacher.maxWeeklyHours}</td>
                            <td className="actions-cell">
                              <button 
                                className="edit-button"
                                onClick={() => handleEditTeacher(teacher)}
                              >
                                编辑
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteTeacher(teacher)}
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
                  <div className="teacher-form">
                    <h3>{isAddMode ? '添加新教师' : '编辑教师'}</h3>
                    
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="teacherId">工号 <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="teacherId" 
                          name="teacherId" 
                          value={formData.teacherId} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="name">姓名 <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">性别</label>
                        <select 
                          id="gender" 
                          name="gender" 
                          value={formData.gender} 
                          onChange={handleInputChange}
                        >
                          <option value="男">男</option>
                          <option value="女">女</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="title">职称</label>
                        <select 
                          id="title" 
                          name="title" 
                          value={formData.title} 
                          onChange={handleInputChange}
                        >
                          <option value="">请选择</option>
                          {titleOptions.map(title => (
                            <option key={title} value={title}>{title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="departmentId">所属部门 <span className="required">*</span></label>
                        <select 
                          id="departmentId" 
                          name="departmentId" 
                          value={formData.departmentId} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">请选择</option>
                          {departments.map(department => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="maxWeeklyHours">最大周课时</label>
                        <input 
                          type="number" 
                          id="maxWeeklyHours" 
                          name="maxWeeklyHours" 
                          min="0" 
                          max="30" 
                          value={formData.maxWeeklyHours} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

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

                    <div className="form-group full-width">
                      <label>专业方向</label>
                      <div className="specializations-checkboxes">
                        {specializationOptions.map(specialization => (
                          <div key={specialization} className="specialization-checkbox">
                            <input 
                              type="checkbox" 
                              id={`specialization-${specialization}`}
                              checked={(formData.specialization || []).includes(specialization)}
                              onChange={() => handleSpecializationChange(specialization)}
                            />
                            <label htmlFor={`specialization-${specialization}`}>
                              {specialization}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleSaveTeacher}
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

export default TeacherManagement;
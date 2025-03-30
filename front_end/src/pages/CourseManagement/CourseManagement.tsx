import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseManagement.scss';

// 课程类型定义
interface Course {
  id: number;
  code: string;
  name: string;
  credit: number;
  hours: number;
  departmentId: number;
  departmentName: string;
  type: string; // 必修、选修等
  description: string;
  prerequisites: string[];
}

// 部门（院系）类型定义
interface Department {
  id: number;
  name: string;
  code: string;
}

const CourseManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    name: '',
    credit: 3,
    hours: 48,
    departmentId: 0,
    departmentName: '',
    type: '必修',
    description: '',
    prerequisites: []
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
      
      // 只有管理员可以访问课程管理页面
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

  // 获取部门和课程数据
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
      
      // 模拟课程数据
      const mockCourses: Course[] = [
        { 
          id: 1, 
          code: 'CS101', 
          name: '计算机导论', 
          credit: 3,
          hours: 48,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '必修',
          description: '介绍计算机科学的基本概念和原理',
          prerequisites: []
        },
        { 
          id: 2, 
          code: 'CS102', 
          name: '程序设计基础', 
          credit: 4,
          hours: 64,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '必修',
          description: '学习C/C++程序设计的基础知识',
          prerequisites: ['CS101']
        },
        { 
          id: 3, 
          code: 'CS201', 
          name: '数据结构', 
          credit: 4,
          hours: 64,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '必修',
          description: '学习常见的数据结构和算法',
          prerequisites: ['CS102']
        },
        { 
          id: 4, 
          code: 'CS301', 
          name: '操作系统', 
          credit: 4,
          hours: 64,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '必修',
          description: '学习操作系统的设计原理和实现',
          prerequisites: ['CS201']
        },
        { 
          id: 5, 
          code: 'CS302', 
          name: '计算机网络', 
          credit: 3,
          hours: 48,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '必修',
          description: '学习计算机网络的基本原理和协议',
          prerequisites: ['CS201']
        },
        { 
          id: 6, 
          code: 'CS401', 
          name: '人工智能', 
          credit: 3,
          hours: 48,
          departmentId: 1,
          departmentName: '计算机科学与技术学院',
          type: '选修',
          description: '介绍人工智能的基本概念和算法',
          prerequisites: ['CS201', 'MATH202']
        },
        { 
          id: 7, 
          code: 'MATH101', 
          name: '高等数学(上)', 
          credit: 5,
          hours: 80,
          departmentId: 2,
          departmentName: '数学学院',
          type: '必修',
          description: '学习微积分和线性代数的基础知识',
          prerequisites: []
        },
        { 
          id: 8, 
          code: 'MATH102', 
          name: '高等数学(下)', 
          credit: 5,
          hours: 80,
          departmentId: 2,
          departmentName: '数学学院',
          type: '必修',
          description: '学习多元微积分和微分方程',
          prerequisites: ['MATH101']
        },
        { 
          id: 9, 
          code: 'MATH201', 
          name: '概率论与数理统计', 
          credit: 3,
          hours: 48,
          departmentId: 2,
          departmentName: '数学学院',
          type: '必修',
          description: '学习概率论和统计学的基本概念和方法',
          prerequisites: ['MATH102']
        },
        { 
          id: 10, 
          code: 'MATH202', 
          name: '离散数学', 
          credit: 3,
          hours: 48,
          departmentId: 2,
          departmentName: '数学学院',
          type: '必修',
          description: '学习集合论、图论和逻辑学等离散数学知识',
          prerequisites: []
        }
      ];

      setDepartments(mockDepartments);
      setCourses(mockCourses);
      
      if (mockDepartments.length > 0) {
        setSelectedDepartmentId(mockDepartments[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请重试');
      setLoading(false);
    }
  };

  // 根据搜索条件和选中的部门筛选课程
  const filteredCourses = courses.filter(course => {
    const matchesDepartment = selectedDepartmentId ? course.departmentId === selectedDepartmentId : true;
    const matchesSearch = searchTerm 
      ? course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
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

  // 处理先修课程选择
  const handlePrerequisiteChange = (courseCode: string) => {
    const currentPrerequisites = formData.prerequisites || [];
    const updatedPrerequisites = currentPrerequisites.includes(courseCode)
      ? currentPrerequisites.filter(c => c !== courseCode)
      : [...currentPrerequisites, courseCode];
      
    setFormData({
      ...formData,
      prerequisites: updatedPrerequisites
    });
  };

  // 选择课程进行编辑
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      credit: course.credit,
      hours: course.hours,
      departmentId: course.departmentId,
      departmentName: course.departmentName,
      type: course.type,
      description: course.description,
      prerequisites: course.prerequisites
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  // 准备添加新课程
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setFormData({
      code: '',
      name: '',
      credit: 3,
      hours: 48,
      departmentId: selectedDepartmentId || 0,
      departmentName: departments.find(d => d.id === selectedDepartmentId)?.name || '',
      type: '必修',
      description: '',
      prerequisites: []
    });
    setIsAddMode(true);
    setIsEditMode(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedCourse(null);
    setFormData({
      code: '',
      name: '',
      credit: 3,
      hours: 48,
      departmentId: 0,
      departmentName: '',
      type: '必修',
      description: '',
      prerequisites: []
    });
  };

  // 保存课程信息
  const handleSaveCourse = () => {
    if (!formData.code || !formData.name || !formData.departmentId) {
      setError('课程代码、名称和所属院系不能为空');
      return;
    }

    // 检查课程代码是否已存在（除了当前编辑的课程）
    const codeExists = courses.some(course => 
      course.code === formData.code && 
      (!selectedCourse || course.id !== selectedCourse.id)
    );
    
    if (codeExists) {
      setError('课程代码已存在，请使用其他代码');
      return;
    }

    if (isAddMode) {
      // 添加新课程
      const newCourse: Course = {
        id: Math.max(...courses.map(c => c.id), 0) + 1,
        code: formData.code || '',
        name: formData.name || '',
        credit: formData.credit || 3,
        hours: formData.hours || 48,
        departmentId: formData.departmentId || 0,
        departmentName: departments.find(d => d.id === formData.departmentId)?.name || '',
        type: formData.type || '必修',
        description: formData.description || '',
        prerequisites: formData.prerequisites || []
      };
      
      setCourses([...courses, newCourse]);
      setError(null);
      setIsAddMode(false);
      setFormData({
        code: '',
        name: '',
        credit: 3,
        hours: 48,
        departmentId: selectedDepartmentId || 0,
        departmentName: '',
        type: '必修',
        description: '',
        prerequisites: []
      });
    } else if (isEditMode && selectedCourse) {
      // 更新现有课程
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourse.id) {
          return {
            ...course,
            code: formData.code || course.code,
            name: formData.name || course.name,
            credit: formData.credit || course.credit,
            hours: formData.hours || course.hours,
            departmentId: formData.departmentId || course.departmentId,
            departmentName: departments.find(d => d.id === formData.departmentId)?.name || course.departmentName,
            type: formData.type || course.type,
            description: formData.description || course.description,
            prerequisites: formData.prerequisites || course.prerequisites
          };
        }
        return course;
      });
      
      setCourses(updatedCourses);
      setError(null);
      setIsEditMode(false);
      setSelectedCourse(null);
    }
  };

  // 删除课程
  const handleDeleteCourse = (course: Course) => {
    // 检查是否有其他课程以此课程为先修课程
    const isPrerequisite = courses.some(c => 
      c.id !== course.id && c.prerequisites.includes(course.code)
    );
    
    if (isPrerequisite) {
      alert(`无法删除课程 ${course.code}，因为它是其他课程的先修课程。`);
      return;
    }

    if (window.confirm(`确定要删除课程 ${course.code} - ${course.name} 吗？`)) {
      const updatedCourses = courses.filter(c => c.id !== course.id);
      setCourses(updatedCourses);
      
      if (selectedCourse && selectedCourse.id === course.id) {
        setSelectedCourse(null);
        setIsEditMode(false);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="course-management">
      <header className="course-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>课程管理</h1>
        </div>
      </header>

      <div className="course-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="management-container">
              <div className="sidebar">
                <div className="department-filter">
                  <h3>院系</h3>
                  <ul className="department-list">
                    <li 
                      className={selectedDepartmentId === null ? 'active' : ''}
                      onClick={() => setSelectedDepartmentId(null)}
                    >
                      全部院系
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
                  <button className="add-button" onClick={handleAddCourse}>
                    添加新课程
                  </button>
                </div>
              </div>

              <div className="main-content">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="搜索课程名称或代码..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="courses-list">
                  <h2>
                    {selectedDepartmentId 
                      ? `${departments.find(d => d.id === selectedDepartmentId)?.name} 的课程` 
                      : '所有课程'}
                  </h2>
                  
                  {filteredCourses.length === 0 ? (
                    <div className="no-courses">暂无课程信息</div>
                  ) : (
                    <table className="courses-table">
                      <thead>
                        <tr>
                          <th>课程代码</th>
                          <th>课程名称</th>
                          <th>学分</th>
                          <th>学时</th>
                          <th>课程类型</th>
                          <th>所属院系</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map(course => (
                          <tr key={course.id}>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td>{course.credit}</td>
                            <td>{course.hours}</td>
                            <td>{course.type}</td>
                            <td>{course.departmentName}</td>
                            <td className="actions-cell">
                              <button 
                                className="edit-button"
                                onClick={() => handleEditCourse(course)}
                              >
                                编辑
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteCourse(course)}
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
                  <div className="course-form">
                    <h3>{isAddMode ? '添加新课程' : '编辑课程'}</h3>
                    
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="code">课程代码 <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="code" 
                          name="code" 
                          value={formData.code} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="name">课程名称 <span className="required">*</span></label>
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
                        <label htmlFor="credit">学分</label>
                        <input 
                          type="number" 
                          id="credit" 
                          name="credit" 
                          min="0.5" 
                          step="0.5" 
                          max="10" 
                          value={formData.credit} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="hours">学时</label>
                        <input 
                          type="number" 
                          id="hours" 
                          name="hours" 
                          min="8" 
                          step="8" 
                          value={formData.hours} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="departmentId">所属院系 <span className="required">*</span></label>
                        <select 
                          id="departmentId" 
                          name="departmentId" 
                          value={formData.departmentId} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">请选择院系</option>
                          {departments.map(department => (
                            <option key={department.id} value={department.id}>
                              {department.name} ({department.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="type">课程类型</label>
                        <select 
                          id="type" 
                          name="type" 
                          value={formData.type} 
                          onChange={handleInputChange}
                        >
                          <option value="必修">必修</option>
                          <option value="选修">选修</option>
                          <option value="实验">实验</option>
                          <option value="实践">实践</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="description">课程描述</label>
                      <textarea 
                        id="description" 
                        name="description" 
                        rows={3} 
                        value={formData.description} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>先修课程</label>
                      <div className="prerequisites-checkboxes">
                        {courses
                          .filter(course => !selectedCourse || course.id !== selectedCourse.id)
                          .map(course => (
                            <div key={course.id} className="prerequisite-checkbox">
                              <input 
                                type="checkbox" 
                                id={`prerequisite-${course.code}`}
                                checked={(formData.prerequisites || []).includes(course.code)}
                                onChange={() => handlePrerequisiteChange(course.code)}
                              />
                              <label htmlFor={`prerequisite-${course.code}`}>
                                {course.code} - {course.name}
                              </label>
                            </div>
                        ))}
                        {courses.length <= 1 && (
                          <div className="no-prerequisites">暂无可选的先修课程</div>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleSaveCourse}
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

export default CourseManagement;
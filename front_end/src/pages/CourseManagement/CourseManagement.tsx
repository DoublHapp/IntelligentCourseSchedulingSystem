import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseManagement.scss';

// 课程类型定义，与后端Course实体对应
interface Course {
  id: string;                    // 对应后端courseId
  name: string;                  // 对应后端courseName
  category: string;              // 对应后端courseCategory
  attribute: string;             // 对应后端courseAttribute
  type: string;                  // 对应后端courseType
  nature: string;                // 对应后端courseNature
  englishName: string;           // 对应后端courseEnglishName
  offeringDepartment: string;    // 对应后端courseOfferingDepartment
  departmentName?: string;       
  isEnabled: string;             // 对应后端isEnabled
  totalHours: number;            // 对应后端totalHours
  theoreticalHours: number;      // 对应后端theoreticalHours
  experimentalHours: number;     // 对应后端experimentalHours
  labHours: number;              // 对应后端labHours
  practicalHours: number;        // 对应后端practicalHours
  otherHours: number;            // 对应后端otherHours
  credits: number;               // 对应后端credits
  weeklyHours: number;           // 对应后端weeklyHours
  isPurePracticalSession: string; // 对应后端isPurePracticalSession
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// 部门（院系）类型定义
interface Department {
  id: string;
  name: string;
  code: string;
}

const CourseManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 添加控制课程列表显示的状态
  const [showCourseList, setShowCourseList] = useState(true);
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Course>>({
    id: '',
    name: '',
    englishName: '',
    category: '专业课',
    attribute: '必修',
    type: '必修',
    nature: '理论课',
    offeringDepartment: '',
    departmentName: '',
    isEnabled: '是',
    totalHours: 48,
    theoreticalHours: 48,
    experimentalHours: 0,
    labHours: 0,
    practicalHours: 0,
    otherHours: 0,
    credits: 3,
    weeklyHours: 4,
    isPurePracticalSession: '否'
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
      // 获取部门数据
      const departmentsResponse = await fetch('http://localhost:8080/api/departments');
      if (!departmentsResponse.ok) {
        throw new Error(`获取部门数据失败: ${departmentsResponse.statusText}`);
      }
      const departmentsResult: ApiResponse<any[]> = await departmentsResponse.json();
      
      if (departmentsResult.success && departmentsResult.data) {
        // 只获取可以开设课程的部门
        const courseOfferingDepartments = departmentsResult.data.filter(
          dept => dept.isCourseOfferingDepartment === '是'
        );
        
        const transformedDepartments: Department[] = courseOfferingDepartments.map(dept => ({
          id: dept.departmentCode,// 保留部门代码作为ID
          name: dept.departmentName,// 部门名称
          code: dept.departmentAbbreviation || String(dept.departmentCode)
        }));
        setDepartments(transformedDepartments);
      } else {
        console.error('获取部门数据失败:', departmentsResult.message);
      }
      
      // 获取课程数据
      const coursesResponse = await fetch('http://localhost:8080/api/courses');
      if (!coursesResponse.ok) {
        throw new Error(`获取课程数据失败: ${coursesResponse.statusText}`);
      }
      const coursesResult: ApiResponse<any[]> = await coursesResponse.json();
      
      if (coursesResult.success && coursesResult.data) {
        const transformedCourses: Course[] = coursesResult.data.map(course => ({
          id: course.courseId,
          name: course.courseName,
          category: course.courseCategory || '',
          attribute: course.courseAttribute || '',
          type: course.courseType || '',
          nature: course.courseNature || '',
          englishName: course.courseEnglishName || '',
          offeringDepartment: course.courseOfferingDepartment || '',
          departmentName: course.courseOfferingDepartment || '', // 直接使用部门名称
          isEnabled: course.isEnabled || '是',
          totalHours: course.totalHours || 0,
          theoreticalHours: course.theoreticalHours || 0,
          experimentalHours: course.experimentalHours || 0,
          labHours: course.labHours || 0,
          practicalHours: course.practicalHours || 0,
          otherHours: course.otherHours || 0,
          credits: course.credits || 0,
          weeklyHours: course.weeklyHours || 0,
          isPurePracticalSession: course.isPurePracticalSession || '否'
        }));
        setCourses(transformedCourses);
      } else {
        console.error('获取课程数据失败:', coursesResult.message);
      }

      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请确保后端服务已启动');
      setLoading(false);
    }
  };

  // 根据部门ID获取部门名称
  const getDepartmentNameById = (departmentId: string, departmentsData: any[]): string => {
    const department = departmentsData.find(dept => dept.departmentCode === departmentId);
    return department ? department.departmentName : '';
  };

  // 根据搜索条件和选中的部门筛选课程
  const filteredCourses = courses.filter(course => {
    // 修改这里：当选择院系时，应该比较院系名称而不是ID
  const matchesDepartment = selectedDepartmentId 
  ? course.offeringDepartment === departments.find(d => d.id === selectedDepartmentId)?.name 
  : true;
const matchesSearch = searchTerm
  ? course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.englishName && course.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    course.id.toLowerCase().includes(searchTerm.toLowerCase())
  : true;

return matchesDepartment && matchesSearch;
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    if (name === 'offeringDepartment') {
      
      setFormData({
        ...formData,
        [name]: value, // 直接使用选择的值作为院系名称
      departmentName: value // 同步设置显示用的院系名称
      });
    } else if (name === 'totalHours') {
      // 如果修改了总学时，同时更新理论课时（假设其他课时不变）
      const newHours = Number(value);
      const otherHours = 
        (formData.experimentalHours || 0) + 
        (formData.practicalHours || 0) + 
        (formData.labHours || 0) +
        (formData.otherHours || 0);
      
      const newTheoreticalHours = Math.max(0, newHours - otherHours);
      
      setFormData({
        ...formData,
        [name]: newHours,
        theoreticalHours: newTheoreticalHours
      });
    } else if (['theoreticalHours', 'experimentalHours', 'practicalHours', 'labHours', 'otherHours'].includes(name)) {
      // 如果修改了某个具体课时，同时更新总学时
      const hours = {
        theoreticalHours: name === 'theoreticalHours' ? Number(value) : (formData.theoreticalHours || 0),
        experimentalHours: name === 'experimentalHours' ? Number(value) : (formData.experimentalHours || 0),
        practicalHours: name === 'practicalHours' ? Number(value) : (formData.practicalHours || 0),
        labHours: name === 'labHours' ? Number(value) : (formData.labHours || 0),
        otherHours: name === 'otherHours' ? Number(value) : (formData.otherHours || 0)
      };
      
      const totalHours = hours.theoreticalHours + hours.experimentalHours + hours.practicalHours + hours.labHours + hours.otherHours;
      
      setFormData({
        ...formData,
        [name]: Number(value),
        totalHours: totalHours
      });
    } else if (name === 'isPurePracticalSession' && value === '是') {
      // 如果设置为纯实践课，调整相关学时
      setFormData({
        ...formData,
        [name]: value,
        theoreticalHours: 0,
        practicalHours: formData.totalHours || 48
      });
    } else if (name === 'isEnabled') {
      // 存储"是"或"否"的值
      setFormData({
        ...formData,
        [name]: value  // 直接存储"是"或"否"
      });
    } else {
      // 处理数字类型的字段
      if (['credits', 'weeklyHours'].includes(name)) {
        setFormData({
          ...formData,
          [name]: Number(value)
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };

  // 选择课程进行编辑
  const handleEditCourse = async (course: Course) => {
    setSelectedCourse(course);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/courses/${course.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result: ApiResponse<any> = await response.json();
      
      if (result.success && result.data) {
        const courseData = result.data;
        
        setFormData({
          id: courseData.courseId,
          name: courseData.courseName,
          category: courseData.courseCategory || '',
          attribute: courseData.courseAttribute || '',
          type: courseData.courseType || '',
          nature: courseData.courseNature || '',
          englishName: courseData.courseEnglishName || '',
          offeringDepartment: courseData.courseOfferingDepartment || '',
          departmentName: courseData.courseOfferingDepartment || '',
          isEnabled: courseData.isEnabled || '是',
          totalHours: courseData.totalHours || 0,
          theoreticalHours: courseData.theoreticalHours || 0,
          experimentalHours: courseData.experimentalHours || 0,
          labHours: courseData.labHours || 0,
          practicalHours: courseData.practicalHours || 0,
          otherHours: courseData.otherHours || 0,
          credits: courseData.credits || 0,
          weeklyHours: courseData.weeklyHours || 0,
          isPurePracticalSession: courseData.isPurePracticalSession || '否'
        });
      } else {
        // 回退到基本数据
        setFormData({
          id: course.id,
          name: course.name,
          category: course.category,
          attribute: course.attribute,
          type: course.type,
          nature: course.nature,
          englishName: course.englishName,
          offeringDepartment: course.offeringDepartment,
          departmentName: course.departmentName,
          isEnabled: course.isEnabled,
          totalHours: course.totalHours,
          theoreticalHours: course.theoreticalHours,
          experimentalHours: course.experimentalHours,
          labHours: course.labHours,
          practicalHours: course.practicalHours,
          otherHours: course.otherHours,
          credits: course.credits,
          weeklyHours: course.weeklyHours,
          isPurePracticalSession: course.isPurePracticalSession
        });
      }
    } catch (error) {
      console.error('获取课程详细信息失败:', error);
      // 回退到基本数据
      setFormData({
        id: course.id,
        name: course.name,
        category: course.category,
        attribute: course.attribute,
        type: course.type,
        nature: course.nature,
        englishName: course.englishName,
        offeringDepartment: course.offeringDepartment,
        departmentName: course.departmentName,
        isEnabled: course.isEnabled,
        totalHours: course.totalHours,
        theoreticalHours: course.theoreticalHours,
        experimentalHours: course.experimentalHours,
        labHours: course.labHours,
        practicalHours: course.practicalHours,
        otherHours: course.otherHours,
        credits: course.credits,
        weeklyHours: course.weeklyHours,
        isPurePracticalSession: course.isPurePracticalSession
      });
    }
    
    setIsEditMode(true);
    setIsAddMode(false);
    // 隐藏课程列表
    setShowCourseList(false);
  };

  // 准备添加新课程
  const handleAddCourse = () => {
    setSelectedCourse(null);
     // 如果选择了部门，则使用该部门的名称，否则为空
  const departmentName = selectedDepartmentId 
  ? departments.find(d => d.id === selectedDepartmentId)?.name || ''
  : '';
    setFormData({
      id: '',
      name: '',
      category: '专业课',
      attribute: '必修',
      type: '必修',
      nature: '理论课',
      englishName: '',
      offeringDepartment: departmentName, // 直接使用部门名称
      departmentName: departmentName, // 同步设置显示用的名称
      isEnabled: '是',
      totalHours: 48,
      theoreticalHours: 48,
      experimentalHours: 0,
      labHours: 0,
      practicalHours: 0,
      otherHours: 0,
      credits: 3,
      weeklyHours: 4,
      isPurePracticalSession: '否'
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setError(null);
    // 隐藏课程列表
    setShowCourseList(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedCourse(null);
    setFormData({
      id: '',
      name: '',
      category: '专业课',
      attribute: '必修',
      type: '必修',
      nature: '理论课',
      englishName: '',
      offeringDepartment: '',
      departmentName: '',
      isEnabled: '是',
      totalHours: 48,
      theoreticalHours: 48,
      experimentalHours: 0,
      labHours: 0,
      practicalHours: 0,
      otherHours: 0,
      credits: 3,
      weeklyHours: 4,
      isPurePracticalSession: '否'
    });
    setError(null);
    // 显示课程列表
    setShowCourseList(true);
  };

  // 保存课程信息
  const handleSaveCourse = async () => {
    if (!formData.name || !formData.offeringDepartment) {
      setError('课程名称和所属院系不能为空');
      return;
    }
  
    // 添加对课程ID的验证
    if (isAddMode && !formData.id) {
      setError('课程代码不能为空');
      return;
    }
  
    try {
      // 准备提交到后端的数据 - 修改这里以确保总是提供courseId
      const courseData = {
        courseId: formData.id, // 无论是编辑还是新增模式，都使用表单中的ID
        courseName: formData.name,
        courseCategory: formData.category,
        courseAttribute: formData.attribute,
        courseType: formData.type,
        courseNature: formData.nature,
        courseEnglishName: formData.englishName,
        courseOfferingDepartment: formData.offeringDepartment,
        isEnabled: formData.isEnabled,
        totalHours: formData.totalHours,
        theoreticalHours: formData.theoreticalHours,
        experimentalHours: formData.experimentalHours,
        labHours: formData.labHours,
        practicalHours: formData.practicalHours,
        otherHours: formData.otherHours,
        credits: formData.credits,
        weeklyHours: formData.weeklyHours,
        isPurePracticalSession: formData.isPurePracticalSession
      };
  
      const url = isEditMode 
        ? `http://localhost:8080/api/courses/${formData.id}`
        : 'http://localhost:8080/api/courses';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 成功保存后，重新获取最新的课程列表
        await fetchData();
        
        setError(null);
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedCourse(null);
        // 显示课程列表
        setShowCourseList(true);
      } else {
        setError(result.message || (isEditMode ? '更新课程失败' : '创建课程失败'));
      }
    } catch (error) {
      console.error(isEditMode ? '更新课程失败:' : '创建课程失败:', error);
      setError(isEditMode ? '更新课程失败，请重试' : '创建课程失败，请重试');
    }
  };

  // 删除课程
  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm(`确定要删除课程 ${course.englishName || course.id} - ${course.name} 吗？`)) {
      try {
        const deleteResponse = await fetch(`http://localhost:8080/api/courses/${course.id}`, {
          method: 'DELETE'
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`HTTP error! Status: ${deleteResponse.status}`);
        }
        
        const result = await deleteResponse.json();
        
        if (result.success) {
          // 成功删除后，重新获取最新的课程列表
          await fetchData();
          
          if (selectedCourse && selectedCourse.id === course.id) {
            setSelectedCourse(null);
            setIsEditMode(false);
          }
        } else {
          alert(result.message || '删除课程失败');
        }
      } catch (error) {
        console.error('删除课程失败:', error);
        alert('删除课程失败，请重试');
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 搜索课程
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      await fetchData();
      return;
    }
    
    try {
      setLoading(true);
      
      // 先尝试本地搜索
      const localFilteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.englishName && course.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        course.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (localFilteredCourses.length > 0) {
        // 使用本地过滤结果
        setLoading(false);
        return;
      }
      
      // 如果本地没有结果，则尝试通过API搜索
      const response = await fetch(`http://localhost:8080/api/courses/search?keyword=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result: ApiResponse<any[]> = await response.json();
      
      if (result.success && result.data) {
        const transformedCourses: Course[] = result.data.map(course => ({
          id: course.courseId,
          name: course.courseName,
          category: course.courseCategory || '',
          attribute: course.courseAttribute || '',
          type: course.courseType || '',
          nature: course.courseNature || '',
          englishName: course.courseEnglishName || '',
          offeringDepartment: course.courseOfferingDepartment || '',
          departmentName: getDepartmentNameById(course.courseOfferingDepartment, departments),
          isEnabled: course.isEnabled || 'Y',
          totalHours: course.totalHours || 0,
          theoreticalHours: course.theoreticalHours || 0,
          experimentalHours: course.experimentalHours || 0,
          labHours: course.labHours || 0,
          practicalHours: course.practicalHours || 0,
          otherHours: course.otherHours || 0,
          credits: course.credits || 0,
          weeklyHours: course.weeklyHours || 0,
          isPurePracticalSession: course.isPurePracticalSession || 'N'
        }));
        
        setCourses(transformedCourses);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('搜索课程失败:', error);
      setError('搜索课程失败，请重试');
      setLoading(false);
    }
  };

  // 切换课程列表显示状态
  const toggleCourseList = () => {
    setShowCourseList(!showCourseList);
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
                  {/* 添加显示/隐藏课程列表的按钮，仅当编辑或添加模式时显示 */}
                  {(isEditMode || isAddMode) && (
                    <button
                      className="show-list-button"
                      onClick={toggleCourseList}
                    >
                      {showCourseList ? '隐藏课程列表' : '显示课程列表'}
                    </button>
                  )}
                </div>
              </div>

              <div className="main-content">
                {/* 控制课程列表的显示/隐藏 */}
                {showCourseList && (
                  <>
                    <div className="search-bar">
                      <form onSubmit={handleSearchSubmit}>
                        <input 
                          type="text" 
                          placeholder="搜索课程名称或代码..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit">搜索</button>
                      </form>
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
                              <th>英文名称</th>
                              <th>课程名称</th>
                              <th>学分</th>
                              <th>学时</th>
                              <th>类型</th>
                              <th>性质</th>
                              <th>所属院系</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCourses.map(course => (
                              <tr key={course.id}>
                                <td>{course.id}</td>
                                <td>{course.englishName}</td>
                                <td>{course.name}</td>
                                <td>{course.credits}</td>
                                <td>{course.totalHours}</td>
                                <td>{course.type}</td>
                                <td>{course.nature}</td>
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
                  </>
                )}

                {/* 表单部分适配显示/隐藏列表后的布局 */}
                {(isEditMode || isAddMode) && (
                  <div className={`course-form ${showCourseList ? 'with-list' : 'no-list'}`}>
                    <div className="form-header">
                      <h3>{isAddMode ? '添加新课程' : '编辑课程'}</h3>
                      <button
                        className="toggle-list-button"
                        onClick={toggleCourseList}
                      >
                        {showCourseList ? '隐藏课程列表' : '显示课程列表'}
                      </button>
                    </div>
                    
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">课程代码 {isAddMode && <span className="required">*</span>}</label>
                        <input 
                          type="text" 
                          id="id" 
                          name="id" 
                          value={formData.id || ''} 
                          onChange={handleInputChange} 
                          disabled={isEditMode} // 编辑模式下代码不可修改
                          required={isAddMode}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="name">课程名称 <span className="required">*</span></label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={formData.name || ''} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="englishName">英文名称</label>
                        <input 
                          type="text" 
                          id="englishName" 
                          name="englishName" 
                          value={formData.englishName || ''} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="credits">学分</label>
                        <input 
                          type="number" 
                          id="credits" 
                          name="credits" 
                          min="0.5" 
                          step="0.5" 
                          max="20" 
                          value={formData.credits || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="totalHours">总学时</label>
                        <input 
                          type="number" 
                          id="totalHours" 
                          name="totalHours" 
                          min="8" 
                          step="2" 
                          value={formData.totalHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="weeklyHours">周课时</label>
                        <input 
                          type="number" 
                          id="weeklyHours" 
                          name="weeklyHours" 
                          min="1" 
                          step="1" 
                          value={formData.weeklyHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="theoreticalHours">理论课时</label>
                        <input 
                          type="number" 
                          id="theoreticalHours" 
                          name="theoreticalHours" 
                          min="0" 
                          step="2" 
                          value={formData.theoreticalHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="experimentalHours">实验课时</label>
                        <input 
                          type="number" 
                          id="experimentalHours" 
                          name="experimentalHours" 
                          min="0" 
                          step="2" 
                          value={formData.experimentalHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="practicalHours">实践课时</label>
                        <input 
                          type="number" 
                          id="practicalHours" 
                          name="practicalHours" 
                          min="0" 
                          step="2" 
                          value={formData.practicalHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="labHours">实验室课时</label>
                        <input 
                          type="number" 
                          id="labHours" 
                          name="labHours" 
                          min="0" 
                          step="2" 
                          value={formData.labHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="otherHours">其他课时</label>
                        <input 
                          type="number" 
                          id="otherHours" 
                          name="otherHours" 
                          min="0" 
                          step="2" 
                          value={formData.otherHours || 0} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="isEnabled">是否启用</label>
                        <select 
                          id="isEnabled" 
                          name="isEnabled" 
                          value={formData.isEnabled || '是'} 
                          onChange={handleInputChange}
                        >
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="offeringDepartment">所属院系 <span className="required">*</span></label>
                        <select 
                          id="offeringDepartment" 
                          name="offeringDepartment" 
                          value={formData.offeringDepartment || ''} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">请选择院系</option>
                          {departments.map(department => (
                            <option key={department.id} value={department.name}>
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
                          value={formData.type || '必修'} 
                          onChange={handleInputChange}
                        >
                          <option value="必修">必修</option>
                          <option value="选修">选修</option>
                          <option value="实验">实验</option>
                          <option value="实践">实践</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nature">课程性质</label>
                        <select 
                          id="nature" 
                          name="nature" 
                          value={formData.nature || '理论课'} 
                          onChange={handleInputChange}
                        >
                          <option value="理论课">理论课</option>
                          <option value="实验课">实验课</option>
                          <option value="实践课">实践课</option>
                          <option value="混合课">混合课</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="category">课程类别</label>
                        <select 
                          id="category" 
                          name="category" 
                          value={formData.category || '专业课'} 
                          onChange={handleInputChange}
                        >
                          <option value="专业课">专业课</option>
                          <option value="公共课">公共课</option>
                          <option value="通识课">通识课</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="attribute">课程属性</label>
                        <select 
                          id="attribute" 
                          name="attribute" 
                          value={formData.attribute || '必修'} 
                          onChange={handleInputChange}
                        >
                          <option value="必修">必修</option>
                          <option value="选修">选修</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="isPurePracticalSession">纯实践课</label>
                        <select 
                          id="isPurePracticalSession" 
                          name="isPurePracticalSession" 
                          value={formData.isPurePracticalSession || '否'} 
                          onChange={handleInputChange}
                        >
                          <option value="否">否</option>
                          <option value="是">是</option>
                        </select>
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
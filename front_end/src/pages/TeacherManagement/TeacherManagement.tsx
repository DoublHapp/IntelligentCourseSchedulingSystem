import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherManagement.scss';

// 教师类型定义，与后端 Teacher 实体对应
interface Teacher {
  id: string; // 对应后端的 employee_id
  name: string;
  gender: string;
  englishName?: string;
  ethnicity?: string;
  jobTitle: string; // 职称
  department: string; // 所属部门
  departmentId?: string; // 用于前端关联
  isExternalHire: string; // 是否外聘
  staffCategory: string; // 教师类别
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// 部门类型定义
interface Department {
  id: number | string;
  name: string;
  code: string;
  description?: string;
}

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 添加一个新的状态来控制教师列表的显示和隐藏
  const [showTeacherList, setShowTeacherList] = useState(true);


  // 表单状态，与后端实体对应
  const [formData, setFormData] = useState<Partial<Teacher>>({
    id: '',
    name: '',
    gender: '男',
    englishName: '',
    ethnicity: '',
    jobTitle: '',
    department: '',
    departmentId: '',
    isExternalHire: 'N',
    staffCategory: ''
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
      // 获取部门数据
      const departmentsResponse = await fetch('http://localhost:8080/api/departments');
      if (!departmentsResponse.ok) {
        throw new Error(`获取部门数据失败: ${departmentsResponse.statusText}`);
      }
      const departmentsResult: ApiResponse<any[]> = await departmentsResponse.json();

      let transformedDepartments: Department[] = []; // 先声明为空数组

      if (departmentsResult.success && departmentsResult.data) {
        transformedDepartments = departmentsResult.data.map(dept => ({
          id: dept.departmentCode,
          name: dept.departmentName,
          code: dept.departmentAbbreviation || String(dept.departmentCode)
        }));
        setDepartments(transformedDepartments); // 保存转换后的部门数据
      } else {
        console.error('获取部门数据失败:', departmentsResult.message);
      }

      // 获取教师数据
      const teachersResponse = await fetch('http://localhost:8080/api/teachers');
      if (!teachersResponse.ok) {
        throw new Error(`获取教师数据失败: ${teachersResponse.statusText}`);
      }
      const teachersResult: ApiResponse<any[]> = await teachersResponse.json();

      if (teachersResult.success && teachersResult.data) {
        // 使用已经转换好的 transformedDepartments
        const transformedTeachers: Teacher[] = teachersResult.data.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          gender: teacher.gender || '男',
          englishName: teacher.englishName,
          ethnicity: teacher.ethnicity,
          jobTitle: teacher.jobTitle || '',
          department: teacher.department || '',
          departmentId: findDepartmentIdByName(teacher.department, transformedDepartments), // 这里使用 transformedDepartments
          isExternalHire: teacher.isExternalHire || 'N',
          staffCategory: teacher.staffCategory || ''
        }));
        setTeachers(transformedTeachers);
      } else {
        console.error('获取教师数据失败:', teachersResult.message);
      }

      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请确保后端服务已启动');
      setLoading(false);
    }
  };

  // 根据部门名称查找部门ID
  const findDepartmentIdByName = (departmentName: string, deptList: Department[]): string => {
    const department = deptList.find(d => d.name === departmentName);
    return department ? String(department.id) : '';
  };

  // 根据搜索条件和选中的部门筛选教师
  const filteredTeachers = teachers.filter(teacher => {
    const matchesDepartment = selectedDepartmentId ?
      teacher.departmentId === selectedDepartmentId : true;
    const matchesSearch = searchTerm
      ? teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesDepartment && matchesSearch;
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'departmentId') {
      const selectedDept = departments.find(d => d.id.toString() === value);
      setFormData({
        ...formData,
        [name]: value,
        department: selectedDept ? selectedDept.name : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 选择教师进行编辑
  const handleEditTeacher = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setError(null);

    try {
      // 获取教师详情
      const response = await fetch(`http://localhost:8080/api/teachers/${teacher.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.success && result.data) {
        const teacherData = result.data;
        setFormData({
          id: teacherData.id,
          name: teacherData.name,
          gender: teacherData.gender || '男',
          englishName: teacherData.englishName || '',
          ethnicity: teacherData.ethnicity || '',
          jobTitle: teacherData.jobTitle || '',
          department: teacherData.department || '',
          departmentId: findDepartmentIdByName(teacherData.department, departments),
          isExternalHire: teacherData.isExternalHire || 'N',
          staffCategory: teacherData.staffCategory || ''
        });
      } else {
        // 回退到基本数据
        setFormData({
          id: teacher.id,
          name: teacher.name,
          gender: teacher.gender,
          englishName: teacher.englishName,
          ethnicity: teacher.ethnicity,
          jobTitle: teacher.jobTitle,
          department: teacher.department,
          departmentId: teacher.departmentId,
          isExternalHire: teacher.isExternalHire,
          staffCategory: teacher.staffCategory
        });
      }
    } catch (error) {
      console.error('获取教师详细信息失败:', error);
      // 回退到基本数据
      setFormData({
        id: teacher.id,
        name: teacher.name,
        gender: teacher.gender,
        englishName: teacher.englishName,
        ethnicity: teacher.ethnicity,
        jobTitle: teacher.jobTitle,
        department: teacher.department,
        departmentId: teacher.departmentId,
        isExternalHire: teacher.isExternalHire,
        staffCategory: teacher.staffCategory
      });
    }

    setIsEditMode(true);
    setIsAddMode(false);
    // 隐藏教师列表
    setShowTeacherList(false);
  };

  // 准备添加新教师
  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setFormData({
      id: '',
      name: '',
      gender: '男',
      englishName: '',
      ethnicity: '',
      jobTitle: '',
      department: selectedDepartmentId ? departments.find(d => d.id.toString() === selectedDepartmentId)?.name : '',
      departmentId: selectedDepartmentId || '',
      isExternalHire: 'N',
      staffCategory: ''
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setError(null);
    // 隐藏教师列表
    setShowTeacherList(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedTeacher(null);
    setFormData({
      id: '',
      name: '',
      gender: '男',
      englishName: '',
      ethnicity: '',
      jobTitle: '',
      department: '',
      departmentId: '',
      isExternalHire: 'N',
      staffCategory: ''
    });
    setError(null);
    // 显示教师列表
    setShowTeacherList(true);
  };

  // 保存教师信息
  const handleSaveTeacher = async () => {
    if (!formData.id || !formData.name || !formData.department) {
      setError('工号、姓名和所属部门不能为空');
      return;
    }

    try {
      // 准备提交到后端的数据
      const teacherData = {
        id: formData.id,
        name: formData.name,
        gender: formData.gender,
        englishName: formData.englishName || '',
        ethnicity: formData.ethnicity || '',
        jobTitle: formData.jobTitle || '',
        department: formData.department,
        isExternalHire: formData.isExternalHire || 'N',
        staffCategory: formData.staffCategory || ''
      };

      const url = isEditMode
        ? `http://localhost:8080/api/teachers/${formData.id}`
        : 'http://localhost:8080/api/teachers';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 成功保存后，重新获取最新的教师列表
        await fetchData();

        setError(null);
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedTeacher(null);
        // 保存成功后显示教师列表
        setShowTeacherList(true);
      } else {
        setError(result.message || (isEditMode ? '更新教师失败' : '创建教师失败'));
      }
    } catch (error) {
      console.error(isEditMode ? '更新教师失败:' : '创建教师失败:', error);
      setError(isEditMode ? '更新教师失败，请重试' : '创建教师失败，请重试');
    }
  };

  // 删除教师
  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (window.confirm(`确定要删除教师 ${teacher.name} (${teacher.id}) 吗？`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/teachers/${teacher.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // 成功删除后，重新获取最新的教师列表
          await fetchData();

          if (selectedTeacher && selectedTeacher.id === teacher.id) {
            setSelectedTeacher(null);
            setIsEditMode(false);
          }
        } else {
          alert(result.message || '删除教师失败');
        }
      } catch (error) {
        console.error('删除教师失败:', error);
        alert('删除教师失败，请重试');
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 职称选项
  const titleOptions = ['教授', '副教授', '讲师', '助教'];

  // 执行搜索
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      // 清空搜索条件时重新获取所有数据
      setSearchTerm('');
      await fetchData();
      return;
    }

    // 先使用前端过滤
    const term = searchTerm.trim().toLowerCase();
    const localFilteredTeachers = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(term) ||
      teacher.id.toLowerCase().includes(term)
    );

    if (localFilteredTeachers.length > 0) {
      // 有本地匹配结果，直接返回，保持searchTerm状态不变
      // 这样filteredTeachers会自动更新显示正确结果
      return;
    }

    // 本地没有匹配结果，尝试通过API搜索（如果API可能不稳定，可以注释掉这部分）
    try {
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8080/api/teachers/search?keyword=${encodeURIComponent(term)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: ApiResponse<any[]> = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const transformedTeachers: Teacher[] = result.data.map(teacher => ({
            id: teacher.id,
            name: teacher.name,
            gender: teacher.gender || '男',
            englishName: teacher.englishName,
            ethnicity: teacher.ethnicity,
            jobTitle: teacher.jobTitle || '',
            department: teacher.department || '',
            departmentId: findDepartmentIdByName(teacher.department, departments),
            isExternalHire: teacher.isExternalHire || 'N',
            staffCategory: teacher.staffCategory || ''
          }));

          setTeachers(transformedTeachers);
        } else {
          // API没有返回结果，显示"暂无教师信息"
          setError(null);
        }
      } catch (error) {
        console.error('API搜索失败，将显示本地过滤结果:', error);
        // API错误时不显示错误信息，仅打印到控制台，让用户体验更流畅
      }

      setLoading(false);
    } catch (error) {
      console.error('搜索过程出现错误:', error);
      setLoading(false);
    }
  };


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
                        className={selectedDepartmentId === department.id.toString() ? 'active' : ''}
                        onClick={() => setSelectedDepartmentId(department.id.toString())}
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
                  {(isEditMode || isAddMode) && !showTeacherList && (
                    <button
                      className="show-list-button"
                      onClick={() => setShowTeacherList(true)}
                    >
                      显示教师列表
                    </button>
                  )}
                </div>
              </div>

              <div className="main-content">
                {/* 关键修复：显示教师列表 */}
                {showTeacherList && (
                  <>
                    <div className="search-bar">
                      <form onSubmit={handleSearchSubmit}>
                        <input
                          type="text"
                          placeholder="搜索教师姓名或工号..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit">搜索</button>
                      </form>
                    </div>

                    <div className="teachers-list">
                      <h2>
                        {selectedDepartmentId
                          ? `${departments.find(d => d.id.toString() === selectedDepartmentId)?.name} 的教师`
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
                              <th>是否外聘</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTeachers.map(teacher => (
                              <tr key={teacher.id}>
                                <td>{teacher.id}</td>
                                <td>{teacher.name}</td>
                                <td>{teacher.gender}</td>
                                <td>{teacher.jobTitle}</td>
                                <td>{teacher.department}</td>
                                <td>{teacher.isExternalHire === '是' ? '是' : '否'}</td>
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
                  </>
                )}

                {/* 关键修复：始终显示表单，不受列表显示状态影响 */}
                {(isEditMode || isAddMode) && (
                  <div className={`teacher-form ${showTeacherList ? 'with-list' : 'no-list'}`}>
                    <div className="form-header">
                      <h3>{isAddMode ? '添加新教师' : '编辑教师'}</h3>
                      <button
                        className="toggle-list-button"
                        onClick={() => setShowTeacherList(!showTeacherList)}
                      >
                        {showTeacherList ? '隐藏教师列表' : '显示教师列表'}
                      </button>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">工号 <span className="required">*</span></label>
                        <input
                          type="text"
                          id="id"
                          name="id"
                          value={formData.id}
                          onChange={handleInputChange}
                          disabled={isEditMode} // 编辑模式下工号不可修改
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
                        <label htmlFor="jobTitle">职称</label>
                        <select
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
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
                        <label htmlFor="isExternalHire">是否外聘</label>
                        <select
                          id="isExternalHire"
                          name="isExternalHire"
                          value={formData.isExternalHire}
                          onChange={handleInputChange}
                        >
                          <option value="否">否</option>
                          <option value="是">是</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="englishName">英文名</label>
                        <input
                          type="text"
                          id="englishName"
                          name="englishName"
                          value={formData.englishName || ''}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="ethnicity">民族</label>
                        <input
                          type="text"
                          id="ethnicity"
                          name="ethnicity"
                          value={formData.ethnicity || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="staffCategory">教师类别</label>
                        <input
                          type="text"
                          id="staffCategory"
                          name="staffCategory"
                          value={formData.staffCategory || ''}
                          onChange={handleInputChange}
                        />
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentManagement.scss';

// 部门类型定义，根据后端 Department 实体类调整
interface Department {
  id: number; // 用于前端显示，实际对应后端的 departmentCode
  name: string; // 对应后端的 departmentName
  code: string; // 对应后端的 departmentAbbreviation
  description?: string; // 对应后端的 remarks
  parentId?: string; // 对应后端的 parentDepartment
  parentName?: string; // 用于前端显示父部门名称
  level?: number; // 计算得到的级别
  designatedTeachingBuilding?: string;
  isCourseOfferingDepartment?: string;
  isCourseAttendingDepartment?: string;
  isEnabled?: string;
  isCourseResearchOffice?: string;
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 表单状态，扩展以匹配后端字段
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    description: '',
    parentId: undefined,
    designatedTeachingBuilding: '',
    isCourseOfferingDepartment: 'N',
    isCourseAttendingDepartment: 'N',
    isEnabled: 'Y',
    isCourseResearchOffice: 'N'
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

      // 只有管理员可以访问部门管理页面
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

  // 获取部门数据 - 从后端API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/departments');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse<any[]> = await response.json();

      if (result.success && result.data) {
        // 转换后端数据格式为前端格式
        const transformedDepartments: Department[] = result.data.map(dept => ({
          id: dept.departmentCode, // 将后端的 departmentCode 映射到前端的 id
          name: dept.departmentName,
          code: dept.departmentAbbreviation,
          description: dept.remarks,
          parentId: dept.parentDepartment,
          parentName: '', // 后续会填充此字段
          level: dept.parentDepartment ? 2 : 1, // 如果有父部门则为二级部门，否则为一级部门
          designatedTeachingBuilding: dept.designatedTeachingBuilding,
          isCourseOfferingDepartment: dept.isCourseOfferingDepartment,
          isCourseAttendingDepartment: dept.isCourseAttendingDepartment,
          isEnabled: dept.isEnabled,
          isCourseResearchOffice: dept.isCourseResearchOffice
        }));

        // 填充父部门名称
        transformedDepartments.forEach(dept => {
          if (dept.parentId) {
            const parentDept = transformedDepartments.find(d => d.id.toString() === dept.parentId);
            if (parentDept) {
              dept.parentName = parentDept.name;
            }
          }
        });

        setDepartments(transformedDepartments);
      } else {
        setError(result.message || '获取部门数据失败');
      }

      setLoading(false);
    } catch (error) {
      console.error('加载部门数据失败:', error);
      setError('加载部门数据失败，请确保后端服务已启动');
      setLoading(false);
    }
  };

  // 根据搜索条件筛选部门
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取顶层部门（学院）
  const topLevelDepartments = departments.filter(dept => dept.level === 1 || !dept.parentId);

  // 获取某个部门的子部门
  const getChildDepartments = (parentId: number) => {
    return departments.filter(dept => dept.parentId === parentId.toString());
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 选择部门进行编辑 - 从后端获取详细信息
  const handleEditDepartment = async (department: Department) => {
    setSelectedDepartment(department);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/departments/${department.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.success && result.data) {
        const deptData = result.data;
        setFormData({
          name: deptData.departmentName,
          code: deptData.departmentAbbreviation,
          description: deptData.remarks,
          parentId: deptData.parentDepartment,
          designatedTeachingBuilding: deptData.designatedTeachingBuilding || '',
          isCourseOfferingDepartment: deptData.isCourseOfferingDepartment || 'N',
          isCourseAttendingDepartment: deptData.isCourseAttendingDepartment || 'N',
          isEnabled: deptData.isEnabled || 'Y',
          isCourseResearchOffice: deptData.isCourseResearchOffice || 'N'
        });
      } else {
        // 回退到基本数据
        setFormData({
          name: department.name,
          code: department.code,
          description: department.description,
          parentId: department.parentId,
          designatedTeachingBuilding: department.designatedTeachingBuilding || '',
          isCourseOfferingDepartment: department.isCourseOfferingDepartment || 'N',
          isCourseAttendingDepartment: department.isCourseAttendingDepartment || 'N',
          isEnabled: department.isEnabled || 'Y',
          isCourseResearchOffice: department.isCourseResearchOffice || 'N'
        });
      }
    } catch (error) {
      console.error('获取部门详细信息失败:', error);
      // 回退到基本数据
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description,
        parentId: department.parentId,
        designatedTeachingBuilding: department.designatedTeachingBuilding || '',
        isCourseOfferingDepartment: department.isCourseOfferingDepartment || 'N',
        isCourseAttendingDepartment: department.isCourseAttendingDepartment || 'N',
        isEnabled: department.isEnabled || 'Y',
        isCourseResearchOffice: department.isCourseResearchOffice || 'N'
      });
    }

    setIsEditMode(true);
    setIsAddMode(false);
  };

  // 准备添加新部门
  const handleAddDepartment = (parentId?: number) => {
    setSelectedDepartment(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      parentId: parentId ? String(parentId) : undefined,
      designatedTeachingBuilding: '',
      isCourseOfferingDepartment: 'N',
      isCourseAttendingDepartment: 'N',
      isEnabled: 'Y',
      isCourseResearchOffice: 'N'
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setError(null);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedDepartment(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      parentId: undefined,
      designatedTeachingBuilding: '',
      isCourseOfferingDepartment: 'N',
      isCourseAttendingDepartment: 'N',
      isEnabled: 'Y',
      isCourseResearchOffice: 'N'
    });
    setError(null);
  };

  // 保存部门信息 - 与后端API对接
  const handleSaveDepartment = async () => {
    if (!formData.name || !formData.code) {
      setError('部门名称和代码不能为空');
      return;
    }

    try {
      // 准备发送到后端的数据
      const departmentData = {
        departmentCode: isEditMode && selectedDepartment ? selectedDepartment.id : undefined,
        departmentName: formData.name,
        departmentAbbreviation: formData.code,
        remarks: formData.description,
        parentDepartment: formData.parentId || null,
        designatedTeachingBuilding: formData.designatedTeachingBuilding,
        isCourseOfferingDepartment: formData.isCourseOfferingDepartment,
        isCourseAttendingDepartment: formData.isCourseAttendingDepartment,
        isEnabled: formData.isEnabled,
        isCourseResearchOffice: formData.isCourseResearchOffice
      };

      const url = isEditMode && selectedDepartment
        ? `http://localhost:8080/api/departments/${selectedDepartment.id}`
        : 'http://localhost:8080/api/departments';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(departmentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 成功保存后，重新获取最新的部门列表
        await fetchData();
        setError(null);
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedDepartment(null);
      } else {
        setError(result.message || (isEditMode ? '更新部门失败' : '创建部门失败'));
      }
    } catch (error) {
      console.error(isEditMode ? '更新部门失败:' : '创建部门失败:', error);
      setError(isEditMode ? '更新部门失败，请重试' : '创建部门失败，请重试');
    }
  };

  // 删除部门 - 与后端API对接
  const handleDeleteDepartment = async (department: Department) => {
    try {
      // 先检查是否有子部门
      const childDepts = departments.filter(dept => dept.parentId === department.id.toString());

      if (childDepts.length > 0) {
        alert(`无法删除部门 "${department.name}"，因为它有子部门。请先删除子部门。`);
        return;
      }

      if (window.confirm(`确定要删除部门 "${department.name}" 吗？`)) {
        const response = await fetch(`http://localhost:8080/api/departments/${department.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // 成功删除后，重新获取最新的部门列表
          await fetchData();

          if (selectedDepartment && selectedDepartment.id === department.id) {
            setSelectedDepartment(null);
            setIsEditMode(false);
          }
        } else {
          alert(result.message || '删除部门失败');
        }
      }
    } catch (error) {
      console.error('删除部门失败:', error);
      alert('删除部门失败，请重试');
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 执行搜索
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      await fetchData();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/departments/search?keyword=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse<any[]> = await response.json();

      if (result.success && result.data) {
        // 转换后端数据格式为前端格式
        const transformedDepartments = result.data.map(dept => ({
          id: dept.departmentCode,
          name: dept.departmentName,
          code: dept.departmentAbbreviation,
          description: dept.remarks,
          parentId: dept.parentDepartment,
          parentName: '', // 后续会填充此字段
          level: dept.parentDepartment ? 2 : 1,
          designatedTeachingBuilding: dept.designatedTeachingBuilding,
          isCourseOfferingDepartment: dept.isCourseOfferingDepartment,
          isCourseAttendingDepartment: dept.isCourseAttendingDepartment,
          isEnabled: dept.isEnabled,
          isCourseResearchOffice: dept.isCourseResearchOffice
        }));

        // 填充父部门名称
        for (const dept of transformedDepartments) {
          if (dept.parentId) {
            // 尝试从搜索结果中找父部门
            let parentDept = transformedDepartments.find(d => d.id.toString() === dept.parentId);

            // 如果在搜索结果中找不到，则需要单独请求
            if (!parentDept) {
              try {
                const parentResponse = await fetch(`http://localhost:8080/api/departments/${dept.parentId}`);
                if (parentResponse.ok) {
                  const parentResult: ApiResponse<any> = await parentResponse.json();
                  if (parentResult.success && parentResult.data) {
                    dept.parentName = parentResult.data.departmentName;
                  }
                }
              } catch (error) {
                console.error('获取父部门详情失败:', error);
              }
            } else {
              dept.parentName = parentDept.name;
            }
          }
        }

        setDepartments(transformedDepartments);
      } else {
        setError(result.message || '搜索部门失败');
      }

      setLoading(false);
    } catch (error) {
      console.error('搜索部门失败:', error);
      setError('搜索部门失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="department-management">
      <header className="department-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>部门管理</h1>
        </div>
      </header>

      <div className="department-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="management-container">
              <div className="department-tools">
                <form className="search-bar" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="搜索部门名称或代码..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit">搜索</button>
                </form>

                <button className="add-department-button" onClick={() => handleAddDepartment()}>
                  添加顶级部门
                </button>
              </div>

              {searchTerm ? (
                <div className="search-results">
                  <h2>搜索结果</h2>

                  {filteredDepartments.length === 0 ? (
                    <div className="no-departments">未找到相关部门</div>
                  ) : (
                    <table className="departments-table">
                      <thead>
                        <tr>
                          <th>部门名称</th>
                          <th>部门代码</th>
                          <th>上级部门</th>
                          <th>描述</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepartments.map(department => (
                          <tr key={department.id}>
                            <td>{department.name}</td>
                            <td>{department.code}</td>
                            <td>{department.parentName || '-'}</td>
                            <td>{department.description || '-'}</td>
                            <td className="actions-cell">
                              <button
                                className="edit-button"
                                onClick={() => handleEditDepartment(department)}
                              >
                                编辑
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => handleDeleteDepartment(department)}
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
              ) : (
                <div className="departments-tree">
                  <h2>部门结构</h2>

                  {topLevelDepartments.length === 0 ? (
                    <div className="no-departments">暂无部门信息</div>
                  ) : (
                    <div className="departments-list">
                      {topLevelDepartments.map(department => (
                        <div key={department.id} className="department-item">
                          <div className="department-header">
                            <h3>{department.name} <span className="department-code">({department.code})</span></h3>
                            <div className="department-actions">
                              <button onClick={() => handleEditDepartment(department)}>编辑</button>
                              <button onClick={() => handleDeleteDepartment(department)}>删除</button>
                              <button onClick={() => handleAddDepartment(department.id)}>添加子部门</button>
                            </div>
                          </div>

                          {department.description && (
                            <p className="department-description">{department.description}</p>
                          )}

                          <div className="sub-departments">
                            {getChildDepartments(department.id).map(childDept => (
                              <div key={childDept.id} className="sub-department-item">
                                <div className="sub-department-header">
                                  <h4>{childDept.name} <span className="department-code">({childDept.code})</span></h4>
                                  <div className="department-actions">
                                    <button onClick={() => handleEditDepartment(childDept)}>编辑</button>
                                    <button onClick={() => handleDeleteDepartment(childDept)}>删除</button>
                                  </div>
                                </div>
                                {childDept.description && (
                                  <p className="department-description">{childDept.description}</p>
                                )}
                              </div>
                            ))}
                            {getChildDepartments(department.id).length === 0 && (
                              <div className="no-sub-departments">暂无子部门</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(isEditMode || isAddMode) && (
                <div className="department-form">
                  <h3>{isAddMode ? '添加部门' : '编辑部门'}</h3>

                  {error && <div className="form-error">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="name">部门名称 <span className="required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">部门代码 <span className="required">*</span></label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                    <small>请使用唯一的字母代码，如"CS"、"MATH"等</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="parentId">上级部门</label>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formData.parentId || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">无（顶级部门）</option>
                      {topLevelDepartments
                        .filter(dept => !selectedDepartment || dept.id !== selectedDepartment.id)
                        .map(department => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">描述</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="designatedTeachingBuilding">指定教学楼</label>
                    <input
                      type="text"
                      id="designatedTeachingBuilding"
                      name="designatedTeachingBuilding"
                      value={formData.designatedTeachingBuilding || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="isEnabled">启用状态</label>
                    <select
                      id="isEnabled"
                      name="isEnabled"
                      value={formData.isEnabled}
                      onChange={handleInputChange}
                    >
                      <option value="Y">启用</option>
                      <option value="N">禁用</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="isCourseOfferingDepartment">是否为课程开设单位</label>
                    <select
                      id="isCourseOfferingDepartment"
                      name="isCourseOfferingDepartment"
                      value={formData.isCourseOfferingDepartment}
                      onChange={handleInputChange}
                    >
                      <option value="Y">是</option>
                      <option value="N">否</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="isCourseAttendingDepartment">是否为课程学习单位</label>
                    <select
                      id="isCourseAttendingDepartment"
                      name="isCourseAttendingDepartment"
                      value={formData.isCourseAttendingDepartment}
                      onChange={handleInputChange}
                    >
                      <option value="Y">是</option>
                      <option value="N">否</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="isCourseResearchOffice">是否为课程研究室</label>
                    <select
                      id="isCourseResearchOffice"
                      name="isCourseResearchOffice"
                      value={formData.isCourseResearchOffice}
                      onChange={handleInputChange}
                    >
                      <option value="Y">是</option>
                      <option value="N">否</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button
                      className="save-button"
                      onClick={handleSaveDepartment}
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
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;
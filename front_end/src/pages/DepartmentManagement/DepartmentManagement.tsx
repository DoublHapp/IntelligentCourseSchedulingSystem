import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentManagement.scss';

// 部门类型定义
interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  level?: number;
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
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    description: '',
    parentId: undefined
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

  // 获取部门数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 在实际项目中，这里应该调用API获取数据
      // 例如: const response = await fetch('http://localhost:8080/api/departments');
      // const data = await response.json();
      
      // 这里使用模拟数据，基于示例数据文件夹中的内容构建
      const mockDepartments: Department[] = [
        { 
          id: 1, 
          name: '计算机科学与技术学院', 
          code: 'CS',
          description: '计算机科学、软件工程、网络工程等专业',
          level: 1
        },
        { 
          id: 2, 
          name: '软件工程系', 
          code: 'SE',
          description: '软件开发与工程管理',
          parentId: 1,
          parentName: '计算机科学与技术学院',
          level: 2
        },
        { 
          id: 3, 
          name: '网络工程系', 
          code: 'NE',
          description: '网络技术与安全',
          parentId: 1,
          parentName: '计算机科学与技术学院',
          level: 2
        },
        { 
          id: 4, 
          name: '数学学院', 
          code: 'MATH',
          description: '数学、统计学专业',
          level: 1
        },
        { 
          id: 5, 
          name: '应用数学系', 
          code: 'AM',
          description: '应用数学研究',
          parentId: 4,
          parentName: '数学学院',
          level: 2
        },
        { 
          id: 6, 
          name: '统计学系', 
          code: 'STAT',
          description: '统计学与数据分析',
          parentId: 4,
          parentName: '数学学院',
          level: 2
        },
        { 
          id: 7, 
          name: '物理学院', 
          code: 'PHY',
          description: '物理学研究与教学',
          level: 1
        },
        { 
          id: 8, 
          name: '外国语学院', 
          code: 'FL',
          description: '外语教学与研究',
          level: 1
        },
        { 
          id: 9, 
          name: '英语系', 
          code: 'ENG',
          description: '英语语言文学',
          parentId: 8,
          parentName: '外国语学院',
          level: 2
        }
      ];

      setDepartments(mockDepartments);
      setLoading(false);
    } catch (error) {
      console.error('加载部门数据失败:', error);
      setError('加载部门数据失败，请重试');
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
    return departments.filter(dept => dept.parentId === parentId);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 选择部门进行编辑
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,
      parentId: department.parentId
    });
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
      parentId: parentId
    });
    setIsAddMode(true);
    setIsEditMode(false);
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
      parentId: undefined
    });
  };

  // 保存部门信息
  const handleSaveDepartment = () => {
    if (!formData.name || !formData.code) {
      setError('部门名称和代码不能为空');
      return;
    }

    // 检查代码是否重复（除了当前编辑的部门）
    const isDuplicateCode = departments.some(dept => 
      dept.code === formData.code && 
      (isAddMode || (isEditMode && selectedDepartment && dept.id !== selectedDepartment.id))
    );

    if (isDuplicateCode) {
      setError('部门代码已存在，请使用不同的代码');
      return;
    }

    if (isAddMode) {
      // 添加新部门
      const parentDept = formData.parentId ? departments.find(d => d.id === formData.parentId) : undefined;
      
      const newDepartment: Department = {
        id: Math.max(...departments.map(d => d.id), 0) + 1,
        name: formData.name || '',
        code: formData.code || '',
        description: formData.description,
        parentId: formData.parentId,
        parentName: parentDept?.name,
        level: parentDept ? 2 : 1
      };
      
      setDepartments([...departments, newDepartment]);
      setError(null);
      setIsAddMode(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        parentId: undefined
      });
    } else if (isEditMode && selectedDepartment) {
      // 更新现有部门
      const parentDept = formData.parentId ? departments.find(d => d.id === formData.parentId) : undefined;
      
      const updatedDepartments = departments.map(dept => {
        if (dept.id === selectedDepartment.id) {
          return {
            ...dept,
            name: formData.name || dept.name,
            code: formData.code || dept.code,
            description: formData.description,
            parentId: formData.parentId,
            parentName: parentDept?.name,
            level: parentDept ? 2 : 1
          };
        }
        // 如果该部门是被编辑部门的子部门，也需要更新其parentName
        if (dept.parentId === selectedDepartment.id) {
          return {
            ...dept,
            parentName: formData.name || dept.parentName
          };
        }
        return dept;
      });
      
      setDepartments(updatedDepartments);
      setError(null);
      setIsEditMode(false);
      setSelectedDepartment(null);
    }
  };

  // 删除部门
  const handleDeleteDepartment = (department: Department) => {
    // 检查是否有子部门
    const hasChildren = departments.some(dept => dept.parentId === department.id);
    
    if (hasChildren) {
      alert(`无法删除部门 "${department.name}"，因为它有子部门。请先删除子部门。`);
      return;
    }
    
    if (window.confirm(`确定要删除部门 "${department.name}" 吗？`)) {
      const updatedDepartments = departments.filter(d => d.id !== department.id);
      setDepartments(updatedDepartments);
      
      if (selectedDepartment && selectedDepartment.id === department.id) {
        setSelectedDepartment(null);
        setIsEditMode(false);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="搜索部门名称或代码..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
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
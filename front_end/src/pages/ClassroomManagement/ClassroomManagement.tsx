import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassroomManagement.scss';

// 教学楼类型定义
interface Building {
  id: string;
  name: string;
  location?: string;
  floors?: number;
}

// 教室类型定义，与后端Classroom实体一致
interface Classroom {
  classroomId: string;
  classroomName: string;
  campus: string;
  teachingBuilding: string;
  floor: string;
  classroomLabel: string;
  classroomType: string;
  examSeatingCapacity: string;
  maximumClassSeatingCapacity: number;
  isHasAirConditioning: string;
  isEnabled: string;
  classroomDescription: string;
  managementDepartment: string;
  weeklyScheduleHours: string;
  classroomArea: string;
  deskChairType: string;
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const ClassroomManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClassroomList, setShowClassroomList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Classroom>>({
    classroomId: '',
    classroomName: '',
    campus: '',
    teachingBuilding: '',
    floor: '',
    classroomLabel: '',
    classroomType: '普通教室',
    examSeatingCapacity: '',
    maximumClassSeatingCapacity: 0,
    isHasAirConditioning: '否',
    isEnabled: '是',
    classroomDescription: '',
    managementDepartment: '',
    weeklyScheduleHours: '',
    classroomArea: '',
    deskChairType: ''
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
      
      // 只有管理员可以访问教室管理页面
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

  // 获取教学楼和教室数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取所有教室数据
      const response = await fetch('http://localhost:8080/api/classrooms');
      if (!response.ok) {
        throw new Error(`获取教室数据失败: ${response.status}`);
      }
      
      const result: ApiResponse<Classroom[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || '获取教室数据失败');
      }
      
      // 确保每个字段都有默认值，防止 null 导致错误
      const processedData = result.data.map(classroom => ({
        ...classroom,
        classroomName: classroom.classroomName || '',
        classroomId: classroom.classroomId || '',
        campus: classroom.campus || '',
        teachingBuilding: classroom.teachingBuilding || '',
        floor: classroom.floor || '',
        classroomLabel: classroom.classroomLabel || '',
        classroomType: classroom.classroomType || '普通教室',
        isEnabled: classroom.isEnabled || '否',
        isHasAirConditioning: classroom.isHasAirConditioning || '否'
      }));
      
      // 设置教室数据
      setClassrooms(processedData);
      
      // 从教室数据中提取教学楼信息
      const uniqueBuildings: Map<string, Building> = new Map();
      
      processedData.forEach(classroom => {
        if (classroom.teachingBuilding && !uniqueBuildings.has(classroom.teachingBuilding)) {
          uniqueBuildings.set(classroom.teachingBuilding, {
            id: classroom.teachingBuilding,
            name: classroom.teachingBuilding
          });
        }
      });
      
      // 转换为数组
      const buildingsList: Building[] = Array.from(uniqueBuildings.values());
      
      setBuildings(buildingsList);
      
      // 如果有教学楼，默认选中第一个
      if (buildingsList.length > 0) {
        setSelectedBuildingId(buildingsList[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(`加载数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setLoading(false);
    }
  };

// 修复 filteredClassrooms 函数，添加空值检查
const filteredClassrooms = classrooms.filter(classroom => {
  const matchesBuildingId = selectedBuildingId ? classroom.teachingBuilding === selectedBuildingId : true;
  const term = searchTerm.trim().toLowerCase();
  
  // 添加空值检查，避免调用 toLowerCase() 时出错
  const matchesSearch = term
    ? (classroom.classroomName?.toLowerCase() || '').includes(term) ||
      (classroom.classroomId?.toLowerCase() || '').includes(term) ||
      (classroom.teachingBuilding?.toLowerCase() || '').includes(term) ||
      (classroom.campus?.toLowerCase() || '').includes(term)
    : true;

  return matchesBuildingId && matchesSearch;
});



    // 处理搜索提交
// 同样需要修复 handleSearchSubmit 函数中的类似问题
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
  
  // 添加空值检查
  const localFilteredClassrooms = classrooms.filter(classroom =>
    (classroom.classroomName?.toLowerCase() || '').includes(term) ||
    (classroom.classroomId?.toLowerCase() || '').includes(term) ||
    (classroom.teachingBuilding?.toLowerCase() || '').includes(term) ||
    (classroom.campus?.toLowerCase() || '').includes(term)
  );

  if (localFilteredClassrooms.length > 0) {
    // 有本地匹配结果，直接返回
    return;
  }

  // 本地没有匹配结果，尝试通过API搜索
  try {
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/classrooms/search?keyword=${encodeURIComponent(term)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: ApiResponse<Classroom[]> = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // 确保返回的数据每个字段都不为空
        const processedData = result.data.map(classroom => ({
          ...classroom,
          classroomName: classroom.classroomName || '',
          classroomId: classroom.classroomId || '',
          campus: classroom.campus || '',
          teachingBuilding: classroom.teachingBuilding || '',
          floor: classroom.floor || '',
          classroomLabel: classroom.classroomLabel || '',
          classroomType: classroom.classroomType || '普通教室',
          isEnabled: classroom.isEnabled || '否',
          isHasAirConditioning: classroom.isHasAirConditioning || '否'
        }));
        setClassrooms(processedData);
      } else {
        // API没有返回结果，显示"暂无教室信息"但不显示错误
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

 // 切换教室列表显示状态
const toggleClassroomList = () => {
  setShowClassroomList(!showClassroomList);
};



  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkboxInput.checked ? '是' : '否'
      });
    } else if (name === 'maximumClassSeatingCapacity') {
      // 确保容量是数字
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // 选择教室进行编辑
  const handleEditClassroom = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setError(null);
    
    try {
      // 获取教室详情
      const response = await fetch(`http://localhost:8080/api/classrooms/${classroom.classroomId}`);
      
      if (!response.ok) {
        throw new Error(`获取教室详情失败: ${response.status}`);
      }
      
      const result: ApiResponse<Classroom> = await response.json();
      
      if (result.success && result.data) {
        setFormData({...result.data});
      } else {
        // 回退到基本数据
        setFormData({...classroom});
      }
    } catch (error) {
      console.error('获取教室详情失败:', error);
      // 出错时回退到基本数据
      setFormData({...classroom});
    }
    
    setIsEditMode(true);
    setIsAddMode(false);
    // 隐藏教室列表
  setShowClassroomList(false);
  };

  // 准备添加新教室
  const handleAddClassroom = () => {
    setSelectedClassroom(null);
    setFormData({
      classroomId: '',
      classroomName: '',
      campus: '',
      teachingBuilding: selectedBuildingId || '',
      floor: '',
      classroomLabel: '',
      classroomType: '普通教室',
      examSeatingCapacity: '',
      maximumClassSeatingCapacity: 0,
      isHasAirConditioning: '否',
      isEnabled: '是',
      classroomDescription: '',
      managementDepartment: '',
      weeklyScheduleHours: '',
      classroomArea: '',
      deskChairType: ''
    });
    setIsAddMode(true);
    setIsEditMode(false);
    setError(null);
    // 隐藏教室列表
  setShowClassroomList(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedClassroom(null);
    setFormData({
      classroomId: '',
      classroomName: '',
      campus: '',
      teachingBuilding: selectedBuildingId || '',
      floor: '',
      classroomLabel: '',
      classroomType: '普通教室',
      examSeatingCapacity: '',
      maximumClassSeatingCapacity: 0,
      isHasAirConditioning: '否',
      isEnabled: '是',
      classroomDescription: '',
      managementDepartment: '',
      weeklyScheduleHours: '',
      classroomArea: '',
      deskChairType: ''
    });
    setError(null);
      // 显示教室列表
  setShowClassroomList(true);
  };

  // 保存教室信息
  const handleSaveClassroom = async () => {
    if (!formData.classroomId || !formData.classroomName || !formData.teachingBuilding) {
      setError('教室ID、名称和所属教学楼不能为空');
      return;
    }

    try {
      const classroomData = {
        classroomId: formData.classroomId,
        classroomName: formData.classroomName,
        campus: formData.campus || '',
        teachingBuilding: formData.teachingBuilding,
        floor: formData.floor || '',
        classroomLabel: formData.classroomLabel || '',
        classroomType: formData.classroomType || '普通教室',
        examSeatingCapacity: formData.examSeatingCapacity || '',
        maximumClassSeatingCapacity: formData.maximumClassSeatingCapacity || 0,
        isHasAirConditioning: formData.isHasAirConditioning ,
        isEnabled: formData.isEnabled ,
        classroomDescription: formData.classroomDescription || '',
        managementDepartment: formData.managementDepartment || '',
        weeklyScheduleHours: formData.weeklyScheduleHours || '',
        classroomArea: formData.classroomArea || '',
        deskChairType: formData.deskChairType || ''
      };

      let response;
      let method;
      let url;
      
      if (isEditMode) {
        // 更新现有教室
        url = `http://localhost:8080/api/classrooms/${formData.classroomId}`;
        method = 'PUT';
      } else {
        // 创建新教室
        url = 'http://localhost:8080/api/classrooms';
        method = 'POST';
      }
      
      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classroomData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 保存成功，重新获取数据
        await fetchData();
        setError(null);
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedClassroom(null);
        // 显示教室列表
      setShowClassroomList(true);
      } else {
        setError(result.message || (isEditMode ? '更新教室失败' : '创建教室失败'));
      }
    } catch (error) {
      console.error(isEditMode ? '更新教室失败:' : '创建教室失败:', error);
      setError(isEditMode ? `更新教室失败: ${error instanceof Error ? error.message : '未知错误'}` : 
                         `创建教室失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 删除教室
  const handleDeleteClassroom = async (classroom: Classroom) => {
    if (window.confirm(`确定要删除教室 ${classroom.teachingBuilding} - ${classroom.classroomName} 吗？`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/classrooms/${classroom.classroomId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`删除教室失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // 删除成功，重新获取数据
          await fetchData();
          
          if (selectedClassroom && selectedClassroom.classroomId === classroom.classroomId) {
            setSelectedClassroom(null);
            setIsEditMode(false);
          }
        } else {
          alert(result.message || '删除教室失败');
        }
      } catch (error) {
        console.error('删除教室失败:', error);
        alert(`删除教室失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 教室类型选项
  const classroomTypeOptions = [
    '普通教室',
    '多媒体教室',
    '实验室',
    '阶梯教室',
    '会议室',
    '报告厅',
    '其他'
  ];

  return (
    <div className="classroom-management">
      <header className="classroom-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>教室管理</h1>
        </div>
      </header>

      <div className="classroom-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="management-container">
            <div className="sidebar">
  <div className="building-filter">
    <h3>教学楼</h3>
    <ul className="building-list">
      {buildings.map(building => (
        <li 
          key={building.id}
          className={selectedBuildingId === building.id ? 'active' : ''}
          onClick={() => setSelectedBuildingId(building.id)}
        >
          {building.name}
          {building.location && <span className="building-info">{building.location}</span>}
          {building.floors && <span className="building-info">({building.floors}层)</span>}
        </li>
      ))}
    </ul>
  </div>
  
  <div className="actions">
    <button className="add-button" onClick={handleAddClassroom}>
      添加新教室
    </button>
    {(isEditMode || isAddMode) && !showClassroomList && (
      <button
        className="show-list-button"
        onClick={() => setShowClassroomList(true)}
      >
        显示教室列表
      </button>
    )}
  </div>
</div>

<div className="main-content">
  {/* 只在需要显示列表时渲染 */}
  {showClassroomList && (
    <>
      <div className="search-bar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="搜索教室名称、ID、教学楼或校区..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <div className="classrooms-list">
        <h2>
          {selectedBuildingId 
            ? `${buildings.find(b => b.id === selectedBuildingId)?.name} 的教室` 
            : '所有教室'}
        </h2>
        
        {filteredClassrooms.length === 0 ? (
          <div className="no-classrooms">暂无教室信息</div>
        ) : (
          <table className="classrooms-table">
            <thead>
              <tr>
                <th>教室编号</th>
                <th>教室名称</th>
                <th>校区</th>
                <th>楼层</th>
                <th>容量</th>
                <th>类型</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredClassrooms.map(classroom => (
                <tr key={classroom.classroomId}>
                  <td>{classroom.classroomId}</td>
                  <td>{classroom.classroomName}</td>
                  <td>{classroom.campus}</td>
                  <td>{classroom.floor}</td>
                  <td>{classroom.maximumClassSeatingCapacity}人</td>
                  <td>{classroom.classroomType}</td>
                  <td className={`status ${classroom.isEnabled === '是' ? 'available' : 'unavailable'}`}>
                    {classroom.isEnabled === '是' ? '可用' : '不可用'}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditClassroom(classroom)}
                    >
                      编辑
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteClassroom(classroom)}
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
    <div className={`classroom-form ${showClassroomList ? 'with-list' : 'no-list'}`}>
      <div className="form-header">
        <h3>{isAddMode ? '添加新教室' : '编辑教室'}</h3>
        <button
          className="toggle-list-button"
          onClick={toggleClassroomList}
        >
          {showClassroomList ? '隐藏教室列表' : '显示教室列表'}
        </button>
      </div>
      
      {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="classroomId">教室ID</label>
                        <input 
                          type="text" 
                          id="classroomId" 
                          name="classroomId" 
                          value={formData.classroomId} 
                          onChange={handleInputChange} 
                          disabled={isEditMode}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="classroomName">教室名称</label>
                        <input 
                          type="text" 
                          id="classroomName" 
                          name="classroomName" 
                          value={formData.classroomName} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="campus">校区</label>
                        <input 
                          type="text" 
                          id="campus" 
                          name="campus" 
                          value={formData.campus} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="teachingBuilding">所属教学楼</label>
                        <select 
                          id="teachingBuilding" 
                          name="teachingBuilding" 
                          value={formData.teachingBuilding} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">请选择教学楼</option>
                          {buildings.map(building => (
                            <option key={building.id} value={building.id}>
                              {building.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="floor">楼层</label>
                        <input 
                          type="text" 
                          id="floor" 
                          name="floor" 
                          value={formData.floor} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="maximumClassSeatingCapacity">容量</label>
                        <input 
                          type="number" 
                          id="maximumClassSeatingCapacity" 
                          name="maximumClassSeatingCapacity" 
                          min="0" 
                          value={formData.maximumClassSeatingCapacity} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="classroomType">教室类型</label>
                        <select 
                          id="classroomType" 
                          name="classroomType" 
                          value={formData.classroomType} 
                          onChange={handleInputChange}
                        >
                          {classroomTypeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="isEnabled">可用状态</label>
                        <div className="checkbox-container">
                          <input 
                            type="checkbox" 
                            id="isEnabled" 
                            name="isEnabled" 
                            checked={formData.isEnabled === '是'} 
                            onChange={(e) => setFormData({
                              ...formData,
                              isEnabled: e.target.checked ? '是' : '否'
                            })} 
                          />
                          <label htmlFor="isEnabled" className="checkbox-label">
                            可用
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="classroomArea">教室面积</label>
                        <input 
                          type="text" 
                          id="classroomArea" 
                          name="classroomArea" 
                          value={formData.classroomArea} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="isHasAirConditioning">空调</label>
                        <div className="checkbox-container">
                          <input 
                            type="checkbox" 
                            id="isHasAirConditioning" 
                            name="isHasAirConditioning" 
                            checked={formData.isHasAirConditioning === '是'} 
                            onChange={(e) => setFormData({
                              ...formData,
                              isHasAirConditioning: e.target.checked ? '是' : '否'
                            })} 
                          />
                          <label htmlFor="isHasAirConditioning" className="checkbox-label">
                            有空调
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="classroomDescription">教室描述</label>
                        <textarea 
                          id="classroomDescription" 
                          name="classroomDescription" 
                          value={formData.classroomDescription} 
                          onChange={handleInputChange} 
                          rows={3}
                        ></textarea>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="managementDepartment">管理部门</label>
                        <input 
                          type="text" 
                          id="managementDepartment" 
                          name="managementDepartment" 
                          value={formData.managementDepartment} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="deskChairType">桌椅类型</label>
                        <input 
                          type="text" 
                          id="deskChairType" 
                          name="deskChairType" 
                          value={formData.deskChairType} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        className="save-button"
                        onClick={handleSaveClassroom}
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

export default ClassroomManagement;
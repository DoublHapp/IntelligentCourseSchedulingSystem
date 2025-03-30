import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassroomManagement.scss';

// 教学楼类型定义
interface Building {
  id: number;
  name: string;
  location: string;
  floors: number;
}

// 教室类型定义
interface Classroom {
  id: number;
  name: string;
  building: Building;
  buildingId: number;
  floor: number;
  capacity: number;
  type: string;  // 普通教室、实验室、多媒体教室等
  facilities: string[]; // 设备设施
  isAvailable: boolean;
}

const ClassroomManagement = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState<Partial<Classroom>>({
    name: '',
    buildingId: 0,
    floor: 1,
    capacity: 0,
    type: '普通教室',
    facilities: [],
    isAvailable: true
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
      // 在实际项目中，这里应该调用API获取数据
      // 这里使用模拟数据，基于示例数据文件夹中的内容构建
      
      // 模拟教学楼数据
      const mockBuildings: Building[] = [
        { id: 1, name: '第一教学楼', location: '校区东部', floors: 5 },
        { id: 2, name: '第二教学楼', location: '校区中部', floors: 6 },
        { id: 3, name: '实验楼', location: '校区西部', floors: 4 },
        { id: 4, name: '综合教学楼', location: '校区北部', floors: 8 }
      ];
      
      // 模拟教室数据
      const mockClassrooms: Classroom[] = [
        { 
          id: 1, 
          name: '101', 
          building: mockBuildings[0], 
          buildingId: 1, 
          floor: 1, 
          capacity: 60, 
          type: '普通教室', 
          facilities: ['投影仪', '黑板'], 
          isAvailable: true 
        },
        { 
          id: 2, 
          name: '102', 
          building: mockBuildings[0], 
          buildingId: 1, 
          floor: 1, 
          capacity: 60, 
          type: '普通教室', 
          facilities: ['投影仪', '黑板', '空调'], 
          isAvailable: true 
        },
        { 
          id: 3, 
          name: '201', 
          building: mockBuildings[0], 
          buildingId: 1, 
          floor: 2, 
          capacity: 120, 
          type: '多媒体教室', 
          facilities: ['电脑', '投影仪', '音响系统', '空调'], 
          isAvailable: true 
        },
        { 
          id: 4, 
          name: '301', 
          building: mockBuildings[1], 
          buildingId: 2, 
          floor: 3, 
          capacity: 80, 
          type: '普通教室', 
          facilities: ['投影仪', '黑板'], 
          isAvailable: true 
        },
        { 
          id: 5, 
          name: '101', 
          building: mockBuildings[2], 
          buildingId: 3, 
          floor: 1, 
          capacity: 40, 
          type: '实验室', 
          facilities: ['电脑', '实验设备', '空调'], 
          isAvailable: true 
        }
      ];

      setBuildings(mockBuildings);
      setClassrooms(mockClassrooms);
      
      if (mockBuildings.length > 0) {
        setSelectedBuildingId(mockBuildings[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请重试');
      setLoading(false);
    }
  };

  // 根据选中的教学楼筛选教室
  const filteredClassrooms = selectedBuildingId 
    ? classrooms.filter(classroom => classroom.buildingId === selectedBuildingId)
    : classrooms;

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

  // 处理设施选择
  const handleFacilityChange = (facility: string) => {
    const currentFacilities = formData.facilities || [];
    const updatedFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility];
      
    setFormData({
      ...formData,
      facilities: updatedFacilities
    });
  };

  // 选择教室进行编辑
  const handleEditClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      buildingId: classroom.buildingId,
      floor: classroom.floor,
      capacity: classroom.capacity,
      type: classroom.type,
      facilities: classroom.facilities,
      isAvailable: classroom.isAvailable
    });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  // 准备添加新教室
  const handleAddClassroom = () => {
    setSelectedClassroom(null);
    setFormData({
      name: '',
      buildingId: selectedBuildingId || 0,
      floor: 1,
      capacity: 0,
      type: '普通教室',
      facilities: [],
      isAvailable: true
    });
    setIsAddMode(true);
    setIsEditMode(false);
  };

  // 取消编辑或添加
  const handleCancel = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setSelectedClassroom(null);
    setFormData({
      name: '',
      buildingId: 0,
      floor: 1,
      capacity: 0,
      type: '普通教室',
      facilities: [],
      isAvailable: true
    });
  };

  // 保存教室信息
  const handleSaveClassroom = () => {
    if (!formData.name || !formData.buildingId) {
      setError('教室名称和所属教学楼不能为空');
      return;
    }

    if (isAddMode) {
      // 添加新教室
      const newClassroom: Classroom = {
        id: Math.max(...classrooms.map(c => c.id), 0) + 1,
        name: formData.name || '',
        building: buildings.find(b => b.id === formData.buildingId) || buildings[0],
        buildingId: formData.buildingId || 0,
        floor: formData.floor || 1,
        capacity: formData.capacity || 0,
        type: formData.type || '普通教室',
        facilities: formData.facilities || [],
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true
      };
      
      setClassrooms([...classrooms, newClassroom]);
      setError(null);
      setIsAddMode(false);
      setFormData({
        name: '',
        buildingId: selectedBuildingId || 0,
        floor: 1,
        capacity: 0,
        type: '普通教室',
        facilities: [],
        isAvailable: true
      });
    } else if (isEditMode && selectedClassroom) {
      // 更新现有教室
      const updatedClassrooms = classrooms.map(classroom => {
        if (classroom.id === selectedClassroom.id) {
          return {
            ...classroom,
            name: formData.name || classroom.name,
            buildingId: formData.buildingId || classroom.buildingId,
            building: buildings.find(b => b.id === formData.buildingId) || classroom.building,
            floor: formData.floor || classroom.floor,
            capacity: formData.capacity || classroom.capacity,
            type: formData.type || classroom.type,
            facilities: formData.facilities || classroom.facilities,
            isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : classroom.isAvailable
          };
        }
        return classroom;
      });
      
      setClassrooms(updatedClassrooms);
      setError(null);
      setIsEditMode(false);
      setSelectedClassroom(null);
    }
  };

  // 删除教室
  const handleDeleteClassroom = (classroom: Classroom) => {
    if (window.confirm(`确定要删除教室 ${classroom.building.name} - ${classroom.name} 吗？`)) {
      const updatedClassrooms = classrooms.filter(c => c.id !== classroom.id);
      setClassrooms(updatedClassrooms);
      
      if (selectedClassroom && selectedClassroom.id === classroom.id) {
        setSelectedClassroom(null);
        setIsEditMode(false);
      }
    }
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const facilityOptions = [
    '黑板', '投影仪', '电脑', '空调', '音响系统', '实验设备', '多媒体设备'
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
                        <span className="building-info">{building.location} ({building.floors}层)</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="actions">
                  <button className="add-button" onClick={handleAddClassroom}>
                    添加新教室
                  </button>
                </div>
              </div>

              <div className="main-content">
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
                          <th>教室名称</th>
                          <th>楼层</th>
                          <th>容量</th>
                          <th>类型</th>
                          <th>设施</th>
                          <th>状态</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClassrooms.map(classroom => (
                          <tr key={`${classroom.buildingId}-${classroom.name}`}>
                            <td>{classroom.name}</td>
                            <td>{classroom.floor}层</td>
                            <td>{classroom.capacity}人</td>
                            <td>{classroom.type}</td>
                            <td className="facilities-cell">
                              {classroom.facilities.join(', ')}
                            </td>
                            <td className={`status ${classroom.isAvailable ? 'available' : 'unavailable'}`}>
                              {classroom.isAvailable ? '可用' : '不可用'}
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

                {(isEditMode || isAddMode) && (
                  <div className="classroom-form">
                    <h3>{isAddMode ? '添加新教室' : '编辑教室'}</h3>
                    
                    {error && <div className="form-error">{error}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">教室名称</label>
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
                        <label htmlFor="buildingId">所属教学楼</label>
                        <select 
                          id="buildingId" 
                          name="buildingId" 
                          value={formData.buildingId} 
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
                          type="number" 
                          id="floor" 
                          name="floor" 
                          min="1" 
                          max="20" 
                          value={formData.floor} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="capacity">容量</label>
                        <input 
                          type="number" 
                          id="capacity" 
                          name="capacity" 
                          min="0" 
                          value={formData.capacity} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="type">教室类型</label>
                        <select 
                          id="type" 
                          name="type" 
                          value={formData.type} 
                          onChange={handleInputChange}
                        >
                          <option value="普通教室">普通教室</option>
                          <option value="多媒体教室">多媒体教室</option>
                          <option value="实验室">实验室</option>
                          <option value="阶梯教室">阶梯教室</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="isAvailable">可用状态</label>
                        <div className="checkbox-container">
                          <input 
                            type="checkbox" 
                            id="isAvailable" 
                            name="isAvailable" 
                            checked={formData.isAvailable} 
                            onChange={handleInputChange} 
                          />
                          <label htmlFor="isAvailable" className="checkbox-label">
                            可用
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>设施</label>
                      <div className="facilities-checkboxes">
                        {facilityOptions.map(facility => (
                          <div key={facility} className="facility-checkbox">
                            <input 
                              type="checkbox" 
                              id={`facility-${facility}`}
                              checked={(formData.facilities || []).includes(facility)}
                              onChange={() => handleFacilityChange(facility)}
                            />
                            <label htmlFor={`facility-${facility}`}>{facility}</label>
                          </div>
                        ))}
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
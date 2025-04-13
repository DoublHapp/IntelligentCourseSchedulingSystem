import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManualScheduling.scss';

// 定义数据类型
interface SchedulingTask {
  courseId: string; 
  courseName: string;
  teacherEmployeeId: string;
  instructorName: string; //instructorName
  teachingClassComposition: string;
  teachingClassId: string;
  teachingClassName: string;
  arrangedHours: number; //这是排课学时，就当总学时来吧
  designatedClassroomType: string | null;
  designatedClassroom: string | null;
  designatedTeachingBuilding: string | null;
  designatedTime: string | null;
  status: 'pending' | 'scheduled' | 'completed';  
}

interface Course {
  id: string;
  name: string;
  hours: number;
}

interface Teacher {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
}

interface Classroom {
  classroomId: string;
  classroomName: string; 
  campus: number;
  teachingBuilding: string;
  classroomType: string;
  maximumClassSeatingCapacity: number
}

interface ScheduleResult {
  courseId: string;
  courseName: string;
  classroomId: string;
  classroomName: string;
  slot: string; // 时间段，格式: "5:1-2" 表示周五1-2节
  weeks: string;
  teachingClassId: string;
}

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const ManualScheduling = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<SchedulingTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<SchedulingTask | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string[] | null>(null);
  const [timeConflicts, setTimeConflicts] = useState<ScheduleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // 检查用户是否已登录
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      // 模拟从后端获取数据
      fetchTasks();
      fetchClassrooms();
    } catch (error) {
      console.error('用户数据解析错误:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);
  
  // 从后端获取任务
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tasks');
      if (!response.ok) {
        throw new Error(`获取排课任务失败: ${response.status}`);
      }
      const result: ApiResponse<SchedulingTask[]> = await response.json();
      if (result.success && result.data) {
        // 确保每个字段都有默认值，防止 null 导致错误
        setTasks(result.data.map(task => ({
          ...task,
          designatedTime: task.designatedTime || '',
          designatedTeachingBuilding: task.designatedTeachingBuilding || '',
          designatedClassroom: task.designatedClassroom || '',
        })));
      } else {
        throw new Error(result.message || '获取排课任务失败');
      }
    } catch (error) {
      console.error('获取排课任务失败:', error);
      setError('获取排课任务失败，请稍后重试');
    }
  };
  
  // 从后端获取教室
  const fetchClassrooms = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/classrooms');
      if (!response.ok) {
        throw new Error(`获取教室数据失败: ${response.status}`);
      }
      const result: ApiResponse<Classroom[]> = await response.json();
      if (result.success && result.data) {
        setClassrooms(result.data);
      } else {
        throw new Error(result.message || '获取教室数据失败');
      }
    } catch (error) {
      console.error('获取教室数据失败:', error);
      setError('获取教室数据失败，请稍后重试');
    }
  };
  
  // 处理任务选择
  const handleTaskSelect = (task: SchedulingTask) => {
    setSelectedTask(task);
    // 重置选择
    setSelectedWeek(1);
    setSelectedDay(1);
    setSelectedPeriod(null);
    setSelectedClassroom(null);
    setTimeConflicts([]);
    setError('');
  };
  
  // 检查时间冲突
  const checkConflicts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/assignments/conflicts');
      if (!response.ok) {
        throw new Error(`时间冲突检测失败: ${response.status}`);
      }
      const result: ApiResponse<ScheduleResult[]> = await response.json();
      if (result.success && result.data.length > 0) {
        setTimeConflicts(result.data);;
        return false; // 返回冲突状态
      }else if (result.success && result.data.length === 0) {
        setTimeConflicts([]); // 没有冲突
        return true; // 返回没有冲突的状态
      }else {
        throw new Error(result.message || '时间冲突检测失败');
      }
    } catch (error) {
      console.error('时间冲突检测果失败:', error);
      setError('时间冲突检测失败，请稍后重试');
    }
  };
  
  // 提交排课
  const handleScheduleSubmit = async() => {
    if (!selectedTask) {
      setError('请选择排课任务');
      return;
    }
    
    if (selectedWeek < 1) {
      setError('请选择有效的周次');
      return;
    }
    
    if (selectedDay < 1 || selectedDay > 7) {
      setError('请选择有效的星期');
      return;
    }
    
    if (selectedPeriod === null) {
      setError('请选择课节');
      return;
    }
    
    if (selectedClassroom === null) {
      setError('请选择教室');
      return;
    }
    
    // 检查冲突
    const hasNoConflicts = await checkConflicts();

    if (hasNoConflicts) { 
      // 保存排课结果
      console.log(selectedClassroom)
      const scheduleResult: ScheduleResult = {
        courseId: selectedTask.courseId,
        courseName: selectedTask.courseName,
        classroomId: selectedClassroom[0],
        classroomName: selectedClassroom[1],
        slot: `${selectedWeek}:${selectedPeriod*2+1}-${selectedPeriod*2+2}`,
        weeks: `${selectedWeek}`,
        teachingClassId: selectedTask.teachingClassId,
      };

      try{
        const response = await fetch('http://localhost:8080/api/assignments/create',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(scheduleResult),
        });
        if (!response.ok) {
          throw new Error(`排课失败: ${response.status}`);
        }
      }catch{
        console.error('排课失败:', error);
      }
      console.log('排课成功:', scheduleResult);
      // 更新任务状态
      const updatedTasks = tasks.map(task => 
        task.teachingClassId === selectedTask.teachingClassId 
          ? { ...task, status: 'scheduled' as const } 
          : task
      );
      setTasks(updatedTasks);
      
      // 显示成功消息
      alert(`排课成功！\n课程: ${selectedTask.courseName}\n教师: ${selectedTask.instructorName}\n时间: 第${selectedWeek}周 星期${getDayName(selectedDay)} ${getPeriodName(selectedPeriod)}\n教室: ${scheduleResult.classroomName}`);
      
      // 重置选中状态
      setSelectedTask(null);
    } else {
      setError('存在时间或资源冲突，请重新选择');
    }
  };
  
  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  // 获取星期名称
  const getDayName = (day: number) => {
    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    return dayNames[day - 1] || day;
  };
  
  // 获取课节名称
  const getPeriodName = (period: number) => {
    const periodNames = ['第1-2节', '第3-4节', '第5-6节', '第7-8节', '第9-10节', '第11-12节'];
    return periodNames[period] || `第${period + 1}节`;
  };
  
  return (
    <div className="manual-scheduling">
      <header className="manual-scheduling-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>手动排课</h1>
        </div>
      </header>
      
      <div className="manual-scheduling-content">
        <div className="task-list">
          <h2>排课任务列表</h2>
          <div className="task-items">
            {tasks.map(task => (
              <div 
                key={task.teachingClassId}
                className={`task-item ${selectedTask?.teachingClassId === task.teachingClassId? 'selected' : ''} ${task.status === 'scheduled' ? 'scheduled' : ''}`}
                onClick={() => handleTaskSelect(task)}
              >
                <div className="task-details">
                  <span>课程: {task.courseName}</span>
                  <span>教师: {task.instructorName}</span>
                  <span>班级: {task.teachingClassComposition}</span>
                </div>
                <div className="task-status">
                  {task.status === 'pending' ? '待排课' : 
                   task.status === 'scheduled' ? '已排课' : '已完成'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="scheduling-panel">
          <h2>排课面板</h2>
          
          {selectedTask ? (
            <div className="scheduling-form">
              <div className="selected-task-info">
                <div className="task-info-grid">
                  <div className="info-row">
                    <span className="info-label">课程:</span>
                    <span className="info-value">{selectedTask.courseName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">教师:</span>
                    <span className="info-value">{selectedTask.instructorName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">班级:</span>
                    <span className="info-value">{selectedTask.teachingClassComposition}</span>
                  </div><br></br>
                  <div className="info-row">
                    <span className="info-label">教室类型:</span>
                    <span className="info-value">{selectedTask.designatedClassroomType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">教室:</span>
                    <span className="info-value">{selectedTask.designatedClassroom || "未指定"}</span>
                  </div>

                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="week">周次</label>
                  <select 
                    id="week" 
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>第{week}周</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="day">星期</label>
                  <select 
                    id="day" 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  >
                    <option value={1}>星期一</option>
                    <option value={2}>星期二</option>
                    <option value={3}>星期三</option>
                    <option value={4}>星期四</option>
                    <option value={5}>星期五</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="period">课节</label>
                  <select 
                    id="period" 
                    value={selectedPeriod || ''}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                  >
                    <option value="">请选择</option>
                    <option value={0}>第1-2节</option>
                    <option value={1}>第3-4节</option>
                    <option value={2}>第5-6节</option>
                    <option value={3}>第7-8节</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="classroom">教室</label>
                  <select 
                    id="classroom" 
                    value={selectedClassroom || ''}
                    onChange={(e) => setSelectedClassroom(e.target.value.split(','))}
                  >
                    <option value="">请选择</option>
                    {classrooms.map(classroom => (
                      <option key={classroom.classroomId} value={classroom.classroomId+','+classroom.classroomName}>
                        {classroom.classroomName} ({classroom.maximumClassSeatingCapacity}人, {classroom.classroomType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {timeConflicts.length > 0 && (
                <div className="conflicts-warning">
                  <h4>存在冲突：</h4>
                  <ul>
                    {timeConflicts.map((conflict, index) => (
                      <li key={index}>{conflict.teachingClassId} {conflict.courseName} {conflict.classroomName}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="scheduling-actions">
                <button 
                  className="check-button"
                  onClick={checkConflicts}
                >
                  检查冲突
                </button>
                
                <button 
                  className="submit-button"
                  onClick={handleScheduleSubmit}
                >
                  提交排课
                </button>
              </div>
            </div>
          ) : (
            <div className="no-task-selected">
              请从左侧选择一个排课任务
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualScheduling;
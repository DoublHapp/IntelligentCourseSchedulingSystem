import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManualScheduling.scss';

// 定义数据类型
interface SchedulingTask {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  classIds: number[];
  classNames: string[];
  status: 'pending' | 'scheduled' | 'completed';
}

interface Course {
  id: number;
  name: string;
  code: string;
  hours: number;
}

interface Teacher {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

interface Classroom {
  id: number;
  name: string;
  buildingId: number;
  buildingName: string;
  capacity: number;
  type: string;
}

interface TimeSlot {
  week: number;
  day: number;
  period: number;
  periodName: string;
}

interface ScheduleResult {
  taskId: number;
  timeSlot: TimeSlot;
  classroomId: number;
  classroomName: string;
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
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [timeConflicts, setTimeConflicts] = useState<string[]>([]);
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

  // 模拟从后端获取任务
  const fetchTasks = () => {
    // 这里应该是真实的API调用
    const mockTasks: SchedulingTask[] = [
      {
        id: 1,
        name: '2023-2024学年第一学期排课任务1',
        courseId: 101,
        courseName: '数据结构',
        teacherId: 201,
        teacherName: '张教授',
        classIds: [301, 302],
        classNames: ['计算机科学1班', '计算机科学2班'],
        status: 'pending'
      },
      {
        id: 2,
        name: '2023-2024学年第一学期排课任务2',
        courseId: 102,
        courseName: '数据库原理',
        teacherId: 202,
        teacherName: '李教授',
        classIds: [301],
        classNames: ['计算机科学1班'],
        status: 'pending'
      },
      {
        id: 3,
        name: '2023-2024学年第一学期排课任务3',
        courseId: 103,
        courseName: '操作系统',
        teacherId: 203,
        teacherName: '王教授',
        classIds: [302],
        classNames: ['计算机科学2班'],
        status: 'scheduled'
      }
    ];

    setTasks(mockTasks);
  };

  // 模拟从后端获取教室
  const fetchClassrooms = () => {
    // 这里应该是真实的API调用
    const mockClassrooms: Classroom[] = [
      { id: 1, name: '教学楼A-101', buildingId: 1, buildingName: '教学楼A', capacity: 60, type: '普通教室' },
      { id: 2, name: '教学楼A-102', buildingId: 1, buildingName: '教学楼A', capacity: 60, type: '普通教室' },
      { id: 3, name: '教学楼B-201', buildingId: 2, buildingName: '教学楼B', capacity: 120, type: '阶梯教室' },
      { id: 4, name: '教学楼B-202', buildingId: 2, buildingName: '教学楼B', capacity: 80, type: '普通教室' },
      { id: 5, name: '实验楼C-101', buildingId: 3, buildingName: '实验楼C', capacity: 40, type: '实验室' }
    ];

    setClassrooms(mockClassrooms);
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
  const checkConflicts = () => {
    // 在真实应用中，这应该是一个API调用，检查所有可能的冲突
    // 这里只是模拟一些冲突逻辑
    if (selectedTask && selectedWeek && selectedDay && selectedPeriod !== null && selectedClassroom !== null) {
      const conflicts: string[] = [];

      // 模拟冲突检查逻辑
      if (selectedTask.id === 1 && selectedWeek === 1 && selectedDay === 1 && selectedPeriod === 1) {
        conflicts.push('教师"张教授"在此时间已有其他课程');
      }

      if (selectedClassroom === 3 && selectedWeek === 1 && selectedDay === 2) {
        conflicts.push('教室"教学楼B-201"在此时间已被占用');
      }

      if (selectedTask.id === 2 && selectedWeek === 1 && selectedDay === 3 && selectedPeriod === 2) {
        conflicts.push('班级"计算机科学1班"在此时间已有其他课程');
      }

      setTimeConflicts(conflicts);
      return conflicts.length === 0;
    }
    return false;
  };

  // 提交排课
  const handleScheduleSubmit = () => {
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
    const hasNoConflicts = checkConflicts();

    if (hasNoConflicts) {
      // 在真实应用中，这里应该调用API保存排课结果
      const scheduleResult: ScheduleResult = {
        taskId: selectedTask.id,
        timeSlot: {
          week: selectedWeek,
          day: selectedDay,
          period: selectedPeriod,
          periodName: getPeriodName(selectedPeriod)
        },
        classroomId: selectedClassroom,
        classroomName: classrooms.find(c => c.id === selectedClassroom)?.name || ''
      };

      console.log('排课结果:', scheduleResult);

      // 更新任务状态
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id
          ? { ...task, status: 'scheduled' as const }
          : task
      );
      setTasks(updatedTasks);

      // 显示成功消息
      alert(`排课成功！\n课程: ${selectedTask.courseName}\n教师: ${selectedTask.teacherName}\n时间: 第${selectedWeek}周 星期${getDayName(selectedDay)} ${getPeriodName(selectedPeriod)}\n教室: ${scheduleResult.classroomName}`);

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
                key={task.id}
                className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''} ${task.status === 'scheduled' ? 'scheduled' : ''}`}
                onClick={() => handleTaskSelect(task)}
              >
                <div className="task-name">{task.name}</div>
                <div className="task-details">
                  <span>课程: {task.courseName}</span>
                  <span>教师: {task.teacherName}</span>
                  <span>班级: {task.classNames.join(', ')}</span>
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
                <h3>当前任务: {selectedTask.name}</h3>
                <div className="task-info-grid">
                  <div className="info-row">
                    <span className="info-label">课程:</span>
                    <span className="info-value">{selectedTask.courseName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">教师:</span>
                    <span className="info-value">{selectedTask.teacherName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">班级:</span>
                    <span className="info-value">{selectedTask.classNames.join(', ')}</span>
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
                    <option value={6}>星期六</option>
                    <option value={7}>星期日</option>
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
                    <option value={4}>第9-10节</option>
                    <option value={5}>第11-12节</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="classroom">教室</label>
                  <select
                    id="classroom"
                    value={selectedClassroom || ''}
                    onChange={(e) => setSelectedClassroom(parseInt(e.target.value))}
                  >
                    <option value="">请选择</option>
                    {classrooms.map(classroom => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name} ({classroom.capacity}人, {classroom.type})
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
                      <li key={index}>{conflict}</li>
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
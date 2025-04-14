import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManualScheduling.scss';

// 定义数据类型
interface SchedulingTask {
  courseId: string;
  courseName: string;
  teacherEmployeeId: string;
  instructorName: string;
  teachingClassComposition: string;
  teachingClassId: string;
  teachingClassName: string;
  arrangedHours: number;
  courseWeeklyScheduleHours: string; // 例如 "1-18:2" 表示1-18周，每周2课时
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
  classRoomId: string;
  classRoomName: string;
  slot: string; // 时间段，格式: "5:1-2" 表示周五1-2节
  weeks: string; // 周次，格式: "1,2,3,4,5,6,7,8,9,10,11,12"
  teachingClassId: string;
}

// 时间段接口
interface TimeSlot {
  day: number;
  period: number;
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
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string[] | null>(null);
  const [timeConflicts, setTimeConflicts] = useState<ScheduleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(0);
  const [weeksDisplay, setWeeksDisplay] = useState<string>('');

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

      // 获取数据
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
          courseWeeklyScheduleHours: task.courseWeeklyScheduleHours || '1-18:2', // 默认值
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
    setSelectedDay(1);
    setSelectedTimeSlots([]);
    setSelectedClassroom(null);
    setTimeConflicts([]);
    setError('');

    // 解析courseWeeklyScheduleHours获取周次和每周课时信息
    if (task.courseWeeklyScheduleHours) {
      // 解析格式: "1-18:2"
      const parts = task.courseWeeklyScheduleHours.split(':');
      if (parts.length === 2) {
        const weekRangePart = parts[0];
        const hours = parseInt(parts[1]);
        setHoursPerWeek(hours);

        // 处理可能有多个周次范围，如 "1-8,10-15:2"
        const weekRangeParts = weekRangePart.split(',');
        const allWeeks: number[] = [];
        const formattedWeekRanges: string[] = [];

        weekRangeParts.forEach(range => {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              formattedWeekRanges.push(`${start}-${end}周`);

              // 添加该范围内的所有周次到数组
              for (let i = start; i <= end; i++) {
                if (!allWeeks.includes(i)) {
                  allWeeks.push(i);
                }
              }
            }
          } else {
            // 单个周次的情况
            const week = parseInt(range);
            if (!isNaN(week)) {
              formattedWeekRanges.push(`${week}周`);
              if (!allWeeks.includes(week)) {
                allWeeks.push(week);
              }
            }
          }
        });

        // 更新显示的周次信息和实际选中的周次
        setWeeksDisplay(formattedWeekRanges.join(', '));
        setSelectedWeeks(allWeeks.sort((a, b) => a - b));
      }
    }
  };

  // 处理选择星期变更
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(parseInt(e.target.value));
    // 重置已选择的时间段
    setSelectedTimeSlots([]);
  };

  // 处理选择时间段变更
  const handleTimeSlotsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = parseInt(e.target.value);

    // 切换选择状态
    const existingIndex = selectedTimeSlots.findIndex(
      slot => slot.day === selectedDay && slot.period === period
    );

    if (existingIndex >= 0) {
      // 如果已选中，则移除
      const updatedSlots = selectedTimeSlots.filter((_, index) => index !== existingIndex);
      setSelectedTimeSlots(updatedSlots);
    } else {
      // 如果未选中，且未超出每周课时限制，则添加
      if (selectedTimeSlots.length < hoursPerWeek / 2) {
        setSelectedTimeSlots([...selectedTimeSlots, { day: selectedDay, period }]);
      } else {
        setError(`每周课时为${hoursPerWeek}，最多只能选择${hoursPerWeek / 2}个课节（每节2课时）`);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // 检查时间段是否已被选择
  const isTimeSlotSelected = (period: number): boolean => {
    return selectedTimeSlots.some(slot => slot.day === selectedDay && slot.period === period);
  };

  // 移除时间段
  const removeTimeSlot = (day: number, period: number) => {
    setSelectedTimeSlots(selectedTimeSlots.filter(
      slot => !(slot.day === day && slot.period === period)
    ));
  };

  // 格式化显示时间段
  const formatTimeSlot = (slot: TimeSlot): string => {
    return `星期${getDayName(slot.day)} ${getPeriodName(slot.period)}`;
  };

  // 检查时间冲突
  const checkConflicts = async () => {
    setLoading(true);
    setError('');

    try {
      // 基本验证
      if (!selectedTask) {
        setError('请选择排课任务');
        setLoading(false);
        return false;
      }

      if (selectedWeeks.length === 0) {
        setError('未找到课程周次信息');
        setLoading(false);
        return false;
      }

      if (selectedTimeSlots.length === 0) {
        setError('请至少选择一个课节');
        setLoading(false);
        return false;
      }

      if (!selectedClassroom) {
        setError('请选择教室');
        setLoading(false);
        return false;
      }

      // 收集所有请求
      const conflictCheckPromises = selectedTimeSlots.map(async (timeSlot) => {
        // 创建临时的排课记录
        const tempAssignment = {
          courseId: selectedTask.courseId,
          courseName: selectedTask.courseName,
          classRoomId: selectedClassroom[0],
          classRoomName: selectedClassroom[1],
          slot: `${timeSlot.day}:${timeSlot.period * 2 + 1}-${timeSlot.period * 2 + 2}`, // 按照格式构建时间槽
          weeks: selectedWeeks.join(','),
          teachingClassId: selectedTask.teachingClassId,
        };

        // 保存临时记录到服务器
        const createResponse = await fetch('http://localhost:8080/api/assignments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tempAssignment)
        });

        if (!createResponse.ok) {
          throw new Error(`创建临时排课记录失败: ${createResponse.status}`);
        }

        // 检查冲突
        const conflictsResponse = await fetch('http://localhost:8080/api/assignments/conflicts');
        if (!conflictsResponse.ok) {
          throw new Error(`检查冲突失败: ${conflictsResponse.status}`);
        }

        const result: ApiResponse<ScheduleResult[]> = await conflictsResponse.json();

        return {
          timeSlot,
          conflicts: result.success ? (result.data || []) : []
        };
      });

      // 等待所有冲突检查完成
      const results = await Promise.all(conflictCheckPromises);

      // 收集所有冲突
      const allConflicts: ScheduleResult[] = [];
      results.forEach(result => {
        result.conflicts.forEach(conflict => {
          // 避免重复添加同一个冲突
          if (!allConflicts.some(c => c.teachingClassId === conflict.teachingClassId && c.slot === conflict.slot)) {
            allConflicts.push(conflict);
          }
        });
      });

      setTimeConflicts(allConflicts);
      return allConflicts.length === 0; // 没有冲突时返回true

    } catch (error: any) {
      console.error('检查冲突失败:', error);
      setError(`检查冲突失败: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 提交排课
  const handleScheduleSubmit = async () => {
    // 先检查冲突
    const hasNoConflict = await checkConflicts();

    if (hasNoConflict) {
      // 创建所有排课记录
      try {
        for (const timeSlot of selectedTimeSlots) {
          const assignment = {
            courseId: selectedTask!.courseId,
            courseName: selectedTask!.courseName,
            classRoomId: selectedClassroom![0],
            classRoomName: selectedClassroom![1],
            slot: `${timeSlot.day}:${timeSlot.period * 2 + 1}-${timeSlot.period * 2 + 2}`,
            weeks: selectedWeeks.join(','),
            teachingClassId: selectedTask!.teachingClassId,
          };

          // 保存到数据库
          const response = await fetch('http://localhost:8080/api/assignments/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignment)
          });

          if (!response.ok) {
            throw new Error(`创建排课记录失败: ${response.status}`);
          }
        }

        // 显示成功消息
        const timeSlotDescriptions = selectedTimeSlots.map(slot =>
          `星期${getDayName(slot.day)} ${getPeriodName(slot.period)}`
        ).join('\n');

        alert(`排课成功！\n课程: ${selectedTask?.courseName}\n教师: ${selectedTask?.instructorName}\n时间: ${weeksDisplay}\n${timeSlotDescriptions}\n教室: ${selectedClassroom?.[1]}`);

        // 更新任务状态（仅在UI上）
        if (selectedTask) {
          const updatedTasks = tasks.map(task =>
            task.teachingClassId === selectedTask.teachingClassId
              ? { ...task, status: 'scheduled' as const }
              : task
          );
          setTasks(updatedTasks);
        }

        // 重置表单
        setSelectedTask(null);
        setSelectedWeeks([]);
        setSelectedTimeSlots([]);
        setSelectedDay(1);
        setSelectedClassroom(null);
        setTimeConflicts([]);
        setError('');
        setWeeksDisplay('');

      } catch (error: any) {
        console.error('提交排课失败:', error);
        setError(`提交排课失败: ${error.message}`);
      }
    } else {
      setError('存在时间或资源冲突，请重新选择时间段或教室');
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
    return periodNames[period] || `第${period * 2 + 1}-${period * 2 + 2}节`;
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
                className={`task-item ${selectedTask?.teachingClassId === task.teachingClassId ? 'selected' : ''} ${task.status === 'scheduled' ? 'scheduled' : ''}`}
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
                <h3>排课任务信息</h3>
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
                  </div>
                  <div className="info-row">
                    <span className="info-label">周次:</span>
                    <span className="info-value highlight">{weeksDisplay}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">每周课时:</span>
                    <span className="info-value highlight">{hoursPerWeek}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">教室类型:</span>
                    <span className="info-value">{selectedTask.designatedClassroomType || "未指定"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">指定教室:</span>
                    <span className="info-value">{selectedTask.designatedClassroom || "未指定"}</span>
                  </div>
                </div>
              </div>

              <div className="scheduling-options">
                <h3>排课设置</h3>

                <div className="form-group">
                  <label htmlFor="day">选择星期</label>
                  <select
                    id="day"
                    value={selectedDay}
                    onChange={handleDayChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <option key={day} value={day}>星期{getDayName(day)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="period">选择课节 (需要选择{hoursPerWeek / 2}个课节)</label>
                  <select
                    id="period"
                    value=""
                    onChange={handleTimeSlotsChange}
                    disabled={selectedTimeSlots.length >= hoursPerWeek / 2 && !selectedTimeSlots.some(slot => slot.day === selectedDay)}
                  >
                    <option value="">请选择</option>
                    <option value="0" disabled={isTimeSlotSelected(0)}>第1-2节</option>
                    <option value="1" disabled={isTimeSlotSelected(1)}>第3-4节</option>
                    <option value="2" disabled={isTimeSlotSelected(2)}>第5-6节</option>
                    <option value="3" disabled={isTimeSlotSelected(3)}>第7-8节</option>
                    <option value="4" disabled={isTimeSlotSelected(4)}>第9-10节</option>
                    <option value="5" disabled={isTimeSlotSelected(5)}>第11-12节</option>
                  </select>
                </div>

                {selectedTimeSlots.length > 0 && (
                  <div className="selected-time-slots">
                    <label>已选择的时间段:</label>
                    <div className="time-slot-tags">
                      {selectedTimeSlots.map((slot, index) => (
                        <div key={index} className="time-slot-tag">
                          <span>{formatTimeSlot(slot)}</span>
                          <button
                            type="button"
                            className="remove-slot-btn"
                            onClick={() => removeTimeSlot(slot.day, slot.period)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="classroom">选择教室</label>
                  <select
                    id="classroom"
                    value={selectedClassroom ? `${selectedClassroom[0]},${selectedClassroom[1]}` : ''}
                    onChange={(e) => setSelectedClassroom(e.target.value ? e.target.value.split(',') : null)}
                  >
                    <option value="">请选择</option>
                    {classrooms.map(classroom => (
                      <option key={classroom.classroomId} value={`${classroom.classroomId},${classroom.classroomName}`}>
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
                      <li key={index}>
                        {conflict.courseName} (教学班: {conflict.teachingClassId})
                        在周 {conflict.weeks} 时间段slot
                        {conflict.slot} 使用 {conflict.classRoomName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="scheduling-actions">
                <button
                  className="check-button"
                  onClick={checkConflicts}
                  disabled={loading || !selectedTask || selectedWeeks.length === 0 || selectedTimeSlots.length === 0 || !selectedClassroom}
                >
                  {loading ? '检查中...' : '检查冲突'}
                </button>

                <button
                  className="submit-button"
                  onClick={handleScheduleSubmit}
                  disabled={loading || timeConflicts.length > 0 || !selectedTask || selectedWeeks.length === 0 || selectedTimeSlots.length === 0 || !selectedClassroom}
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
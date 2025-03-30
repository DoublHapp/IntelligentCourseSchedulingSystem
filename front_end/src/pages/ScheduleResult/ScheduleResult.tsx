import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleResult.scss';

// 课程安排类型定义
interface CourseSchedule {
  id: number;
  courseName: string;
  teacherName: string;
  classroom: string;
  week: number;
  day: number;
  period: number;
  classNames: string[];
}

const ScheduleResult = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<'class' | 'teacher' | 'classroom'>('class');
  const [selectedId, setSelectedId] = useState<string>('');
  const [courseSchedules, setCourseSchedules] = useState<CourseSchedule[]>([]);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [teachers, setTeachers] = useState<{id: string, name: string}[]>([]);
  const [classrooms, setClassrooms] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // 检查用户登录状态
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      // 加载初始数据
      fetchInitialData(userData);
    } catch (error) {
      console.error('用户数据解析错误:', error);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // 获取初始数据
  const fetchInitialData = async (userData: any) => {
    setLoading(true);
    try {
      // 在实际项目中，这里应该调用API获取数据
      // 这里使用模拟数据
      
      // 模拟班级列表
      const mockClasses = [
        { id: '1', name: '计算机科学1班' },
        { id: '2', name: '计算机科学2班' },
        { id: '3', name: '软件工程1班' },
        { id: '4', name: '软件工程2班' },
        { id: '5', name: '数据科学1班' }
      ];
      
      // 模拟教师列表
      const mockTeachers = [
        { id: '1', name: '张教授' },
        { id: '2', name: '李教授' },
        { id: '3', name: '王教授' },
        { id: '4', name: '赵教授' },
        { id: '5', name: '钱教授' }
      ];
      
      // 模拟教室列表
      const mockClassrooms = [
        { id: '1', name: '教学楼A-101' },
        { id: '2', name: '教学楼A-102' },
        { id: '3', name: '教学楼B-201' },
        { id: '4', name: '教学楼B-202' },
        { id: '5', name: '实验楼C-101' }
      ];

      setClasses(mockClasses);
      setTeachers(mockTeachers);
      setClassrooms(mockClassrooms);

      // 根据用户身份设置初始选择
      if (userData.userIdentity === 'student') {
        setScheduleType('class');
        setSelectedId('1'); // 假设学生属于班级1
        await fetchScheduleData('class', '1');
      } else if (userData.userIdentity === 'teacher') {
        setScheduleType('teacher');
        setSelectedId('1'); // 假设教师ID为1
        await fetchScheduleData('teacher', '1');
      } else {
        // 管理员默认查看第一个班级的课表
        setSelectedId('1');
        await fetchScheduleData('class', '1');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取初始数据失败:', error);
      setLoading(false);
    }
  };

  // 获取课表数据
  const fetchScheduleData = async (type: 'class' | 'teacher' | 'classroom', id: string) => {
    setLoading(true);
    try {
      // 在实际项目中，这里应该调用API获取数据
      // 例如: const response = await fetch(`http://localhost:8080/api/schedule/${type}/${id}`);
      
      // 这里使用模拟数据
      setTimeout(() => {
        const mockScheduleData: CourseSchedule[] = generateMockSchedule(type, id);
        setCourseSchedules(mockScheduleData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error(`获取${type}课表数据失败:`, error);
      setLoading(false);
    }
  };

  // 生成模拟课表数据
  const generateMockSchedule = (type: string, id: string): CourseSchedule[] => {
    const courses = [
      '高等数学', '线性代数', '数据结构', '操作系统', '计算机网络', 
      '数据库原理', '软件工程', '人工智能', '编译原理', '计算机组成原理'
    ];
    
    const teachers = ['张教授', '李教授', '王教授', '赵教授', '钱教授'];
    const classrooms = ['教学楼A-101', '教学楼A-102', '教学楼B-201', '教学楼B-202', '实验楼C-101'];
    const classNames = ['计算机科学1班', '计算机科学2班', '软件工程1班', '软件工程2班', '数据科学1班'];
    
    // 生成10-15门随机排课
    const count = Math.floor(Math.random() * 6) + 10;
    const schedules: CourseSchedule[] = [];
    
    // 已占用时间槽，用于避免冲突
    const occupiedSlots = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      // 生成不冲突的时间槽
      let week, day, period;
      let slotKey;
      do {
        week = Math.floor(Math.random() * 16) + 1; // 1-16周
        day = Math.floor(Math.random() * 5) + 1; // 1-5 周一到周五
        period = Math.floor(Math.random() * 5); // 0-4 对应5个课时段
        slotKey = `${week}-${day}-${period}`;
      } while (occupiedSlots.has(slotKey));
      
      occupiedSlots.add(slotKey);
      
      const courseIndex = Math.floor(Math.random() * courses.length);
      const teacherIndex = Math.floor(Math.random() * teachers.length);
      const classroomIndex = Math.floor(Math.random() * classrooms.length);
      
      // 随机选择1-2个班级
      const classCount = Math.floor(Math.random() * 2) + 1;
      const selectedClasses = [];
      const usedClassIndices = new Set<number>();
      
      for (let j = 0; j < classCount; j++) {
        let classIndex;
        do {
          classIndex = Math.floor(Math.random() * classNames.length);
        } while (usedClassIndices.has(classIndex));
        
        usedClassIndices.add(classIndex);
        selectedClasses.push(classNames[classIndex]);
      }
      
      schedules.push({
        id: i + 1,
        courseName: courses[courseIndex],
        teacherName: teachers[teacherIndex],
        classroom: classrooms[classroomIndex],
        week,
        day,
        period,
        classNames: selectedClasses
      });
    }
    
    // 如果是按特定类型筛选，进一步过滤数据
    if (type === 'class') {
      const className = classNames[parseInt(id) - 1] || classNames[0];
      return schedules.filter(s => s.classNames.includes(className));
    } else if (type === 'teacher') {
      const teacherName = teachers[parseInt(id) - 1] || teachers[0];
      return schedules.filter(s => s.teacherName === teacherName);
    } else if (type === 'classroom') {
      const classroom = classrooms[parseInt(id) - 1] || classrooms[0];
      return schedules.filter(s => s.classroom === classroom);
    }
    
    return schedules;
  };

  // 处理查询类型变更
  const handleTypeChange = (type: 'class' | 'teacher' | 'classroom') => {
    setScheduleType(type);
    setSelectedId('');
    setCourseSchedules([]);
  };

  // 处理ID选择变更
  const handleIdChange = (id: string) => {
    setSelectedId(id);
    fetchScheduleData(scheduleType, id);
  };

  // 获取周几的中文名称
  const getDayName = (day: number) => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days[day - 1] || '';
  };

  // 获取课节的名称
  const getPeriodName = (period: number) => {
    const periods = ['第1-2节', '第3-4节', '第5-6节', '第7-8节', '第9-10节'];
    return periods[period] || '';
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 按照星期和课节对课程进行分组
  const getScheduleMatrix = () => {
    const matrix: (CourseSchedule | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
    
    courseSchedules.forEach(course => {
      if (course.day >= 1 && course.day <= 5 && course.period >= 0 && course.period <= 4) {
        matrix[course.day - 1][course.period] = course;
      }
    });
    
    return matrix;
  };

  const scheduleMatrix = getScheduleMatrix();

  return (
    <div className="schedule-result">
      <header className="schedule-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>排课结果</h1>
        </div>
      </header>

      <div className="schedule-content">
        <div className="schedule-filter">
          <div className="filter-type">
            <span>查看方式:</span>
            <div className="type-buttons">
              <button 
                className={`type-button ${scheduleType === 'class' ? 'active' : ''}`}
                onClick={() => handleTypeChange('class')}
              >
                按班级
              </button>
              <button 
                className={`type-button ${scheduleType === 'teacher' ? 'active' : ''}`}
                onClick={() => handleTypeChange('teacher')}
              >
                按教师
              </button>
              <button 
                className={`type-button ${scheduleType === 'classroom' ? 'active' : ''}`}
                onClick={() => handleTypeChange('classroom')}
              >
                按教室
              </button>
            </div>
          </div>

          <div className="filter-selection">
            <label htmlFor="selection-id">请选择{scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室'}:</label>
            <select 
              id="selection-id" 
              value={selectedId}
              onChange={(e) => handleIdChange(e.target.value)}
            >
              <option value="">请选择</option>
              {scheduleType === 'class' && classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
              {scheduleType === 'teacher' && teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
              {scheduleType === 'classroom' && classrooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            <div className="schedule-title">
              {scheduleType === 'class' && selectedId && classes.find(c => c.id === selectedId)?.name}
              {scheduleType === 'teacher' && selectedId && teachers.find(t => t.id === selectedId)?.name}
              {scheduleType === 'classroom' && selectedId && classrooms.find(r => r.id === selectedId)?.name}
              {' 课程表'}
            </div>

            {selectedId ? (
              <div className="schedule-table-container">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="time-header">时间</th>
                      <th>周一</th>
                      <th>周二</th>
                      <th>周三</th>
                      <th>周四</th>
                      <th>周五</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2, 3, 4].map(period => (
                      <tr key={period}>
                        <td className="time-cell">{getPeriodName(period)}</td>
                        {[1, 2, 3, 4, 5].map(day => {
                          const course = scheduleMatrix[day-1][period];
                          return (
                            <td key={day} className={`course-cell ${course ? 'has-course' : ''}`}>
                              {course && (
                                <div className="course-content">
                                  <div className="course-name">{course.courseName}</div>
                                  <div className="course-teacher">{course.teacherName}</div>
                                  <div className="course-classroom">{course.classroom}</div>
                                  <div className="course-week">第{course.week}周</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-selection">请选择要查看的{scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室'}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleResult;
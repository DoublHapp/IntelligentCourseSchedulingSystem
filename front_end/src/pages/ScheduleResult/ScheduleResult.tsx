import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleResult.scss';
//导出课表相关
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// 与后端 Assignment 实体对应的课程安排类型定义
interface Assignment {
  courseId: string;
  courseName: string;
  classRoomId: string;
  classRoomName: string;
  slot: string; // 格式: 5:1-2 周五1到2节
}

//TODO:1.搜索框没写 ;2.总览下，点击查看详情，点击显示课程列表，再点击隐藏无法隐藏


// 前端使用的扩展课程安排类型，包含更多展示信息
interface CourseSchedule {
  id: string;              // 使用 courseId 作为唯一标识
  courseId: string;        // 后端 Assignment 实体的 courseId
  courseName: string;      // 后端 Assignment 实体的 courseName
  classroom: string;       // 后端 Assignment 实体的 classRoomName
  classRoomId: string;     // 后端 Assignment 实体的 classRoomId
  day: number;            // 从 slot 解析出的上课日期 (1-7)
  period: number;         // 从 slot 解析出的上课节次 (0-4)
  startPeriod: number;    // 开始节次
  endPeriod: number;      // 结束节次
  slot: string;           // 原始 slot 字符串
  // 以下字段根据需要从其他 API 获取或临时设置为空/默认值
  week: number;           // 周次，默认为当前选中周次
  teacherName: string;    // 教师名称
  classNames: string[];   // 班级名称列表
  courseCode?: string;    // 课程代码
  credit?: number;        // 学分
}

// 视图类型定义
type ViewMode = 'week' | 'month' | 'semester' | 'overview';

// 查看方式类型定义
type ScheduleType = 'class' | 'teacher' | 'classroom' | 'overview';

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

const ScheduleResult = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('class');
  const [selectedId, setSelectedId] = useState<string>('');
  const [courseSchedules, setCourseSchedules] = useState<CourseSchedule[]>([]);
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新增状态
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(3); // 假设3月是第1学期，9月是第2学期
  const [selectedCourse, setSelectedCourse] = useState<CourseSchedule | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  // 添加新的状态来控制课程列表的显示和隐藏
  const [showCourseList, setShowCourseList] = useState(true);
  

  // 全部课程数据
  const [allCourseSchedules, setAllCourseSchedules] = useState<CourseSchedule[]>([]);
  const [courseStatistics, setCourseStatistics] = useState<{
    totalCourses: number;
    totalClassrooms: number;
    coursesByDay: number[];
    coursesByPeriod: number[];
  }>({
    totalCourses: 0,
    totalClassrooms: 0,
    coursesByDay: [0, 0, 0, 0, 0],
    coursesByPeriod: [0, 0, 0, 0, 0]
  });

  // 添加导出相关的状态
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

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

  // 点击其他地方关闭课程详情模态框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCourseDetail(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取初始数据
  const fetchInitialData = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      // 获取班级、教师和教室数据
      await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchClassrooms()
      ]);

      // 获取所有课程数据(用于总览)
      await fetchAllScheduleData();

      // 根据用户身份设置初始选择并获取相应数据
      if (userData.userIdentity === 'student') {
        setScheduleType('class');
        // 假设学生信息中有所属班级ID
        const classId = userData.classId || (classes.length > 0 ? classes[0].id : '');
        if (classId) {
          setSelectedId(classId);
          await fetchScheduleData('class', classId);
        }
      } else if (userData.userIdentity === 'teacher') {
        setScheduleType('teacher');
        // 使用教师ID
        const teacherId = userData.userId || (teachers.length > 0 ? teachers[0].id : '');
        if (teacherId) {
          setSelectedId(teacherId);
          await fetchScheduleData('teacher', teacherId);
        }
      } else {
        // 管理员默认查看总览
        setScheduleType('overview');
        setCourseSchedules(allCourseSchedules);
      }

      setLoading(false);
    } catch (error) {
      console.error('获取初始数据失败:', error);
      setError('获取初始数据失败，请确保后端服务已启动');
      setLoading(false);
    }
  };

  // 获取所有课程数据
  const fetchAllScheduleData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/assignments/getAll');
      if (!response.ok) {
        throw new Error(`获取所有课程数据失败: ${response.status}`);
      }

      const result: ApiResponse<Assignment[]> = await response.json();

      if (result.success && result.data) {
        // 转换后端数据为前端使用的格式
        const schedules = transformAssignmentsToSchedules(result.data);
        setAllCourseSchedules(schedules);
        
        // 计算课程统计信息
        calculateCourseStatistics(schedules);
      } else {
        setAllCourseSchedules([]);
        throw new Error(`获取所有课程数据失败: ${result.message}`);
      }
    } catch (error) {
      console.error('获取所有课程数据异常:', error);
      setError(`获取所有课程数据失败: ${error instanceof Error ? error.message : String(error)}`);
      setAllCourseSchedules([]);
    }
  };

  // 计算课程统计数据
  const calculateCourseStatistics = (schedules: CourseSchedule[]) => {
    // 统计课程总数
    const totalCourses = schedules.length;
    
    // 统计使用的教室数量
    const uniqueClassrooms = new Set(schedules.map(course => course.classRoomId));
    const totalClassrooms = uniqueClassrooms.size;
    
    // 统计各天的课程数量
    const coursesByDay = [0, 0, 0, 0, 0]; // 周一到周五
    
    // 统计各时段的课程数量
    const coursesByPeriod = [0, 0, 0, 0, 0]; // 第1-2节到第9-10节
    
    schedules.forEach(course => {
      if (course.day >= 1 && course.day <= 5) {
        coursesByDay[course.day - 1]++;
      }
      
      if (course.period >= 0 && course.period <= 4) {
        coursesByPeriod[course.period]++;
      }
    });
    
    setCourseStatistics({
      totalCourses,
      totalClassrooms,
      coursesByDay,
      coursesByPeriod
    });
  };

  // 获取班级数据
  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/assignments/classes');
      if (!response.ok) {
        throw new Error(`获取班级数据失败: ${response.status}`);
      }
      
      const result: ApiResponse<any[]> = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const classData = result.data.map(item => ({
          id: item.id || item.classId || item.class_id,
          name: item.name || item.className || item.class_name
        }));
        setClasses(classData);
      } else {
        setClasses([]);
        throw new Error('未获取到班级数据或数据为空');
      }
    } catch (error) {
      console.error('获取班级数据异常:', error);
      setError(`获取班级数据失败: ${error instanceof Error ? error.message : String(error)}`);
      setClasses([]);
    }
  };

  // 获取教师数据
  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/assignments/teachers');
      if (!response.ok) {
        throw new Error(`获取教师数据失败: ${response.status}`);
      }
      
      const result: ApiResponse<any[]> = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const teacherData = result.data.map(item => ({
          id: item.id || item.teacherId || item.teacher_id,
          name: item.name || item.teacherName || item.teacher_name
        }));
        setTeachers(teacherData);
      } else {
        setTeachers([]);
        throw new Error('未获取到教师数据或数据为空');
      }
    } catch (error) {
      console.error('获取教师数据异常:', error);
      setError(`获取教师数据失败: ${error instanceof Error ? error.message : String(error)}`);
      setTeachers([]);
    }
  };

  // 获取教室数据
  const fetchClassrooms = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/assignments/classrooms');
      if (!response.ok) {
        throw new Error(`获取教室数据失败: ${response.status}`);
      }
      
      const result: ApiResponse<any[]> = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        const classroomData = result.data.map(item => ({
          id: item.id || item.classroomId || item.classroom_id || item.classRoomId,
          name: item.name || item.classroomName || item.classroom_name || item.classRoomName
        }));
        setClassrooms(classroomData);
      } else {
        setClassrooms([]);
        throw new Error('未获取到教室数据或数据为空');
      }
    } catch (error) {
      console.error('获取教室数据异常:', error);
      setError(`获取教室数据失败: ${error instanceof Error ? error.message : String(error)}`);
      setClassrooms([]);
    }
  };

  // 获取课表数据
  const fetchScheduleData = async (type: ScheduleType, id: string) => {
    setLoading(true);
    setError(null);
    
    // 如果是总览模式，直接使用所有课程
    if (type === 'overview') {
      setCourseSchedules(allCourseSchedules);
      setLoading(false);
      return;
    }
    
    try {
      // 根据类型选择不同的API路径
      const apiUrl = `http://localhost:8080/api/assignments/${type}/${id}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`获取课表数据失败: ${response.status}`);
      }
      
      const result: ApiResponse<Assignment[]> = await response.json();
      
      if (result.success && result.data) {
        // 转换后端数据为前端使用的格式
        const schedules = transformAssignmentsToSchedules(result.data);
        setCourseSchedules(schedules);
      } else {
        setCourseSchedules([]);
        setError(`获取${getTypeLabel(type)}课表数据失败: ${result.message}`);
      }
    } catch (error) {
      console.error(`获取${getTypeLabel(type)}课表数据失败:`, error);
      setCourseSchedules([]);
      setError(`获取${getTypeLabel(type)}课表数据失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // 将后端Assignment转换为前端CourseSchedule
  const transformAssignmentsToSchedules = (assignments: Assignment[]): CourseSchedule[] => {
    return assignments.map((assignment) => {
      // 解析slot格式，例如 "5:1-2" 表示 周五第1-2节课
      const slotParts = assignment.slot ? assignment.slot.split(':') : ['1', '1'];
      const day = parseInt(slotParts[0]) || 1; // 默认为周一
      
      let startPeriod = 0;
      let endPeriod = 0;
      
      if (slotParts.length > 1) {
        const periodParts = slotParts[1].split('-');
        startPeriod = parseInt(periodParts[0]) - 1 || 0; // 转为0-based索引
        endPeriod = periodParts.length > 1 ? (parseInt(periodParts[1]) - 1 || 0) : startPeriod;
      }

      return {
        id: assignment.courseId,
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        classroom: assignment.classRoomName,
        classRoomId: assignment.classRoomId,
        day: day,
        period: startPeriod, // 使用开始节次作为主要显示
        startPeriod: startPeriod,
        endPeriod: endPeriod,
        slot: assignment.slot,
        week: currentWeek, // 使用当前选中的周次
        teacherName: '', // 后端数据中没有教师信息
        classNames: [], // 后端数据中没有班级信息
        courseCode: assignment.courseId, // 使用课程ID作为课程代码
        credit: 0 // 后端数据中没有学分信息
      };
    });
  };

  // 获取类型的中文标签
  const getTypeLabel = (type: ScheduleType): string => {
    switch(type) {
      case 'class': return '班级';
      case 'teacher': return '教师';
      case 'classroom': return '教室';
      case 'overview': return '总览';
      default: return type;
    }
  };

  // 处理查询类型变更
  const handleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    
    // 如果选择总览模式，直接显示所有课程
    if (type === 'overview') {
      setSelectedId('');
      setCourseSchedules(allCourseSchedules);
      return;
    }
    
    setSelectedId('');
    setCourseSchedules([]);
    setError(null);
  };

  // 处理ID选择变更
  const handleIdChange = (id: string) => {
    if (id) {
      setSelectedId(id);
      fetchScheduleData(scheduleType, id);
    } else {
      setSelectedId('');
      setCourseSchedules([]);
    }
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

  // 切换视图模式
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // 切换周次
  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
  };

  // 切换月份
  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
  };

  // 打开课程详情
  const handleCourseClick = (course: CourseSchedule) => {
    setSelectedCourse(course);
  setShowCourseDetail(true);
  
  // 在总览模式下点击详情时，隐藏课程列表
  if (scheduleType === 'overview') {
    setShowCourseList(false);
  }
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 按照星期和课节对课程进行分组 - 周视图
  const getWeekScheduleMatrix = () => {
    const matrix: (CourseSchedule | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));

    const filteredCourses = courseSchedules.filter(course =>
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );

    filteredCourses.forEach(course => {
      if (course.day >= 1 && course.day <= 5 && course.period >= 0 && course.period <= 4) {
        matrix[course.day - 1][course.period] = course;
      }
    });

    return matrix;
  };

  // 获取月视图课程数据
  const getMonthScheduleCourses = () => {
    // 月份对应的周次范围
    const monthWeekRanges: Record<number, number[]> = {
      3: [1, 2, 3, 4],
      4: [5, 6, 7, 8],
      5: [9, 10, 11, 12],
      6: [13, 14, 15, 16],
      9: [1, 2, 3, 4],
      10: [5, 6, 7, 8],
      11: [9, 10, 11, 12],
      12: [13, 14, 15, 16]
    };

    // 在实际应用中，应该是后端数据中有周次，然后根据月份筛选
    // 这里由于后端数据中没有周次信息，所以暂时不做过滤
    return courseSchedules.filter(course =>
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );
  };

  // 获取学期视图课程数据
  const getSemesterScheduleCourses = () => {
    // 所有课程都显示在学期视图中
    return courseSchedules.filter(course =>
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );
  };

  const weekScheduleMatrix = getWeekScheduleMatrix();
  const monthScheduleCourses = getMonthScheduleCourses();
  const semesterScheduleCourses = getSemesterScheduleCourses();

  // 渲染周视图
  const renderWeekView = () => {
    return (
      <div className="schedule-table-container" ref={exportRef}>
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
                  const course = weekScheduleMatrix[day - 1][period];
                  return (
                    <td
                      key={day}
                      className={`course-cell ${course ? 'has-course' : ''}`}
                      onClick={course ? () => handleCourseClick(course) : undefined}
                    >
                      {course && (
                        <div className="course-content">
                          <div className="course-name">{course.courseName}</div>
                          <div className="course-classroom">{course.classroom}</div>
                          <div className="course-id">课程ID: {course.courseId}</div>
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
    );
  };

  // 渲染月视图
  const renderMonthView = () => {
    // 分组课程，按周和天
    const coursesByWeekAndDay: Record<number, Record<number, CourseSchedule[]>> = {};
    
    // 为每个课程分配所属的周次
    const weeksInMonth = [1, 2, 3, 4]; // 当前月份的周数，简化处理
    
    // 为每一个课程随机分配在当前月的某个周
    const coursesWithWeeks = monthScheduleCourses.map(course => ({
      ...course,
      week: weeksInMonth[Math.floor(Math.random() * weeksInMonth.length)]
    }));
    
    // 按周和天分组
    coursesWithWeeks.forEach(course => {
      if (!coursesByWeekAndDay[course.week]) {
        coursesByWeekAndDay[course.week] = {};
      }
      if (!coursesByWeekAndDay[course.week][course.day]) {
        coursesByWeekAndDay[course.week][course.day] = [];
      }
      coursesByWeekAndDay[course.week][course.day].push(course);
    });

    return (
      <div className="month-view" ref={exportRef}>
        {weeksInMonth.map(week => (
          <div key={week} className="month-week">
            <h3>第{week}周</h3>
            <div className="month-days">
              {[1, 2, 3, 4, 5].map(day => (
                <div key={day} className="month-day">
                  <div className="month-day-header">{getDayName(day)}</div>
                  <div className="month-day-courses">
                    {coursesByWeekAndDay[week]?.[day]?.map((course, idx) => (
                      <div
                        key={idx}
                        className="month-course"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="month-course-name">{course.courseName}</div>
                        <div className="month-course-info">
                          {getPeriodName(course.period)} | {course.classroom}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染学期视图
  const renderSemesterView = () => {
    // 将课程按课程名称分组
    const coursesByName: Record<string, CourseSchedule[]> = {};
    semesterScheduleCourses.forEach(course => {
      if (!coursesByName[course.courseName]) {
        coursesByName[course.courseName] = [];
      }
      coursesByName[course.courseName].push(course);
    });

    return (
      <div className="semester-view" ref={exportRef}>
        <div className="semester-courses-container">
          {Object.entries(coursesByName).map(([courseName, courses]) => (
            <div key={courseName} className="semester-course-card">
              <div className="semester-course-header">
                <h3>{courseName}</h3>
                <div className="semester-course-code">{courses[0].courseId}</div>
              </div>
              <div className="semester-course-details">
                <div className="semester-course-classroom">教室: {courses[0].classroom}</div>
                <div className="semester-course-times">
                  <h4>上课时间:</h4>
                  <ul className="semester-times-list">
                    {courses.map((course, idx) => (
                      <li key={idx}>
                        {getDayName(course.day)} {getPeriodName(course.period)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button className="view-details-btn" onClick={() => handleCourseClick(courses[0])}>
                查看详情
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染总览视图
  const renderOverviewView = () => {
          // 过滤课程 - 确保使用allCourseSchedules作为数据源
  const filteredCourses = allCourseSchedules.filter(course =>
    searchQuery ?
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // 按星期统计课程数量
  const courseCountByDay = [0, 0, 0, 0, 0]; // 周一到周五
  filteredCourses.forEach(course => {
    if (course.day >= 1 && course.day <= 5) {
      courseCountByDay[course.day - 1]++;
    }
  });

  // 计算最大值和最小值用于百分比计算
  const maxCount = Math.max(...courseCountByDay, 1); // 避免除以0
  const minCount = Math.min(...courseCountByDay.filter(c => c > 0), maxCount);
  
  // 放大高度差异的因子 - 这将使差异更加明显
  const enhanceFactor = 0.5; // 可以调整这个值来控制对比度
  const calculateHeight = (count: number) => {
    if (count === 0) return '1%';
    
    // 基本高度比例
    let basePercentage = (count / maxCount) * 100;
    
    // 如果只有一个值或所有值都相同，直接返回
    if (maxCount === minCount) {
      return `${basePercentage}%`;
    }
    
    // 放大差异 - 将值范围从[minCount, maxCount]映射到[minCount * enhanceFactor, maxCount]
    // 这样可以让较小的值也有一定高度，同时放大差异
    const enhancedValue = minCount * enhanceFactor + 
                         (count - minCount) * (maxCount - minCount * enhanceFactor) / (maxCount - minCount);
    
    // 确保结果在20%到100%之间，让即使是最小的值也有明显的柱子
    return `${Math.max(20, (enhancedValue / maxCount) * 100)}%`;
  };

  // 获取柱子颜色 - 根据值的大小设置不同的颜色，使视觉区分更明显
  const getBarColor = (count: number) => {
    if (count === 0) return '#e0e0e0';
    
    const ratio = count / maxCount;
    if (ratio > 0.8) return '#1565C0'; // 深蓝色 - 多课程
    if (ratio > 0.6) return '#1976D2'; // 中蓝色
    if (ratio > 0.4) return '#2196F3'; // 浅蓝色
    if (ratio > 0.2) return '#64B5F6'; // 更浅蓝色
    return '#90CAF9'; // 最浅蓝色 - 少课程
  };

  return (
    <div className="overview-view" ref={exportRef}>
      <div className="overview-stats">
        <div className="stat-card">
          <h3>课程总数</h3>
          <div className="stat-value">{filteredCourses.length}</div>
        </div>
        <div className="stat-card">
          <h3>教室数量</h3>
          <div className="stat-value">{new Set(filteredCourses.map(c => c.classRoomId)).size}</div>
        </div>
        <div className="stat-card">
          <h3>周课程分布</h3>
          <div className="stat-chart">
            <div className="bar-chart">
              {courseCountByDay.map((count, idx) => (
                <div key={idx} className="chart-item">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: calculateHeight(count),
                      backgroundColor: getBarColor(count),
                      boxShadow: count > 0 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                      transition: 'height 0.5s, background-color 0.5s'
                    }}
                  ></div>
                  <div className="chart-label">{getDayName(idx + 1)}</div>
                  <div className="chart-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 根据showCourseList状态决定是否显示课程列表 */}
      {showCourseList && (
        <div className="overview-table-container">
          <div className="table-header">
            <h3>所有课程列表</h3>
            {showCourseDetail && (
              <button 
                className="toggle-list-button"
                onClick={() => setShowCourseList(!showCourseList)}
              >
                隐藏课程列表
              </button>
            )}
          </div>
          <table className="overview-table">
            <thead>
              <tr>
                <th>课程ID</th>
                <th>课程名称</th>
                <th>教室</th>
                <th>上课时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{course.courseId}</td>
                  <td>{course.courseName}</td>
                  <td>{course.classroom}</td>
                  <td>{getDayName(course.day)} {getPeriodName(course.period)}</td>
                  <td>
                    <button 
                      className="view-btn" 
                      onClick={() => handleCourseClick(course)}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  };


  // 添加导出和打印功能
  const handlePrint = () => {
    window.print();
  };

  // PDF导出 (需要安装依赖: html2canvas和jspdf)
  const handleExportPDF = async () => {
    try {
      // 动态导入html2canvas和jspdf以降低初始加载体积
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      if (exportRef.current) {
        // 创建一个显示提示的函数
        const showExportingMessage = () => {
          const message = document.createElement('div');
          message.className = 'export-message';
          message.textContent = '正在导出，请稍候...';
          document.body.appendChild(message);
          return message;
        };

        const messageElement = showExportingMessage();

        // 获取导出的内容
        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        // 创建PDF
        const pdf = new jsPDF({
          orientation: viewMode === 'week' ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // 获取文件名
        let typeName = '';
        let targetName = '';
        
        if (scheduleType === 'overview') {
          typeName = '总览';
          targetName = '全部课程';
        } else {
          typeName = scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室';
          targetName = scheduleType === 'class' ? classes.find(c => c.id === selectedId)?.name :
            scheduleType === 'teacher' ? teachers.find(t => t.id === selectedId)?.name :
              classrooms.find(c => c.id === selectedId)?.name || '';
        }
        
        const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` :
          viewMode === 'month' ? `${currentMonth}月` : 
          viewMode === 'semester' ? '学期' : '总览';

        const fileName = `${typeName}-${targetName}-${viewTypeName}课表.pdf`;
        pdf.save(fileName);

        // 移除提示消息
        document.body.removeChild(messageElement);
      }
    } catch (error) {
      console.error('导出PDF时出错:', error);
      alert('导出PDF失败，请稍后重试');
    }
  };

  // Excel导出
  const handleExportExcel = () => {
    try {
      // 准备数据
      const exportData = [];

      if (viewMode === 'week') {
        // 周视图导出
        const header = ['时间段', '周一', '周二', '周三', '周四', '周五'];
        exportData.push(header);

        [0, 1, 2, 3, 4].forEach(period => {
          const row = [getPeriodName(period)];
          [1, 2, 3, 4, 5].forEach(day => {
            const course = weekScheduleMatrix[day - 1][period];
            row.push(course ? `${course.courseName}\n${course.classroom}\n课程ID: ${course.courseId}` : '');
          });
          exportData.push(row);
        });
      } else if (viewMode === 'overview') {
        // 总览视图导出
        exportData.push(['课程ID', '课程名称', '教室', '星期', '节次']);
        
        courseSchedules.forEach(course => {
          exportData.push([
            course.courseId,
            course.courseName,
            course.classroom,
            getDayName(course.day),
            getPeriodName(course.period)
          ]);
        });
      } else {
        // 月视图或学期视图导出为课程列表
        exportData.push(['课程ID', '课程名称', '教室', '星期', '节次']);

        const coursesToExport = viewMode === 'month' ? monthScheduleCourses : semesterScheduleCourses;
        coursesToExport.forEach(course => {
          exportData.push([
            course.courseId,
            course.courseName,
            course.classroom,
            getDayName(course.day),
            getPeriodName(course.period)
          ]);
        });
      }

      // 创建工作表
      const ws = XLSX.utils.aoa_to_sheet(exportData);

      // 创建工作簿并添加工作表
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '课表');

      // 获取文件名
      let typeName = '';
      let targetName = '';
      
      if (scheduleType === 'overview') {
        typeName = '总览';
        targetName = '全部课程';
      } else {
        typeName = scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室';
        targetName = scheduleType === 'class' ? classes.find(c => c.id === selectedId)?.name :
          scheduleType === 'teacher' ? teachers.find(t => t.id === selectedId)?.name :
            classrooms.find(c => c.id === selectedId)?.name || '';
      }
      
      const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` :
        viewMode === 'month' ? `${currentMonth}月` : 
        viewMode === 'semester' ? '学期' : '总览';

      const fileName = `${typeName}-${targetName}-${viewTypeName}课表.xlsx`;

      // 导出工作簿
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('导出Excel时出错:', error);
      alert('导出Excel失败，请稍后重试');
    }
  };

  // CSV导出
  const handleExportCSV = () => {
    try {
      // 准备数据
      let csvContent = '';

      if (viewMode === 'week') {
        // 周视图导出
        csvContent += '时间段,周一,周二,周三,周四,周五\n';

        [0, 1, 2, 3, 4].forEach(period => {
          let row = `${getPeriodName(period)},`;
          [1, 2, 3, 4, 5].forEach(day => {
            const course = weekScheduleMatrix[day - 1][period];
            row += course ? `"${course.courseName} - ${course.classroom} - ${course.courseId}"` : '';
            row += day < 5 ? ',' : '';
          });
          csvContent += row + '\n';
        });
      } else if (viewMode === 'overview') {
        // 总览视图导出
        csvContent += '课程ID,课程名称,教室,星期,节次\n';
        
        courseSchedules.forEach(course => {
          csvContent += `"${course.courseId}","${course.courseName}","${course.classroom}","${getDayName(course.day)}","${getPeriodName(course.period)}"\n`;
        });
      } else {
        // 月视图或学期视图导出为课程列表
        csvContent += '课程ID,课程名称,教室,星期,节次\n';

        const coursesToExport = viewMode === 'month' ? monthScheduleCourses : semesterScheduleCourses;
        coursesToExport.forEach(course => {
          csvContent += `"${course.courseId}","${course.courseName}","${course.classroom}","${getDayName(course.day)}","${getPeriodName(course.period)}"\n`;
        });
      }

      // 创建Blob对象
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

      // 获取文件名
      let typeName = '';
      let targetName = '';
      
      if (scheduleType === 'overview') {
        typeName = '总览';
        targetName = '全部课程';
      } else {
        typeName = scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室';
        targetName = scheduleType === 'class' ? classes.find(c => c.id === selectedId)?.name :
          scheduleType === 'teacher' ? teachers.find(t => t.id === selectedId)?.name :
            classrooms.find(c => c.id === selectedId)?.name || '';
      }
      
      const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` :
        viewMode === 'month' ? `${currentMonth}月` : 
        viewMode === 'semester' ? '学期' : '总览';

      const fileName = `${typeName}-${targetName}-${viewTypeName}课表.csv`;

      // 导出CSV
      saveAs(blob, fileName);
    } catch (error) {
      console.error('导出CSV时出错:', error);
      alert('导出CSV失败，请稍后重试');
    }
  };


  return (
    <div className="schedule-result">
      <header className="schedule-header">
        <div className="header-title">
          <button className="back-button" onClick={handleBackToDashboard}>返回</button>
          <h1>排课结果</h1>
        </div>
      </header>

      <div className="schedule-content">
        <div className="schedule-controls">
          <div className="schedule-filter">
            <div className="filter-type">
              <span>查看方式:</span>
              <div className="type-buttons">
                <button
                  className={`type-button ${scheduleType === 'overview' ? 'active' : ''}`}
                  onClick={() => handleTypeChange('overview')}
                >
                  总览
                </button>
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

            {scheduleType !== 'overview' && (
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
            )}
          </div>

          {(selectedId || scheduleType === 'overview') && (
            <div className="view-controls">
              {/* 总览模式下只显示总览视图，不显示其他视图选项 */}
              {scheduleType !== 'overview' ? (
                <div className="view-modes">
                  <button
                    className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('week')}
                  >
                    周视图
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('month')}
                  >
                    月视图
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === 'semester' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('semester')}
                  >
                    学期视图
                  </button>
                </div>
              ) : (
                <div className="view-modes">
                  <button className="view-mode-btn active">总览视图</button>
                </div>
              )}

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="搜索课程、教室、课程ID..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {viewMode === 'week' && scheduleType !== 'overview' && (
                <div className="week-selector">
                  <button
                    className="week-nav-btn"
                    disabled={currentWeek <= 1}
                    onClick={() => handleWeekChange(currentWeek - 1)}
                  >
                    上一周
                  </button>
                  <select
                    value={currentWeek}
                    onChange={(e) => handleWeekChange(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 16 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>第{week}周</option>
                    ))}
                  </select>
                  <button
                    className="week-nav-btn"
                    disabled={currentWeek >= 16}
                    onClick={() => handleWeekChange(currentWeek + 1)}
                  >
                    下一周
                  </button>
                </div>
              )}

              {viewMode === 'month' && scheduleType !== 'overview' && (
                <div className="month-selector">
                  <select
                    value={currentMonth}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  >
                    <option value={3}>3月</option>
                    <option value={4}>4月</option>
                    <option value={5}>5月</option>
                    <option value={6}>6月</option>
                    <option value={9}>9月</option>
                    <option value={10}>10月</option>
                    <option value={11}>11月</option>
                    <option value={12}>12月</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {(selectedId || scheduleType === 'overview') && (
          <div className="export-controls">
            <button
              className="control-button"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <i className="fas fa-download"></i> 导出课表
            </button>
            <button
              className="control-button"
              onClick={handlePrint}
            >
              <i className="fas fa-print"></i> 打印课表
            </button>

            {showExportOptions && (
              <div className="export-options">
                <button onClick={handleExportPDF}>
                  导出为 PDF
                </button>
                <button onClick={handleExportExcel}>
                  导出为 Excel
                </button>
                <button onClick={handleExportCSV}>
                  导出为 CSV
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="schedule-title">
              {scheduleType === 'overview' ? '全部课程总览' : (
                <>
                  {scheduleType === 'class' && selectedId && classes.find(c => c.id === selectedId)?.name}
                  {scheduleType === 'teacher' && selectedId && teachers.find(t => t.id === selectedId)?.name}
                  {scheduleType === 'classroom' && selectedId && classrooms.find(r => r.id === selectedId)?.name}
                  {' '}
                  {viewMode === 'week' ? `第${currentWeek}周课程表` :
                    viewMode === 'month' ? `${currentMonth}月课程表` :
                      '学期课程总览'}
                </>
              )}
            </div>

            {scheduleType === 'overview' ? (
              // 总览模式
              <div className="schedule-view">
                {allCourseSchedules.length === 0 ? (
                  <div className="no-data">暂无排课数据</div>
                ) : (
                  renderOverviewView()
                )}
              </div>
            ) : selectedId ? (
              // 特定筛选模式
              <div className="schedule-view">
                {courseSchedules.length === 0 ? (
                  <div className="no-data">暂无排课数据</div>
                ) : (
                  <>
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'semester' && renderSemesterView()}
                  </>
                )}
              </div>
            ) : (
              // 尚未选择
              <div className="no-selection">请选择要查看的{scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室'}</div>
            )}
          </>
        )}

        {/* 课程详情模态框 */}
        {showCourseDetail && selectedCourse && (
           <div className="course-detail-modal">
           <div className="course-detail-content" ref={modalRef}>
             <div className="detail-header">
               <h2>{selectedCourse.courseName}</h2>
               <div className="detail-actions">
                 {scheduleType === 'overview' && (
                   <button 
                     className="toggle-list-button"
                     onClick={() => setShowCourseList(!showCourseList)}
                   >
                     {showCourseList ? '隐藏课程列表' : '显示课程列表'}
                   </button>
                 )}
                 <button className="close-modal-btn" onClick={() => {
                   setShowCourseDetail(false);
                   // 关闭详情时，恢复课程列表显示
                   setShowCourseList(true);
                 }}>×</button>
               </div>
             </div>
             <div className="course-detail-info">
               <div className="info-row">
                 <span className="info-label">课程ID:</span>
                 <span className="info-value">{selectedCourse.courseId}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">教室:</span>
                 <span className="info-value">{selectedCourse.classroom}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">上课时间:</span>
                 <span className="info-value">{getDayName(selectedCourse.day)} {getPeriodName(selectedCourse.period)}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">具体时段:</span>
                 <span className="info-value">{selectedCourse.slot}</span>
               </div>
             </div>
             <div className="course-actions">
               <button className="action-btn" onClick={handlePrint}>打印课表</button>
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleResult;
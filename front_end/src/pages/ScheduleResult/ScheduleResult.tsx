import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleResult.scss';
// 导入React图标库
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
//导出课表相关
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 与后端 Assignment 实体对应的课程安排类型定义
interface Assignment {
  courseId: string;
  courseName: string;
  classRoomId: string;
  classRoomName: string;
  slot: string; // 格式: 5:1-2 表示周五1到2节(不是第1-2周)
}

// 前端使用的扩展课程安排类型，包含更多展示信息
interface CourseSchedule {
  id: string;              // 使用 courseId 作为唯一标识
  courseId: string;        // 后端 Assignment 实体的 courseId
  courseName: string;      // 后端 Assignment 实体的 courseName
  classroom: string;       // 后端 Assignment 实体的 classRoomName
  classRoomId: string;     // 后端 Assignment 实体的 classRoomId
  day: number;            // 从 slot 解析出的上课日期 (1-7，表示周一到周日)
  period: number;         // 从 slot 解析出的上课节次 (0-7，表示第1-8节)
  startPeriod: number;    // 开始节次
  endPeriod: number;      // 结束节次
  slot: string;           // 当前显示的单个时间段
  fullSlot: string;       // 原始完整的slot字符串，包含所有时间段
}

// 视图类型定义
type ViewMode = 'week' | 'semester' | 'overview';

// 查看方式类型定义
type ScheduleType = 'class' | 'teacher' | 'classroom' | 'overview';

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// 在组件中定义周次范围常量
const MAX_WEEKS = 20; // 一个学期20周

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
    const coursesByPeriod = [0, 0, 0, 0, 0, 0, 0, 0]; // 第1节到第8节

    schedules.forEach(course => {
      if (course.day >= 1 && course.day <= 5) {
        coursesByDay[course.day - 1]++;
      }

      if (course.period >= 0 && course.period < 8) {
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
    const schedules: CourseSchedule[] = [];

    assignments.forEach((assignment) => {
      // 保存原始的完整slot字符串，用于显示在详情页
      const fullSlot = assignment.slot;

      // 处理slot格式，可能有多个时间段（如"1:1-2,2:1-2"）
      const slots = assignment.slot ? assignment.slot.split(',') : [];

      // 为每个时间段创建一个课程安排
      slots.forEach(slot => {
        // 解析slot格式，例如 "5:1-2" 表示 周五第1-2节课
        const slotParts = slot ? slot.split(':') : ['1', '1'];
        const day = parseInt(slotParts[0]) || 1; // 默认为周一

        let startPeriod = 0;
        let endPeriod = 0;

        if (slotParts.length > 1) {
          const periodParts = slotParts[1].split('-');
          startPeriod = parseInt(periodParts[0]) - 1 || 0; // 转为0-based索引
          endPeriod = periodParts.length > 1 ? (parseInt(periodParts[1]) - 1 || 0) : startPeriod;
        }

        // 为每一个完整的时间段创建一个对象
        schedules.push({
          id: assignment.courseId + '_' + slot, // 使用课程ID和时间段作为唯一标识
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          classroom: assignment.classRoomName,
          classRoomId: assignment.classRoomId,
          day: day,
          period: startPeriod, // 使用开始节次作为主要显示位置
          startPeriod: startPeriod,
          endPeriod: endPeriod,
          slot: slot,
          fullSlot: fullSlot  // 添加完整的slot信息
        });
      });
    });

    return schedules;
  };

  // 获取类型的中文标签
  const getTypeLabel = (type: ScheduleType): string => {
    switch (type) {
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

  // 获取课节的名称，支持单节和连续多节的不同显示格式
  const getPeriodName = (period: number, endPeriod?: number) => {
    if (endPeriod !== undefined && period !== endPeriod) {
      return `第${period + 1}-${endPeriod + 1}节`;
    }
    return `第${period + 1}节`;
  };

  // 返回仪表盘
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // 切换视图模式
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // 视图模式下，添加周次选择器
  const renderWeekSelector = () => {
    const handlePrevWeek = () => {
      if (currentWeek > 1) {
        setCurrentWeek(currentWeek - 1);
      }
    };

    const handleNextWeek = () => {
      if (currentWeek < MAX_WEEKS) {
        setCurrentWeek(currentWeek + 1);
      }
    };

    const handleWeekSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentWeek(parseInt(e.target.value));
    };

    return (
      <div className="week-selector">
        <span className="week-label">当前周次:</span>
        <div className="week-controls">
          <button
            className="week-button"
            onClick={handlePrevWeek}
            disabled={currentWeek <= 1}
          >
            <IoChevronBack />
          </button>
          <span className="week-display">第 {currentWeek} 周</span>
          <button
            className="week-button"
            onClick={handleNextWeek}
            disabled={currentWeek >= MAX_WEEKS}
          >
            <IoChevronForward />
          </button>
        </div>
        <div className="week-dropdown">
          <select
            value={currentWeek}
            onChange={handleWeekSelect}
          >
            {Array.from({ length: MAX_WEEKS }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                第 {week} 周
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  // 切换周次
  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
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
    const matrix: (CourseSchedule | null)[][] = Array(7).fill(null).map(() => Array(8).fill(null));

    const filteredCourses = courseSchedules.filter(course =>
    (searchQuery ?
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );

    // 首先填充矩阵中的所有课程位置
    filteredCourses.forEach(course => {
      if (course.day >= 1 && course.day <= 7) {
        // 对于每个课程，填充其所有占用的课节
        for (let period = course.startPeriod; period <= course.endPeriod && period < 8; period++) {
          matrix[course.day - 1][period] = course;
        }
      }
    });

    return matrix;
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
  const semesterScheduleCourses = getSemesterScheduleCourses();


  // 格式化slot字符串，使其更易读
  const formatSlot = (slot: string): string => {
    if (!slot) return '';

    // 分割多个时间段
    const slots = slot.split(',');

    // 格式化每个时间段
    return slots.map(s => {
      const parts = s.split(':');
      if (parts.length !== 2) return s;

      const day = parseInt(parts[0]);
      const dayName = getDayName(day);

      let periodText = parts[1];
      // 如果是类似1-2这样的格式，转换为"第1-2节"
      if (periodText.includes('-')) {
        const [start, end] = periodText.split('-');
        periodText = `第${start}-${end}节`;
      } else {
        periodText = `第${periodText}节`;
      }

      return `${dayName} ${periodText}`;
    }).join('，');
  };

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
              <th>周六</th>
              <th>周日</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(period => (
              <tr key={period}>
                <td className="time-cell">{getPeriodName(period)}</td>

                {[1, 2, 3, 4, 5, 6, 7].map(day => {
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
    const courseCountByDay = [0, 0, 0, 0, 0, 0, 0]; // 周一到周日
    filteredCourses.forEach(course => {
      if (course.day >= 1 && course.day <= 7) {
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
      // 归一化到20%-100%范围，并应用增强因子
      const normalized = 20 + (count - minCount) / (maxCount - minCount + 1) * 80 * (1 + enhanceFactor);
      return `${Math.min(100, normalized)}%`;
    };

    // 获取柱状图颜色
    const getBarColor = (count: number) => {
      if (count === 0) return '#eee';
      const intensity = Math.min(1, count / maxCount * 1.5);

      // 从浅蓝到深蓝的渐变
      return `rgba(66, 133, 244, ${0.3 + intensity * 0.7})`;
    };

    return (
      <div className="overview-container" ref={exportRef}>
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
                    <td>
                      {getDayName(course.day)}
                      {course.startPeriod === course.endPeriod
                        ? getPeriodName(course.startPeriod)
                        : `第${course.startPeriod + 1}-${course.endPeriod + 1}节`}
                    </td>
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
      if (!exportRef.current) return;

      // 添加正在导出的提示消息
      const messageElement = document.createElement('div');
      messageElement.style.position = 'fixed';
      messageElement.style.top = '50%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translate(-50%, -50%)';
      messageElement.style.background = 'rgba(0, 0, 0, 0.7)';
      messageElement.style.color = 'white';
      messageElement.style.padding = '20px';
      messageElement.style.borderRadius = '8px';
      messageElement.style.zIndex = '9999';
      messageElement.innerText = '正在生成PDF，请稍候...';
      document.body.appendChild(messageElement);

      // 使用html2canvas捕获当前视图
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
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

      const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` : '学期';

      const fileName = `${typeName}-${targetName}-${viewTypeName}课表.pdf`;
      pdf.save(fileName);

      // 移除提示消息
      document.body.removeChild(messageElement);
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
        const header = ['时间段', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        exportData.push(header);

        [0, 1, 2, 3, 4, 5, 6, 7].forEach(period => {
          const row = [getPeriodName(period)];
          [1, 2, 3, 4, 5, 6, 7].forEach(day => {
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
        // 学期视图导出为课程列表
        exportData.push(['课程ID', '课程名称', '教室', '星期', '节次']);

        const coursesToExport = semesterScheduleCourses;
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

      const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` : '学期';

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
        csvContent += '时间段,周一,周二,周三,周四,周五,周六,周日\n';

        [0, 1, 2, 3, 4, 5, 6, 7].forEach(period => {
          let row = `${getPeriodName(period)},`;
          [1, 2, 3, 4, 5, 6, 7].forEach(day => {
            const course = weekScheduleMatrix[day - 1][period];
            row += course ? `"${course.courseName} - ${course.classroom} - ${course.courseId}"` : '';
            row += day < 7 ? ',' : '';
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
        // 学期视图导出为课程列表
        csvContent += '课程ID,课程名称,教室,星期,节次\n';

        const coursesToExport = semesterScheduleCourses;
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

      const viewTypeName = viewMode === 'week' ? `第${currentWeek}周` : '学期';

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

            {/* 在周视图模式下显示周次选择器 */}
            {scheduleType !== 'overview' && viewMode === 'week' && selectedId && (
              renderWeekSelector()
            )}

            {scheduleType !== 'overview' && (
              <div className="filter-selection">
                <label htmlFor="selection-id">请选择{scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室'}:</label>
                <select
                  id="selection-id"
                  value={selectedId}
                  onChange={(e) => handleIdChange(e.target.value)}
                >
                  <option value="">请选择...</option>
                  {scheduleType === 'class' && classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {scheduleType === 'teacher' && teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  {scheduleType === 'classroom' && classrooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="view-controls">
            {scheduleType !== 'overview' && (
              <div className="view-modes">
                <button
                  className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('week')}
                >
                  周视图
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'semester' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('semester')}
                >
                  学期视图
                </button>
              </div>
            )}

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="搜索课程、教室、课程ID..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <button
              className="export-button"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              导出
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
        </div>

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
                  {viewMode === 'week' ? `第${currentWeek}周课程表` : '学期课程总览'}
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
                  <span className="info-label">当前时间段:</span>
                  <span className="info-value">
                    {getDayName(selectedCourse.day)}
                    {selectedCourse.startPeriod === selectedCourse.endPeriod
                      ? getPeriodName(selectedCourse.startPeriod)
                      : `第${selectedCourse.startPeriod + 1}-${selectedCourse.endPeriod + 1}节`}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">具体时段:</span>
                  <span className="info-value">{selectedCourse.slot}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">完整时间安排:</span>
                  <span className="info-value">{selectedCourse.fullSlot}</span>
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
import { useState, useEffect, useRef } from 'react';
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
  courseCode?: string;
  credit?: number;
}

// 视图类型定义
type ViewMode = 'week' | 'month' | 'semester';

const ScheduleResult = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<'class' | 'teacher' | 'classroom'>('class');
  const [selectedId, setSelectedId] = useState<string>('');
  const [courseSchedules, setCourseSchedules] = useState<CourseSchedule[]>([]);
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // 新增状态
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(3); // 假设3月是第1学期，9月是第2学期
  const [selectedCourse, setSelectedCourse] = useState<CourseSchedule | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

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

    const courseCodes = [
      'MATH101', 'MATH102', 'CS201', 'CS302', 'CS303',
      'CS304', 'SE301', 'AI401', 'CS401', 'CS201'
    ];

    const credits = [4, 3, 4, 3, 3, 4, 3, 3, 4, 3];

    const teachers = ['张教授', '李教授', '王教授', '赵教授', '钱教授'];
    const classrooms = ['教学楼A-101', '教学楼A-102', '教学楼B-201', '教学楼B-202', '实验楼C-101'];
    const classNames = ['计算机科学1班', '计算机科学2班', '软件工程1班', '软件工程2班', '数据科学1班'];

    // 生成15-25门随机排课
    const count = Math.floor(Math.random() * 11) + 15;
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
        courseCode: courseCodes[courseIndex],
        credit: credits[courseIndex],
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
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 按照星期和课节对课程进行分组 - 周视图
  const getWeekScheduleMatrix = () => {
    const matrix: (CourseSchedule | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));

    const filteredCourses = courseSchedules.filter(course =>
      (viewMode === 'week' ? course.week === currentWeek : true) &&
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase())
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
    // 月份对应的周次范围 (例如: 3月对应第1-4周，4月对应第5-8周)
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

    const weeksInMonth = monthWeekRanges[currentMonth] || [1, 2, 3, 4];

    return courseSchedules.filter(course =>
      weeksInMonth.includes(course.week) &&
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );
  };

  // 获取学期视图课程数据
  const getSemesterScheduleCourses = () => {
    // 根据月份判断学期 (例如: 3-6月为第1学期，9-12月为第2学期)
    const isFirstSemester = currentMonth >= 3 && currentMonth <= 6;
    const weeksInSemester = isFirstSemester ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] :
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    return courseSchedules.filter(course =>
      weeksInSemester.includes(course.week) &&
      (searchQuery ?
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.classroom.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );
  };

  const weekScheduleMatrix = getWeekScheduleMatrix();
  const monthScheduleCourses = getMonthScheduleCourses();
  const semesterScheduleCourses = getSemesterScheduleCourses();

  // 渲染周视图
  const renderWeekView = () => {
    return (
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
    );
  };

  // 渲染月视图
  const renderMonthView = () => {
    // 分组课程，按周和天
    const coursesByWeekAndDay: Record<number, Record<number, CourseSchedule[]>> = {};
    monthScheduleCourses.forEach(course => {
      if (!coursesByWeekAndDay[course.week]) {
        coursesByWeekAndDay[course.week] = {};
      }
      if (!coursesByWeekAndDay[course.week][course.day]) {
        coursesByWeekAndDay[course.week][course.day] = [];
      }
      coursesByWeekAndDay[course.week][course.day].push(course);
    });

    // 获取当前月的周次
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
    const weeksInMonth = monthWeekRanges[currentMonth] || [1, 2, 3, 4];

    return (
      <div className="month-view">
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
      <div className="semester-view">
        <div className="semester-courses-container">
          {Object.entries(coursesByName).map(([courseName, courses]) => (
            <div key={courseName} className="semester-course-card">
              <div className="semester-course-header">
                <h3>{courseName}</h3>
                <div className="semester-course-code">{courses[0].courseCode}</div>
              </div>
              <div className="semester-course-details">
                <div className="semester-course-teacher">教师: {courses[0].teacherName}</div>
                <div className="semester-course-credit">学分: {courses[0].credit}</div>
                <div className="semester-course-classes">班级: {courses[0].classNames.join(', ')}</div>
              </div>
              <div className="semester-course-schedule">
                <h4>上课时间:</h4>
                <ul className="semester-schedule-list">
                  {[...new Set(courses.map(c => `${c.week}-${c.day}-${c.period}`))].slice(0, 3).map((timeSlot, idx) => {
                    const [week, day, period] = timeSlot.split('-').map(Number);
                    return (
                      <li key={idx}>
                        第{week}周 {getDayName(day)} {getPeriodName(period)}
                      </li>
                    );
                  })}
                  {courses.length > 3 && <li className="more-schedules">+{courses.length - 3}个更多时间...</li>}
                </ul>
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

          {selectedId && (
            <div className="view-controls">
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

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="搜索课程、教师、教室..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {viewMode === 'week' && (
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

              {viewMode === 'month' && (
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

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            <div className="schedule-title">
              {scheduleType === 'class' && selectedId && classes.find(c => c.id === selectedId)?.name}
              {scheduleType === 'teacher' && selectedId && teachers.find(t => t.id === selectedId)?.name}
              {scheduleType === 'classroom' && selectedId && classrooms.find(r => r.id === selectedId)?.name}
              {' '}
              {viewMode === 'week' ? `第${currentWeek}周课程表` :
                viewMode === 'month' ? `${currentMonth}月课程表` :
                  '学期课程总览'}
            </div>

            {selectedId ? (
              <div className="schedule-view">
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'semester' && renderSemesterView()}
              </div>
            ) : (
              <div className="no-selection">请选择要查看的{scheduleType === 'class' ? '班级' : scheduleType === 'teacher' ? '教师' : '教室'}</div>
            )}
          </>
        )}

        {/* 课程详情模态框 */}
        {showCourseDetail && selectedCourse && (
          <div className="course-detail-modal">
            <div className="course-detail-content" ref={modalRef}>
              <button className="close-modal-btn" onClick={() => setShowCourseDetail(false)}>×</button>
              <h2>{selectedCourse.courseName}</h2>
              <div className="course-detail-info">
                <div className="info-row">
                  <span className="info-label">课程代码:</span>
                  <span className="info-value">{selectedCourse.courseCode || '未设置'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">学分:</span>
                  <span className="info-value">{selectedCourse.credit || '未设置'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">教师:</span>
                  <span className="info-value">{selectedCourse.teacherName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">班级:</span>
                  <span className="info-value">{selectedCourse.classNames.join(', ')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">教室:</span>
                  <span className="info-value">{selectedCourse.classroom}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">上课时间:</span>
                  <span className="info-value">第{selectedCourse.week}周 {getDayName(selectedCourse.day)} {getPeriodName(selectedCourse.period)}</span>
                </div>
              </div>
              <div className="course-actions">
                <button className="action-btn">导出到日历</button>
                <button className="action-btn">打印课表</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleResult;
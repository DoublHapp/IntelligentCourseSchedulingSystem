import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleResultAnalysis.scss';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

// 定义类型
interface AnalysisData {
    teacherWorkload: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
        }[];
    };
    classroomUtilization: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
            borderWidth: number;
        }[];
    };
    courseDistribution: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
            borderColor: string[];
            borderWidth: number;
        }[];
    };
    weeklyScheduleDistribution: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
            fill: boolean;
            tension: number;
        }[];
    };
    /* departmentComparison: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
            pointBackgroundColor: string[];
            pointBorderColor: string[];
            pointHoverBackgroundColor: string;
            pointHoverBorderColor: string;
        }[];
    }; */
    averageClassroomUtilization: number;
    conflictRate: number;
    totalTeachers: number;
    totalCourses: number;
}

// API 响应类型
interface ApiResponse<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
}
// 定义api返回类型
/**
 * public class AnalysisResult {
    private double conflictRate;
    private double averageClassroomUtilization;
    private Map<String, int[]> weeklyScheduleDistribution;
    private Map<String, Double> buildingUtilization;
    private Map<String, Integer> courseTypeDistribution;
}

 */
interface AnalysisData2 {
    conflictRate: number;
    averageClassroomUtilization: number;
    weeklyScheduleDistribution: { [key: string]: number[] };
    buildingUtilization: { [key: string]: number };
    courseTypeDistribution: { [key: string]: number };
    totalTeachers: number;
    totalCourses: number;
}

interface ResourceOptimizationSuggestion {
    id: number;
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    implementationDifficulty: 'high' | 'medium' | 'low';
}

const ScheduleAnalysis = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'classrooms' | 'courses' | 'optimization'>('overview');
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [optimizationSuggestions, setOptimizationSuggestions] = useState<ResourceOptimizationSuggestion[]>([]);
    const [timeRange, setTimeRange] = useState<'current' | 'semester' | 'year'>('current');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

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

            // 只有管理员可以访问排课分析页面
            if (userData.userIdentity !== 'administrator') {
                navigate('/dashboard');
                return;
            }

            // 加载分析数据
            fetchAnalysisData();
        } catch (error) {
            console.error('用户数据解析错误:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);

    // 获取分析数据
    const fetchAnalysisData = async () => {
        setLoading(true);
        try {
            //尝试获取数据
            const response = await fetch('http://localhost:8080/api/assignments/analysis');
            if (!response.ok) {
                throw new Error(`获取分析数据失败: ${response.status}`);
            }

            const result: ApiResponse<AnalysisData2> = await response.json();
            console.log(result);
            if (result.success && result.data) {
                const {
                    conflictRate,
                    averageClassroomUtilization,
                    weeklyScheduleDistribution,
                    buildingUtilization,
                    courseTypeDistribution,
                    totalTeachers,
                    totalCourses,
                } = result.data;
                // 模拟教师工作量数据
                const teacherWorkloadData = {
                    labels: ['张教授', '李教授', '王教授', '赵教授', '钱教授', '孙教授', '周教授', '吴教授'],
                    datasets: [
                        {
                            label: '周课时数',
                            data: [14, 16, 12, 18, 10, 16, 14, 8],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                };
                // 常用颜色映射
                const colorMap = {
                    colors: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColors: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    getColor(index: number) {
                        if(this.colors.length>index) return this.colors[index];
                        else return `rgba(${index * 50}, ${index * 30}, ${index * 20}, 0.6)`;
                    },
                    getBorderColor(index: number) {
                        if(this.borderColors.length>index) return this.borderColors[index];
                        else return `rgba(${index * 50}, ${index * 30}, ${index * 20}, 1)`;
                    }
                };
                // 教学楼使用率数据
                const classroomUtilizationData = {
                    labels: Object.keys(buildingUtilization),
                    datasets: [{
                        label: '教学楼使用率(%)',
                        data: Object.values(buildingUtilization).map(value => value * 100),
                        backgroundColor: Object.keys(buildingUtilization).map((_, index) => colorMap.getColor(index)),
                        borderColor: Object.keys(buildingUtilization).map((_, index) => colorMap.getBorderColor(index)),
                        borderWidth: 1,
                    }]
                };
                // 课程分布数据
                const courseDistributionData = {
                    labels: Object.keys(courseTypeDistribution),
                    datasets: [{
                        label: '课程数量',
                        data: Object.values(courseTypeDistribution),
                        backgroundColor: Object.keys(courseTypeDistribution).map((_, index) => colorMap.getColor(index)),
                        borderColor: Object.keys(courseTypeDistribution).map((_, index) => colorMap.getBorderColor(index)),
                        borderWidth: 1,
                    }]
                };
                // 周课程分布数据
                const weeklyDistributionData = {
                    labels: Object.keys(weeklyScheduleDistribution),
                    datasets: [
                        {
                            label: '上午课程数',
                            data: Object.values(weeklyScheduleDistribution).map((item) => item[0]),
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: '下午课程数',
                            data: Object.values(weeklyScheduleDistribution).map((item) => item[1]),
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }
                    ]
                };
                // 模拟院系对比数据
                /* const departmentComparisonData = {
                    labels: ['教师工作量', '教室使用率', '课程数量', '学生满意度', '排课均衡性', '资源利用率'],
                    datasets: [
                        {
                            label: '计算机学院',
                            data: [85, 90, 78, 75, 82, 88],
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: ['#FF6384', '#FF6384', '#FF6384', '#FF6384', '#FF6384', '#FF6384'],
                            pointBorderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                        },
                        {
                            label: '数学学院',
                            data: [80, 70, 65, 85, 75, 70],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: ['#36A2EB', '#36A2EB', '#36A2EB', '#36A2EB', '#36A2EB', '#36A2EB'],
                            pointBorderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                        }
                    ]
                }; */
                // 设置分析数据
                setAnalysisData({
                    teacherWorkload: teacherWorkloadData,
                    classroomUtilization: classroomUtilizationData,
                    courseDistribution: courseDistributionData,
                    weeklyScheduleDistribution: weeklyDistributionData,
                    // departmentComparison: departmentComparisonData,
                    averageClassroomUtilization: averageClassroomUtilization,
                    conflictRate: conflictRate,
                    totalTeachers: totalTeachers,
                    totalCourses: totalCourses,
                });

                // 模拟优化建议数据
                const mockSuggestions: ResourceOptimizationSuggestion[] = [
                    {
                        id: 1,
                        category: '教室资源',
                        title: '优化大型教室使用率',
                        description: '当前分析显示大型教室（100人以上）的使用率仅为40%，建议将部分大班课程安排在这些教室，提高资源利用效率。',
                        impact: 'high',
                        implementationDifficulty: 'low'
                    },
                    {
                        id: 2,
                        category: '教师工作量',
                        title: '平衡教师周课时分布',
                        description: '数据显示部分教师（如赵教授）周课时达到18小时，远高于平均水平。建议在下学期调整部分课程分配，使工作量更加均衡。',
                        impact: 'medium',
                        implementationDifficulty: 'medium'
                    },
                    {
                        id: 3,
                        category: '时间安排',
                        title: '减少周三上午的课程密度',
                        description: '周三上午的课程数量显著高于其他时间段，可能造成教室资源紧张。建议将部分课程调整至周一和周五下午等相对空闲的时段。',
                        impact: 'medium',
                        implementationDifficulty: 'low'
                    },
                    {
                        id: 4,
                        category: '教室分配',
                        title: '实验室资源优化',
                        description: '实验楼的使用率仅为65%，明显低于其他教学楼。建议重新评估实验课程安排，或考虑将部分适合的课程转移到实验楼进行。',
                        impact: 'high',
                        implementationDifficulty: 'medium'
                    },
                    {
                        id: 5,
                        category: '课程规划',
                        title: '调整课程类型比例',
                        description: '当前必修课比例过高（占比45%），而实践类课程较少（占比12%）。建议适当增加实践课程比例，提高教学质量和学生参与度。',
                        impact: 'high',
                        implementationDifficulty: 'high'
                    },
                ];

                setOptimizationSuggestions(mockSuggestions);
                setLoading(false);
            } else {
                throw new Error('未获取到班级数据或数据为空');
            };
        } catch (error) {
            console.error('获取分析数据失败:', error);
            setLoading(false);
        }
    };

    // 处理时间范围变更
    const handleTimeRangeChange = (range: 'current' | 'semester' | 'year') => {
        setTimeRange(range);
        // 在实际应用中，这里应该重新加载对应时间范围的数据
        // 这里仅做状态更新
    };

    // 处理选中院系变更
    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDepartment(e.target.value);
        // 在实际应用中，这里应该根据选中的院系筛选数据
        // 这里仅做状态更新
    };

    // 返回仪表盘
    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // 获取Impact标签样式
    const getImpactClass = (impact: string) => {
        switch (impact) {
            case 'high': return 'impact-high';
            case 'medium': return 'impact-medium';
            case 'low': return 'impact-low';
            default: return '';
        }
    };

    // 获取Difficulty标签样式
    const getDifficultyClass = (difficulty: string) => {
        switch (difficulty) {
            case 'high': return 'difficulty-high';
            case 'medium': return 'difficulty-medium';
            case 'low': return 'difficulty-low';
            default: return '';
        }
    };

    return (
        <div className="schedule-analysis">
            <header className="analysis-header">
                <div className="header-title">
                    <button className="back-button" onClick={handleBackToDashboard}>返回</button>
                    <h1>排课数据分析</h1>
                </div>
            </header>

            <div className="analysis-content">
                {loading ? (
                    <div className="loading">正在加载分析数据...</div>
                ) : (
                    <>
                        {/* <div className="analysis-controls">
                            <div className="time-range-selector">
                                <span>时间范围:</span>
                                <div className="range-buttons">
                                    <button
                                        className={`range-button ${timeRange === 'current' ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange('current')}
                                    >
                                        当前学期
                                    </button>
                                    <button
                                        className={`range-button ${timeRange === 'semester' ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange('semester')}
                                    >
                                        最近两学期
                                    </button>
                                    <button
                                        className={`range-button ${timeRange === 'year' ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange('year')}
                                    >
                                        学年数据
                                    </button>
                                </div>
                            </div>

                            <div className="department-selector">
                                <label htmlFor="department-select">选择院系:</label>
                                <select
                                    id="department-select"
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                >
                                    <option value="all">全部院系</option>
                                    <option value="cs">计算机科学与技术学院</option>
                                    <option value="math">数学学院</option>
                                    <option value="physics">物理学院</option>
                                    <option value="foreign">外国语学院</option>
                                </select>
                            </div>
                        </div> */}

                        {/* <div className="analysis-tabs">
                            <button
                                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                总览
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'teachers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('teachers')}
                            >
                                教师分析
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'classrooms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('classrooms')}
                            >
                                教室分析
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('courses')}
                            >
                                课程分析
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'optimization' ? 'active' : ''}`}
                                onClick={() => setActiveTab('optimization')}
                            >
                                优化建议
                            </button>
                        </div> */}

                        <div className="analysis-content-container">
                            {/* 总览 */}
                            {activeTab === 'overview' && analysisData && (
                                <div className="overview-panel">
                                    <div className="summary-cards">
                                        <div className="summary-card">
                                            <h3>教师总数</h3>
                                            <div className="card-value">{analysisData.totalTeachers}</div>
                                            {/* <div className="card-change positive">+3 较上学期</div> */}
                                        </div>
                                        <div className="summary-card">
                                            <h3>课程总数</h3>
                                            <div className="card-value">{analysisData.totalCourses}</div>
                                            {/* <div className="card-change positive">+5 较上学期</div> */}
                                        </div>
                                        <div className="summary-card">
                                            <h3>教室使用率</h3>
                                            <div className="card-value">{(
                                                analysisData.averageClassroomUtilization * 100).toFixed(2) + '%'
                                            }</div>
                                            {/* <div className="card-change positive">+2.3% 较上学期</div> */}
                                        </div>
                                        <div className="summary-card">
                                            <h3>排课冲突率</h3>
                                            <div className="card-value">{
                                                (analysisData.conflictRate * 100).toFixed(2) + '%'
                                            }</div>
                                            {/* <div className="card-change negative">-1.2% 较上学期</div> */}
                                        </div>
                                    </div>

                                    <div className="chart-container chart-row">
                                        {/* <div className="chart-wrapper">
                                            <h3>院系资源对比分析</h3>
                                            <div className="chart-box">
                                                <Radar
                                                    data={analysisData.departmentComparison}
                                                    options={{
                                                        scales: {
                                                            r: {
                                                                min: 0,
                                                                max: 100,
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    stepSize: 20
                                                                }
                                                            }
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div> */}
                                        <div className="chart-wrapper">
                                            <h3>周排课分布情况</h3>
                                            <div className="chart-box">
                                                <Line
                                                    data={analysisData.weeklyScheduleDistribution}
                                                    options={{
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="chart-container chart-row">
                                        <div className="chart-wrapper">
                                            <h3>课程类型分布</h3>
                                            <div className="chart-box">
                                                <Pie
                                                    data={analysisData.courseDistribution}
                                                    options={{
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="chart-wrapper">
                                            <h3>教学楼使用率</h3>
                                            <div className="chart-box">
                                                <Bar
                                                    data={analysisData.classroomUtilization}
                                                    options={{
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                title: {
                                                                    display: true,
                                                                    text: '使用率(%)'
                                                                }
                                                            }
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                display: false
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="insights-section">
                                        <h3>关键发现</h3>
                                        <div className="insights-container">
                                            <div className="insight-card">
                                                <div className="insight-icon positive">📈</div>
                                                <div className="insight-content">
                                                    <h4>教室资源利用率提升</h4>
                                                    <p>本学期总体教室使用率较上学期提高2.3%，特别是教学楼B的使用率达到92%，效率最高。</p>
                                                </div>
                                            </div>
                                            <div className="insight-card">
                                                <div className="insight-icon negative">⚠️</div>
                                                <div className="insight-content">
                                                    <h4>周三课程过于集中</h4>
                                                    <p>周三上午课程数量明显高于其他时段，可能导致教学资源紧张，建议适当调整。</p>
                                                </div>
                                            </div>
                                            <div className="insight-card">
                                                <div className="insight-icon neutral">📊</div>
                                                <div className="insight-content">
                                                    <h4>教师工作量分布不均</h4>
                                                    <p>部分教师周课时数达到18小时，而部分教师仅8小时，工作量分布不均衡。</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 教师分析 */}
                            {activeTab === 'teachers' && analysisData && (
                                <div className="teachers-panel">
                                    <div className="panel-header">
                                        <h2>教师工作量与排课分析</h2>
                                        <p>分析教师课时分布、工作量平衡性以及专业匹配度</p>
                                    </div>

                                    <div className="chart-container">
                                        <div className="chart-wrapper">
                                            <h3>教师周课时分布</h3>
                                            <div className="chart-box full-width">
                                                <Bar
                                                    data={analysisData.teacherWorkload}
                                                    options={{
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                title: {
                                                                    display: true,
                                                                    text: '周课时数'
                                                                }
                                                            }
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                display: false
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="teachers-statistics">
                                        <div className="stat-card">
                                            <h3>平均周课时</h3>
                                            <div className="stat-value">14.2</div>
                                            <div className="stat-comparison">
                                                <span className="label">最低:</span>
                                                <span className="value">8</span>
                                                <span className="label">最高:</span>
                                                <span className="value">18</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>课程数量/教师</h3>
                                            <div className="stat-value">2.6</div>
                                            <div className="stat-comparison">
                                                <span className="label">最低:</span>
                                                <span className="value">1</span>
                                                <span className="label">最高:</span>
                                                <span className="value">5</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>专业匹配度</h3>
                                            <div className="stat-value">92%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+3%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>教师满意度</h3>
                                            <div className="stat-value">4.2/5</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+0.3</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detailed-analysis">
                                        <h3>工作量异常教师分析</h3>
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>教师姓名</th>
                                                    <th>所属院系</th>
                                                    <th>职称</th>
                                                    <th>周课时</th>
                                                    <th>课程数量</th>
                                                    <th>专业匹配度</th>
                                                    <th>状态</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>赵教授</td>
                                                    <td>计算机学院</td>
                                                    <td>教授</td>
                                                    <td className="highlight-high">18</td>
                                                    <td>4</td>
                                                    <td>95%</td>
                                                    <td><span className="status overload">超负荷</span></td>
                                                </tr>
                                                <tr>
                                                    <td>吴教授</td>
                                                    <td>数学学院</td>
                                                    <td>副教授</td>
                                                    <td className="highlight-low">8</td>
                                                    <td>2</td>
                                                    <td>100%</td>
                                                    <td><span className="status underload">负荷不足</span></td>
                                                </tr>
                                                <tr>
                                                    <td>钱教授</td>
                                                    <td>物理学院</td>
                                                    <td>教授</td>
                                                    <td className="highlight-low">10</td>
                                                    <td>3</td>
                                                    <td className="highlight-low">85%</td>
                                                    <td><span className="status mismatch">专业不匹配</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="recommendation-section">
                                        <h3>教师排课优化建议</h3>
                                        <div className="recommendation-cards">
                                            <div className="recommendation-card">
                                                <h4>教师工作量均衡化</h4>
                                                <p>将赵教授的1-2门课程重新分配给吴教授，使两位教师的工作量更加均衡，避免教学质量受到影响。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-high">优先级高</span>
                                                    <span className="tag difficulty-medium">实施难度中</span>
                                                </div>
                                            </div>
                                            <div className="recommendation-card">
                                                <h4>提高专业匹配度</h4>
                                                <p>钱教授目前教授的"数据结构"课程与其专业背景不够匹配，建议调整为物理相关课程，提高教学质量。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-medium">优先级中</span>
                                                    <span className="tag difficulty-medium">实施难度中</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 教室分析 */}
                            {activeTab === 'classrooms' && analysisData && (
                                <div className="classrooms-panel">
                                    <div className="panel-header">
                                        <h2>教室资源利用分析</h2>
                                        <p>分析教室使用效率、容量匹配度及设施利用情况</p>
                                    </div>

                                    <div className="chart-container">
                                        <div className="chart-wrapper">
                                            <h3>各教学楼使用率</h3>
                                            <div className="chart-box">
                                                <Bar
                                                    data={analysisData.classroomUtilization}
                                                    options={{
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                max: 100,
                                                                title: {
                                                                    display: true,
                                                                    text: '使用率(%)'
                                                                }
                                                            }
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                display: false
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="chart-wrapper">
                                            <h3>教室类型使用效率</h3>
                                            <div className="chart-box">
                                                <Pie
                                                    data={{
                                                        labels: ['小型教室(<50人)', '中型教室(50-100人)', '大型教室(>100人)', '实验室', '多媒体教室'],
                                                        datasets: [{
                                                            label: '使用率(%)',
                                                            data: [85, 75, 40, 65, 90],
                                                            backgroundColor: [
                                                                'rgba(255, 99, 132, 0.6)',
                                                                'rgba(54, 162, 235, 0.6)',
                                                                'rgba(255, 206, 86, 0.6)',
                                                                'rgba(75, 192, 192, 0.6)',
                                                                'rgba(153, 102, 255, 0.6)',
                                                            ],
                                                            borderColor: [
                                                                'rgba(255, 99, 132, 1)',
                                                                'rgba(54, 162, 235, 1)',
                                                                'rgba(255, 206, 86, 1)',
                                                                'rgba(75, 192, 192, 1)',
                                                                'rgba(153, 102, 255, 1)',
                                                            ],
                                                            borderWidth: 1,
                                                        }]
                                                    }}
                                                    options={{
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="classrooms-statistics">
                                        <div className="stat-card">
                                            <h3>总体使用率</h3>
                                            <div className="stat-value">78.5%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+2.3%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>座位利用率</h3>
                                            <div className="stat-value">67.2%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+1.5%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>需求匹配度</h3>
                                            <div className="stat-value">82%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+4%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>设施利用率</h3>
                                            <div className="stat-value">75.8%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+3.2%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detailed-analysis">
                                        <h3>低利用率教室分析</h3>
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>教室编号</th>
                                                    <th>所属建筑</th>
                                                    <th>容量</th>
                                                    <th>类型</th>
                                                    <th>使用率</th>
                                                    <th>座位利用率</th>
                                                    <th>主要问题</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>教学楼A-301</td>
                                                    <td>教学楼A</td>
                                                    <td>120</td>
                                                    <td>大型教室</td>
                                                    <td className="highlight-low">35%</td>
                                                    <td className="highlight-low">42%</td>
                                                    <td>容量过大</td>
                                                </tr>
                                                <tr>
                                                    <td>实验楼C-201</td>
                                                    <td>实验楼</td>
                                                    <td>45</td>
                                                    <td>实验室</td>
                                                    <td className="highlight-low">48%</td>
                                                    <td>75%</td>
                                                    <td>设备专用性强</td>
                                                </tr>
                                                <tr>
                                                    <td>教学楼B-102</td>
                                                    <td>教学楼B</td>
                                                    <td>60</td>
                                                    <td>中型教室</td>
                                                    <td className="highlight-low">55%</td>
                                                    <td className="highlight-low">50%</td>
                                                    <td>位置偏远</td>
                                                </tr>
                                                <tr>
                                                    <td>图书馆-105</td>
                                                    <td>图书馆</td>
                                                    <td>80</td>
                                                    <td>多媒体教室</td>
                                                    <td className="highlight-low">62%</td>
                                                    <td className="highlight-low">58%</td>
                                                    <td>使用限制多</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="recommendation-section">
                                        <h3>教室资源优化建议</h3>
                                        <div className="recommendation-cards">
                                            <div className="recommendation-card">
                                                <h4>大型教室利用优化</h4>
                                                <p>建议将教学楼A-301的大型教室用于举办讲座、学术报告等活动，或将大型班级的课程安排在此，提高其使用率。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-high">优先级高</span>
                                                    <span className="tag difficulty-low">实施难度低</span>
                                                </div>
                                            </div>
                                            <div className="recommendation-card">
                                                <h4>实验室资源整合</h4>
                                                <p>实验楼C-201可以增加开放实验时间，鼓励学生进行自主实验和创新项目，提升资源利用率。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-medium">优先级中</span>
                                                    <span className="tag difficulty-medium">实施难度中</span>
                                                </div>
                                            </div>
                                            <div className="recommendation-card">
                                                <h4>座位容量优化</h4>
                                                <p>教室容量与实际使用人数匹配度低，建议重新评估各课程班级规模，合理分配教室资源。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-high">优先级高</span>
                                                    <span className="tag difficulty-medium">实施难度中</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 课程分析 */}
                            {activeTab === 'courses' && analysisData && (
                                <div className="courses-panel">
                                    <div className="panel-header">
                                        <h2>课程分布与时间安排分析</h2>
                                        <p>分析课程类型分布、时间安排及学生满意度</p>
                                    </div>

                                    <div className="chart-container chart-row">
                                        <div className="chart-wrapper">
                                            <h3>课程类型分布</h3>
                                            <div className="chart-box">
                                                <Pie
                                                    data={analysisData.courseDistribution}
                                                    options={{
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="chart-wrapper">
                                            <h3>周时间分布</h3>
                                            <div className="chart-box">
                                                <Line
                                                    data={analysisData.weeklyScheduleDistribution}
                                                    options={{
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                title: {
                                                                    display: true,
                                                                    text: '课程数量'
                                                                }
                                                            }
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="courses-statistics">
                                        <div className="stat-card">
                                            <h3>课程总数</h3>
                                            <div className="stat-value">110</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+5</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>必修课比例</h3>
                                            <div className="stat-value">45%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value negative">-3%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>实践课比例</h3>
                                            <div className="stat-value">12%</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+2%</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <h3>学生满意度</h3>
                                            <div className="stat-value">4.1/5</div>
                                            <div className="stat-comparison">
                                                <span className="label">较上学期:</span>
                                                <span className="value positive">+0.2</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detailed-analysis">
                                        <h3>时间分布异常分析</h3>
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>时间段</th>
                                                    <th>课程数量</th>
                                                    <th>平均课程数</th>
                                                    <th>偏差率</th>
                                                    <th>主要问题</th>
                                                    <th>状态</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>周三上午</td>
                                                    <td className="highlight-high">30</td>
                                                    <td>22</td>
                                                    <td className="highlight-high">+36%</td>
                                                    <td>课程过度集中</td>
                                                    <td><span className="status overload">过载</span></td>
                                                </tr>
                                                <tr>
                                                    <td>周五下午</td>
                                                    <td className="highlight-low">15</td>
                                                    <td>22</td>
                                                    <td className="highlight-low">-32%</td>
                                                    <td>课程不足</td>
                                                    <td><span className="status underload">空闲</span></td>
                                                </tr>
                                                <tr>
                                                    <td>周一第9-10节</td>
                                                    <td className="highlight-low">8</td>
                                                    <td>18</td>
                                                    <td className="highlight-low">-56%</td>
                                                    <td>晚间课程少</td>
                                                    <td><span className="status underload">空闲</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="recommendation-section">
                                        <h3>课程安排优化建议</h3>
                                        <div className="recommendation-cards">
                                            <div className="recommendation-card">
                                                <h4>调整课程集中度</h4>
                                                <p>建议将部分周三上午的课程调整至周五下午，缓解资源紧张情况，提高整体排课均衡性。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-high">优先级高</span>
                                                    <span className="tag difficulty-low">实施难度低</span>
                                                </div>
                                            </div>
                                            <div className="recommendation-card">
                                                <h4>增加实践课程比例</h4>
                                                <p>实践课程比例仅为12%，建议增加到15%以上，提高学生的实践能力和课程多样性。</p>
                                                <div className="recommendation-tags">
                                                    <span className="tag priority-high">优先级高</span>
                                                    <span className="tag difficulty-high">实施难度高</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 优化建议 */}
                            {activeTab === 'optimization' && (
                                <div className="optimization-panel">
                                    <div className="panel-header">
                                        <h2>排课优化建议</h2>
                                        <p>基于数据分析的建议，帮助提高教学资源利用效率和排课质量</p>
                                    </div>

                                    <div className="optimization-summary">
                                        <div className="summary-metrics">
                                            <div className="metric-item">
                                                <div className="metric-value">5</div>
                                                <div className="metric-label">关键建议</div>
                                            </div>
                                            <div className="metric-item">
                                                <div className="metric-value">8.5%</div>
                                                <div className="metric-label">预计资源利用提升</div>
                                            </div>
                                            <div className="metric-item">
                                                <div className="metric-value">12.3%</div>
                                                <div className="metric-label">预计成本节约</div>
                                            </div>
                                            <div className="metric-item">
                                                <div className="metric-value">3</div>
                                                <div className="metric-label">高优先级建议</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="suggestions-container">
                                        {optimizationSuggestions.map(suggestion => (
                                            <div key={suggestion.id} className="suggestion-card">
                                                <div className={`suggestion-category ${suggestion.category.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {suggestion.category}
                                                </div>
                                                <h3>{suggestion.title}</h3>
                                                <p>{suggestion.description}</p>
                                                <div className="suggestion-metrics">
                                                    <div className={`impact ${getImpactClass(suggestion.impact)}`}>
                                                        <span className="label">影响:</span>
                                                        <span className="value">{suggestion.impact === 'high' ? '高' : suggestion.impact === 'medium' ? '中' : '低'}</span>
                                                    </div>
                                                    <div className={`difficulty ${getDifficultyClass(suggestion.implementationDifficulty)}`}>
                                                        <span className="label">难度:</span>
                                                        <span className="value">{suggestion.implementationDifficulty === 'high' ? '高' :
                                                            suggestion.implementationDifficulty === 'medium' ? '中' : '低'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="action-plan">
                                        <h3>推荐实施计划</h3>
                                        <div className="timeline">
                                            <div className="timeline-item">
                                                <div className="timeline-point"></div>
                                                <div className="timeline-content">
                                                    <h4>近期 (1-2周)</h4>
                                                    <ul>
                                                        <li>调整周三上午课程密度，将部分课程移至空闲时段</li>
                                                        <li>优化大型教室使用安排，集中用于大班课程</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="timeline-item">
                                                <div className="timeline-point"></div>
                                                <div className="timeline-content">
                                                    <h4>中期 (1个月)</h4>
                                                    <ul>
                                                        <li>平衡教师工作量，重新分配高负荷教师的部分课程</li>
                                                        <li>实验室资源整合与开放时间调整</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="timeline-item">
                                                <div className="timeline-point"></div>
                                                <div className="timeline-content">
                                                    <h4>长期 (下学期)</h4>
                                                    <ul>
                                                        <li>增加实践类课程比例</li>
                                                        <li>推进教学资源全面优化方案</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
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

export default ScheduleAnalysis;
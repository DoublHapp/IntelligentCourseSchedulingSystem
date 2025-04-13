import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalizedRequest.scss';

// 个性化请求类型定义，与后端PersonalizedRequest实体严格对应
interface PersonalizedRequest {
    id?: number;
    userId: number;
    username: string;
    userIdentity: string; // 学生/教师
    taskId: string; // 课程ID
    preferDay: string; // 偏好上课的日期：周一、周二、周三、周四、周五
    preferPeriod: string; // 偏好上课的时段：上午/下午
}

// API响应类型定义
interface ApiResponse<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
}

// 课程类型定义
interface Course {
    courseId: string;
    courseName: string;
}

const PersonalizedRequest = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<PersonalizedRequest[]>([]);
    const [userCourses, setUserCourses] = useState<Course[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PersonalizedRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 表单状态
    const [formData, setFormData] = useState<PersonalizedRequest>({
        userId: 0,
        username: '',
        userIdentity: '',
        taskId: '',
        preferDay: '周一',
        preferPeriod: '上午'
    });

    // 可选的偏好日期
    const dayOptions = ['周一', '周二', '周三', '周四', '周五'];
    
    // 可选的偏好时段
    const periodOptions = ['上午', '下午'];

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

            // 只有教师或学生可以访问申请页面
            if (userData.userIdentity !== 'teacher' && userData.userIdentity !== 'student') {
                navigate('/dashboard');
                return;
            }

            // 加载数据
            fetchData(userData);
        } catch (error) {
            console.error('用户数据解析错误:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);

    // 获取用户的申请记录和课程数据
    const fetchData = async (userData: any) => {
        setLoading(true);
        setError(null);
        try {
            // 获取用户的申请记录
            const requestsResponse = await fetch(`http://localhost:8080/api/requests/user/${userData.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (!requestsResponse.ok) {
                throw new Error(`获取个性化申请记录失败: ${requestsResponse.status}`);
            }
            
            const requestsResult: ApiResponse<PersonalizedRequest[]> = await requestsResponse.json();
            
            if (!requestsResult.success) {
                throw new Error(requestsResult.message || '获取个性化申请记录失败');
            }
            
            setRequests(requestsResult.data || []);
            
            // 获取所有课程数据
            const coursesResponse = await fetch('http://localhost:8080/api/courses', {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (!coursesResponse.ok) {
                console.error('获取课程数据失败:', coursesResponse.status);
                setUserCourses([]);
            } else {
                const coursesResult: ApiResponse<any[]> = await coursesResponse.json();
                
                if (coursesResult.success && coursesResult.data) {
                    // 提取所有课程信息
                    const courses: Course[] = coursesResult.data.map(course => ({
                        courseId: course.courseId || course.id,
                        courseName: course.courseName || course.name
                    }));
                    
                    setUserCourses(courses);
                } else {
                    console.error('获取课程数据成功但没有数据');
                    setUserCourses([]);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error('加载数据失败:', error);
            setError(`加载数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
            setLoading(false);
        }
    };

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // 如果是选择课程，检查是否已经提交过该课程的申请
        if (name === 'taskId') {
            // 在编辑模式下，如果选择的课程与当前编辑的申请是同一个，则允许
            if (isEditMode && selectedRequest && selectedRequest.taskId === value) {
                setFormData({
                    ...formData,
                    [name]: value
                });
                setError(null);
                return;
            }
            
            // 检查是否已经存在同一课程的申请
            const existingRequest = requests.find(req => req.taskId === value);
            if (existingRequest) {
                setError('您已经对该课程提交过申请，请勿重复提交');
            } else {
                setError(null);
                setFormData({
                    ...formData,
                    [name]: value
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    
    // 准备添加新申请
    const handleAddRequest = () => {
        // 重置表单数据，设置当前用户信息
        setFormData({
            userId: user.id,
            username: user.username,
            userIdentity: user.userIdentity,
            taskId: '',
            preferDay: '周一',
            preferPeriod: '上午'
        });
        setIsAddMode(true);
        setIsEditMode(false);
        setSelectedRequest(null);
        setError(null);
    };

    // 准备编辑申请
    const handleEditRequest = (request: PersonalizedRequest) => {
        setSelectedRequest(request);
        setFormData({
            ...request
        });
        setIsEditMode(true);
        setIsAddMode(false);
        setError(null);
    };

    // 撤销申请
    const handleWithdrawRequest = async (request: PersonalizedRequest) => {
        if (window.confirm('确定要撤销此申请吗？撤销后将无法恢复。')) {
            try {
                const response = await fetch(`http://localhost:8080/api/requests/${request.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
                }

                const result = await response.json();

                if (result.success) {
                    alert('申请已成功撤销');
                    // 刷新数据
                    fetchData(user);
                    
                    // 如果正在编辑被撤销的申请，则关闭编辑表单
                    if (selectedRequest && selectedRequest.id === request.id) {
                        setIsEditMode(false);
                        setSelectedRequest(null);
                    }
                } else {
                    setError(result.message || '撤销申请失败');
                }
            } catch (error) {
                console.error('撤销申请失败:', error);
                setError(`撤销申请失败: ${error instanceof Error ? error.message : '未知错误'}`);
            }
        }
    };

    // 取消添加或编辑
    const handleCancel = () => {
        setIsAddMode(false);
        setIsEditMode(false);
        setSelectedRequest(null);
        setFormData({
            userId: user.id,
            username: user.username,
            userIdentity: user.userIdentity,
            taskId: '',
            preferDay: '周一',
            preferPeriod: '上午'
        });
        setError(null);
    };

    // 提交申请
    const handleSubmitRequest = async () => {
        if (!formData.taskId) {
            setError('请选择相关课程');
            return;
        }

        // 编辑模式下检查是否更改了课程，如果更改了则需要检查是否与已有申请冲突
        if (isEditMode && selectedRequest && formData.taskId !== selectedRequest.taskId) {
            // 检查是否已经存在同一课程的申请
            const existingRequest = requests.find(req => req.taskId === formData.taskId && req.id !== selectedRequest.id);
            if (existingRequest) {
                setError('您已经对该课程提交过申请，请勿重复提交');
                return;
            }
        }

        try {
            let requestData: PersonalizedRequest = {
                ...formData,
                userId: user.id,
                username: user.username,
                userIdentity: user.userIdentity
            };
            
            let url = 'http://localhost:8080/api/requests';
            let method = 'POST';
            let successMessage = '申请已成功提交！';
            
            if (isEditMode && selectedRequest && selectedRequest.id) {
                requestData.id = selectedRequest.id;
                url = `http://localhost:8080/api/requests/${selectedRequest.id}`;
                method = 'PUT';
                successMessage = '申请修改成功！';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 成功提交后，重新获取最新的申请列表
                await fetchData(user);
                
                setIsAddMode(false);
                setIsEditMode(false);
                setSelectedRequest(null);
                setFormData({
                    userId: user.id,
                    username: user.username,
                    userIdentity: user.userIdentity,
                    taskId: '',
                    preferDay: '周一',
                    preferPeriod: '上午'
                });
                setError(null);
                alert(successMessage);
            } else {
                setError(result.message || (isEditMode ? '修改申请失败' : '提交申请失败'));
            }
        } catch (error) {
            console.error(isEditMode ? '修改申请失败:' : '提交申请失败:', error);
            setError(`${isEditMode ? '修改' : '提交'}申请失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    };

    // 返回仪表盘
    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // 获取课程名称通过ID
    const getCourseNameById = (courseId: string): string => {
        const course = userCourses.find(c => c.courseId === courseId);
        return course ? course.courseName : courseId;
    };

    // 过滤可选课程，剔除已经申请过的课程
    const getAvailableCourses = () => {
        if (isEditMode && selectedRequest) {
            // 编辑模式下，除了当前课程外，排除已申请的其他课程
            return userCourses.filter(course => 
                course.courseId === selectedRequest.taskId || 
                !requests.some(req => req.taskId === course.courseId && req.id !== selectedRequest.id)
            );
        } else {
            // 添加模式下，排除所有已申请的课程
            return userCourses.filter(course => 
                !requests.some(req => req.taskId === course.courseId)
            );
        }
    };

    return (
        <div className="personalized-request">
            <header className="request-header">
                <div className="header-title">
                    <button className="back-button" onClick={handleBackToDashboard}>返回</button>
                    <h1>个性化申请</h1>
                </div>
            </header>

            <div className="request-content">
                {loading ? (
                    <div className="loading">加载中...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="request-tools">
                            <button 
                                className="add-request-button" 
                                onClick={handleAddRequest}
                                disabled={isAddMode || isEditMode}
                            >
                                提交新申请
                            </button>
                        </div>

                        {(isAddMode || isEditMode) && (
                            <div className="request-form">
                                <h3>{isEditMode ? '修改申请' : '提交新申请'}</h3>

                                {error && <div className="form-error">{error}</div>}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="taskId">相关课程 <span className="required">*</span></label>
                                        <select
                                            id="taskId"
                                            name="taskId"
                                            value={formData.taskId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">请选择课程</option>
                                            {getAvailableCourses().map(course => (
                                                <option key={course.courseId} value={course.courseId}>
                                                    {course.courseId} - {course.courseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="preferDay">偏好上课日期 <span className="required">*</span></label>
                                        <select
                                            id="preferDay"
                                            name="preferDay"
                                            value={formData.preferDay}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {dayOptions.map((day, index) => (
                                                <option key={index} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="preferPeriod">偏好时段 <span className="required">*</span></label>
                                        <select
                                            id="preferPeriod"
                                            name="preferPeriod"
                                            value={formData.preferPeriod}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {periodOptions.map((period, index) => (
                                                <option key={index} value={period}>{period}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="submit-button"
                                        onClick={handleSubmitRequest}
                                        disabled={!!error || !formData.taskId}
                                    >
                                        {isEditMode ? '保存修改' : '提交申请'}
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

                        <div className="requests-list">
                            <h2>我的申请记录</h2>

                            {requests.length === 0 ? (
                                <div className="no-requests">您还没有提交过申请</div>
                            ) : (
                                <div className="requests-container">
                                    {requests.map(request => (
                                        <div key={request.id} className="request-card">
                                            <div className="request-header">
                                                <h3>课程偏好申请 - {getCourseNameById(request.taskId)}</h3>
                                            </div>

                                            <div className="request-info">
                                                <div className="info-row">
                                                    <span className="info-label">课程ID:</span>
                                                    <span className="info-value">{request.taskId}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">偏好日期:</span>
                                                    <span className="info-value">{request.preferDay}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">偏好时段:</span>
                                                    <span className="info-value">{request.preferPeriod}</span>
                                                </div>
                                            </div>

                                            <div className="request-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEditRequest(request)}
                                                    disabled={isAddMode || isEditMode}
                                                >
                                                    修改
                                                </button>
                                                <button
                                                    className="withdraw-button"
                                                    onClick={() => handleWithdrawRequest(request)}
                                                    disabled={isAddMode || isEditMode}
                                                >
                                                    撤销
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PersonalizedRequest;
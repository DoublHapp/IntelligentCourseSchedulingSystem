import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalizedRequest.scss';

// 申请类型定义
interface Request {
    id: number;
    userId: number;
    username: string;
    userType: 'teacher' | 'student';
    title: string;
    requestType: string;
    courseId?: number;
    courseName?: string;
    originalTimeSlot?: string;
    preferredTimeSlot?: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    submissionTime: string;
    responseTime?: string;
    responseMessage?: string;
    adminId?: number;
    adminName?: string;
}

// 课程类型定义
interface Course {
    id: number;
    code: string;
    name: string;
}

const PersonalizedRequest = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [userCourses, setUserCourses] = useState<Course[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 表单状态
    const [formData, setFormData] = useState({
        title: '',
        requestType: '调整上课时间',
        courseId: '',
        originalTimeSlot: '',
        preferredTimeSlot: '',
        reason: ''
    });

    // 可选的申请类型
    const requestTypes = [
        '调整上课时间',
        '更换教室',
        '增加教学设施',
        '特殊教学安排',
        '其他'
    ];

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
        try {
            // 在实际项目中，这里应该调用API获取数据
            // 模拟用户课程数据
            const mockCourses: Course[] = [];

            if (userData.userIdentity === 'teacher') {
                // 教师所教授的课程
                mockCourses.push(
                    { id: 1, code: 'CS101', name: '计算机导论' },
                    { id: 2, code: 'CS201', name: '数据结构' },
                    { id: 3, code: 'CS301', name: '操作系统' }
                );
            } else if (userData.userIdentity === 'student') {
                // 学生所选的课程
                mockCourses.push(
                    { id: 1, code: 'CS101', name: '计算机导论' },
                    { id: 4, code: 'MATH101', name: '高等数学(上)' },
                    { id: 7, code: 'ENG101', name: '大学英语' }
                );
            }

            // 模拟用户已提交的申请
            const mockRequests: Request[] = [
                {
                    id: 1,
                    userId: userData.id,
                    username: userData.username,
                    userType: userData.userIdentity as 'teacher' | 'student',
                    title: '申请将计算机导论调整到下午上课',
                    requestType: '调整上课时间',
                    courseId: 1,
                    courseName: '计算机导论',
                    originalTimeSlot: '周一上午1-2节',
                    preferredTimeSlot: '周一下午5-6节',
                    reason: '上午有重要会议需要参加，希望调整到下午上课。',
                    status: 'pending',
                    submissionTime: '2023-06-15 09:30:00'
                },
                {
                    id: 2,
                    userId: userData.id,
                    username: userData.username,
                    userType: userData.userIdentity as 'teacher' | 'student',
                    title: '申请更换教室到多媒体教室',
                    requestType: '更换教室',
                    courseId: userData.userIdentity === 'teacher' ? 2 : 4,
                    courseName: userData.userIdentity === 'teacher' ? '数据结构' : '高等数学(上)',
                    reason: '当前教室没有多媒体设备，不方便演示课件。',
                    status: 'approved',
                    submissionTime: '2023-05-20 14:20:00',
                    responseTime: '2023-05-22 10:15:00',
                    responseMessage: '已安排新教室：教学楼A 203（多媒体教室）',
                    adminId: 1,
                    adminName: 'admin'
                },
                {
                    id: 3,
                    userId: userData.id,
                    username: userData.username,
                    userType: userData.userIdentity as 'teacher' | 'student',
                    title: '申请增加实验课时',
                    requestType: '特殊教学安排',
                    courseId: userData.userIdentity === 'teacher' ? 3 : 7,
                    courseName: userData.userIdentity === 'teacher' ? '操作系统' : '大学英语',
                    reason: '当前课时不足以完成所有实验内容，希望增加实验课时。',
                    status: 'rejected',
                    submissionTime: '2023-05-10 16:45:00',
                    responseTime: '2023-05-12 09:30:00',
                    responseMessage: '本学期课时已排满，建议在课后安排补充实验。',
                    adminId: 1,
                    adminName: 'admin'
                }
            ];

            setUserCourses(mockCourses);
            setRequests(mockRequests);
            setLoading(false);
        } catch (error) {
            console.error('加载数据失败:', error);
            setError('加载数据失败，请重试');
            setLoading(false);
        }
    };

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // 如果选择了课程，自动填写当前时间段
        if (name === 'courseId' && value) {
            const courseId = parseInt(value);
            const selectedCourse = userCourses.find(course => course.id === courseId);

            if (selectedCourse) {
                // 这里可以根据课程ID获取实际的课程时间段
                // 在实际应用中，应该从后端获取该课程的实际排课时间
                const mockTimeSlot = courseId === 1 ? '周一上午1-2节' :
                    courseId === 2 ? '周二下午5-6节' :
                        courseId === 3 ? '周三上午3-4节' :
                            courseId === 4 ? '周四下午1-2节' :
                                '未知时间段';

                setFormData(prevData => ({
                    ...prevData,
                    originalTimeSlot: mockTimeSlot
                }));
            }
        }
    };

    // 准备添加新申请
    const handleAddRequest = () => {
        setFormData({
            title: '',
            requestType: '调整上课时间',
            courseId: '',
            originalTimeSlot: '',
            preferredTimeSlot: '',
            reason: ''
        });
        setIsAddMode(true);
    };

    // 取消添加
    const handleCancel = () => {
        setIsAddMode(false);
        setFormData({
            title: '',
            requestType: '调整上课时间',
            courseId: '',
            originalTimeSlot: '',
            preferredTimeSlot: '',
            reason: ''
        });
    };

    // 提交申请
    const handleSubmitRequest = () => {
        if (!formData.title || !formData.reason) {
            setError('标题和申请理由不能为空');
            return;
        }

        // 如果是调整时间类型的申请，则需要填写首选时间
        if (formData.requestType === '调整上课时间' && !formData.preferredTimeSlot) {
            setError('请填写首选时间段');
            return;
        }

        // 创建新申请
        const selectedCourse = formData.courseId ?
            userCourses.find(course => course.id === parseInt(formData.courseId)) : undefined;

        const newRequest: Request = {
            id: Math.max(...requests.map(r => r.id), 0) + 1,
            userId: user.id,
            username: user.username,
            userType: user.userIdentity as 'teacher' | 'student',
            title: formData.title,
            requestType: formData.requestType,
            courseId: selectedCourse ? parseInt(formData.courseId) : undefined,
            courseName: selectedCourse?.name,
            originalTimeSlot: formData.originalTimeSlot || undefined,
            preferredTimeSlot: formData.preferredTimeSlot || undefined,
            reason: formData.reason,
            status: 'pending',
            submissionTime: new Date().toLocaleString()
        };

        setRequests([newRequest, ...requests]);
        setError(null);
        setIsAddMode(false);
        setFormData({
            title: '',
            requestType: '调整上课时间',
            courseId: '',
            originalTimeSlot: '',
            preferredTimeSlot: '',
            reason: ''
        });

        // 显示成功消息
        alert('申请已成功提交！');
    };

    // 返回仪表盘
    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // 获取状态标签样式
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    };

    // 获取状态中文名称
    const getStatusName = (status: string) => {
        switch (status) {
            case 'pending': return '待处理';
            case 'approved': return '已批准';
            case 'rejected': return '已拒绝';
            default: return status;
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
                            <button className="add-request-button" onClick={handleAddRequest}>
                                提交新申请
                            </button>
                        </div>

                        {isAddMode && (
                            <div className="request-form">
                                <h3>提交新申请</h3>

                                {error && <div className="form-error">{error}</div>}

                                <div className="form-group">
                                    <label htmlFor="title">申请标题 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="例如：申请调整课程时间"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="requestType">申请类型</label>
                                        <select
                                            id="requestType"
                                            name="requestType"
                                            value={formData.requestType}
                                            onChange={handleInputChange}
                                        >
                                            {requestTypes.map((type, index) => (
                                                <option key={index} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="courseId">相关课程</label>
                                        <select
                                            id="courseId"
                                            name="courseId"
                                            value={formData.courseId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">请选择课程</option>
                                            {userCourses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="originalTimeSlot">原时间段</label>
                                        <input
                                            type="text"
                                            id="originalTimeSlot"
                                            name="originalTimeSlot"
                                            value={formData.originalTimeSlot}
                                            onChange={handleInputChange}
                                            placeholder="例如：周一上午1-2节"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="preferredTimeSlot">
                                            首选时间段
                                            {formData.requestType === '调整上课时间' && <span className="required">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            id="preferredTimeSlot"
                                            name="preferredTimeSlot"
                                            value={formData.preferredTimeSlot}
                                            onChange={handleInputChange}
                                            placeholder="例如：周二下午5-6节"
                                            required={formData.requestType === '调整上课时间'}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reason">申请理由 <span className="required">*</span></label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        placeholder="请详细说明您的申请理由..."
                                        required
                                        rows={5}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="submit-button"
                                        onClick={handleSubmitRequest}
                                    >
                                        提交
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
                                                <h3>{request.title}</h3>
                                                <div className={`request-status ${getStatusClass(request.status)}`}>
                                                    {getStatusName(request.status)}
                                                </div>
                                            </div>

                                            <div className="request-info">
                                                <div className="info-row">
                                                    <span className="info-label">申请类型:</span>
                                                    <span className="info-value">{request.requestType}</span>
                                                </div>

                                                {request.courseName && (
                                                    <div className="info-row">
                                                        <span className="info-label">相关课程:</span>
                                                        <span className="info-value">{request.courseName}</span>
                                                    </div>
                                                )}

                                                {request.originalTimeSlot && (
                                                    <div className="info-row">
                                                        <span className="info-label">原时间段:</span>
                                                        <span className="info-value">{request.originalTimeSlot}</span>
                                                    </div>
                                                )}

                                                {request.preferredTimeSlot && (
                                                    <div className="info-row">
                                                        <span className="info-label">首选时间段:</span>
                                                        <span className="info-value">{request.preferredTimeSlot}</span>
                                                    </div>
                                                )}

                                                <div className="info-row">
                                                    <span className="info-label">申请理由:</span>
                                                    <span className="info-value reason">{request.reason}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="info-label">提交时间:</span>
                                                    <span className="info-value">{request.submissionTime}</span>
                                                </div>
                                            </div>

                                            {(request.status === 'approved' || request.status === 'rejected') && (
                                                <div className="response-section">
                                                    <h4>教务处回复</h4>
                                                    <div className="response-content">
                                                        <p className="response-message">{request.responseMessage}</p>
                                                        <div className="response-info">
                                                            <span>处理人: {request.adminName}</span>
                                                            <span>回复时间: {request.responseTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
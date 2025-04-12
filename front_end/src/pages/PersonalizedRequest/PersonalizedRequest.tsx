import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalizedRequest.scss';

// 申请类型定义，与后端PersonalizedRequest实体对应
// 更新Request接口定义
interface Request {
    id: number;
    userId: number;
    username: string;
    userIdentity: string;  // 学生/教师
    title?: string;        // 前端添加的字段，后端没有这个字段
    requestType: string;   // 调整上课时间、更换教室等
    courseId?: string;
    courseName?: string;
    originalTimeSlot?: string;
    preferredTimeSlot?: string;
    notTimeRequest?: string;  // 新增字段，用于存储非时间相关请求整合信息
    // 保留这些字段，但它们在前端处理后会被整合到notTimeRequest
    originalClassroom?: string;    
    preferredClassroom?: string;   
    facilityRequest?: string;      
    specialArrangement?: string;   
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    submissionTime: string;
    responseTime?: string;
    responseMessage?: string;
    adminId?: number;
    adminName?: string;
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

// 教室类型定义
interface Classroom {
    classroomId: string;
    classroomName: string;
    teachingBuilding: string;
}

const PersonalizedRequest = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [userCourses, setUserCourses] = useState<Course[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 表单状态
    const [formData, setFormData] = useState({
        title: '',
        requestType: '调整上课时间',
        courseId: '',
        courseName: '',
        originalTimeSlot: '',
        preferredTimeSlot: '',
        originalClassroom: '',
        preferredClassroom: '',
        facilityRequest: '',
        specialArrangement: '',
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

    // 可用的教学设施选项
    const facilityOptions = [
        '投影仪',
        '电脑',
        '音响系统',
        '实验设备',
        '网络设施',
        '多媒体设备',
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
                throw new Error(`获取申请记录失败: ${requestsResponse.status}`);
            }
            
            const requestsResult: ApiResponse<Request[]> = await requestsResponse.json();
            
            if (!requestsResult.success) {
                throw new Error(requestsResult.message || '获取申请记录失败');
            }
            
            // 格式化日期显示
            const formattedRequests = requestsResult.data.map(request => ({
                ...request,
                submissionTime: new Date(request.submissionTime).toLocaleString(),
                responseTime: request.responseTime ? new Date(request.responseTime).toLocaleString() : undefined,
                // 添加兼容前端显示的title字段
                title: request.requestType + (request.courseName ? ` - ${request.courseName}` : '')
            }));
            
            setRequests(formattedRequests);
            
            // 获取用户的课程数据
                 
            // 直接获取所有课程数据，无需根据用户身份区分
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
                        courseId: course.courseId,
                        courseName: course.courseName
                    }));
                    
                    
                    
                    console.log(`成功获取 ${courses.length} 个课程`);
                    setUserCourses(courses);
                } else {
                    console.error('获取课程数据成功但没有数据');
                    setUserCourses([]);
                }
            }

            // 获取教室数据，用于更换教室申请
            const classroomsResponse = await fetch('http://localhost:8080/api/classrooms', {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (classroomsResponse.ok) {
                const classroomsResult: ApiResponse<any[]> = await classroomsResponse.json();
                if (classroomsResult.success && classroomsResult.data) {
                    setClassrooms(classroomsResult.data.map(room => ({
                        classroomId: room.classroomId,
                        classroomName: room.classroomName,
                        teachingBuilding: room.teachingBuilding
                    })));
                }
            } else {
                console.error('获取教室数据失败');
                setClassrooms([]);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('加载数据失败:', error);
            setError(`加载数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
            setLoading(false);
        }
    };

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
    
        // 在编辑模式下不允许修改请求类型
        if (name === 'requestType' && isEditMode) {
            return; // 直接返回，不处理此更改
        }
        
        if (name === 'courseId') {
            const selectedCourse = userCourses.find(course => course.courseId === value);
            
            setFormData({
                ...formData,
                [name]: value,
                courseName: selectedCourse?.courseName || ''
            });
            
            // 获取该课程的排课时间和教室
            if (value) {
                fetchCourseDetails(value);
            }
        } else if (name === 'requestType') {
            // 更改申请类型时重置相关字段
            setFormData({
                ...formData,
                [name]: value,
                // 如果不是调整时间，则清空时间相关字段
                originalTimeSlot: value === '调整上课时间' ? formData.originalTimeSlot : '',
                preferredTimeSlot: value === '调整上课时间' ? formData.preferredTimeSlot : '',
                // 如果不是更换教室，则清空教室相关字段
                originalClassroom: value === '更换教室' ? formData.originalClassroom : '',
                preferredClassroom: value === '更换教室' ? formData.preferredClassroom : '',
                // 如果不是增加教学设施，则清空设施相关字段
                facilityRequest: value === '增加教学设施' ? formData.facilityRequest : '',
                // 如果不是特殊教学安排，则清空安排相关字段
                specialArrangement: value === '特殊教学安排' ? formData.specialArrangement : ''
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    
    // 获取课程详细信息（时间和教室）
    const fetchCourseDetails = async (courseId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/assignments/${courseId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.error(`获取课程详情失败: ${response.status}`);
                return;
            }
            
            const result: ApiResponse<any> = await response.json();
            
            if (result.success && result.data) {
                const assignment = result.data;
                
                // 解析时间槽，slot格式: 5:1-2 表示周五1到2节
                if (assignment.slot) {
                    const dayMap = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                    const [day, period] = assignment.slot.split(':');
                    const dayNum = parseInt(day);
                    
                    if (dayNum >= 1 && dayNum <= 7) {
                        const dayName = dayMap[dayNum];
                        const timeSlot = `${dayName}${period.replace('-', '到')}节`;
                        
                        setFormData(prevData => ({
                            ...prevData,
                            originalTimeSlot: timeSlot,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('获取课程详情失败:', error);
        }
    };

    // 准备添加新申请
    const handleAddRequest = () => {
        setFormData({
            title: '',
            requestType: '调整上课时间',
            courseId: '',
            courseName: '',
            originalTimeSlot: '',
            preferredTimeSlot: '',
            originalClassroom: '',
            preferredClassroom: '',
            facilityRequest: '',
            specialArrangement: '',
            reason: ''
        });
        setIsAddMode(true);
        setIsEditMode(false);
        setSelectedRequest(null);
        setError(null);
    };

    // 准备编辑申请
    const handleEditRequest = (request: Request) => {
         // 只能编辑待处理的申请
    if (request.status !== 'pending') {
        alert('只能修改待处理的申请');
        return;
    }

    // 解析非时间请求
    const parsedRequest = parseNotTimeRequest(request);

    setSelectedRequest(request);
    setFormData({
        title: request.title || '',
        requestType: request.requestType || '调整上课时间', // 保留原申请类型
        courseId: request.courseId || '',
        courseName: request.courseName || '',
        originalTimeSlot: request.originalTimeSlot || '',
        preferredTimeSlot: request.preferredTimeSlot || '',
        // 优先使用原始字段，如果没有则使用从notTimeRequest解析出的字段
        originalClassroom: request.originalClassroom || parsedRequest.originalClassroom || '',
        preferredClassroom: request.preferredClassroom || parsedRequest.preferredClassroom || '',
        facilityRequest: request.facilityRequest || parsedRequest.facilityRequest || '',
        specialArrangement: request.specialArrangement || parsedRequest.specialArrangement || '',
        reason: request.reason || ''
    });
    setIsEditMode(true);
    setIsAddMode(false);
    setError(null);
    };

    // 撤销申请
    const handleWithdrawRequest = async (request: Request) => {
        // 只能撤销待处理的申请
        if (request.status !== 'pending') {
            alert('只能撤销待处理的申请');
            return;
        }

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
            title: '',
            requestType: '调整上课时间',
            courseId: '',
            courseName: '',
            originalTimeSlot: '',
            preferredTimeSlot: '',
            originalClassroom: '',
            preferredClassroom: '',
            facilityRequest: '',
            specialArrangement: '',
            reason: ''
        });
        setError(null);
    };

    // 提交申请
    const handleSubmitRequest = async () => {
        if (!formData.reason) {
            setError('申请理由不能为空');
            return;
        }
    
        // 按申请类型进行字段验证
        if (formData.requestType === '调整上课时间' && !formData.preferredTimeSlot) {
            setError('请填写首选时间段');
            return;
        }
    
        if (formData.requestType === '更换教室' && !formData.preferredClassroom) {
            setError('请选择首选教室');
            return;
        }
    
        if (formData.requestType === '增加教学设施' && !formData.facilityRequest) {
            setError('请选择需要增加的教学设施');
            return;
        }
    
        if (formData.requestType === '特殊教学安排' && !formData.specialArrangement) {
            setError('请填写特殊教学安排');
            return;
        }
        
        try {
             // 如果是编辑模式，确保使用原来的申请类型
        const actualRequestType = (isEditMode && selectedRequest) 
        ? selectedRequest.requestType 
        : formData.requestType;
            // 根据申请类型，准备不同的额外字段
            let extraFields = {};
            let notTimeRequest = "";
            
            switch(formData.requestType) {
                case '调整上课时间':
                    extraFields = {
                        originalTimeSlot: formData.originalTimeSlot,
                        preferredTimeSlot: formData.preferredTimeSlot,
                        notTimeRequest: null // 时间相关请求，不使用notTimeRequest
                    };
                    break;
                case '更换教室':
                    notTimeRequest = `更换教室：原教室：${formData.originalClassroom || '未指定'};请求教室：${formData.preferredClassroom}`;
                    extraFields = {
                        originalTimeSlot: null,
                        preferredTimeSlot: null,
                        notTimeRequest: notTimeRequest,
                        originalClassroom: formData.originalClassroom,
                        preferredClassroom: formData.preferredClassroom
                    };
                    break;
                case '增加教学设施':
                    notTimeRequest = `增加教学设施：${formData.facilityRequest}`;
                    extraFields = {
                        originalTimeSlot: null,
                        preferredTimeSlot: null,
                        notTimeRequest: notTimeRequest,
                        facilityRequest: formData.facilityRequest
                    };
                    break;
                case '特殊教学安排':
                    notTimeRequest = `特殊教学安排：${formData.specialArrangement}`;
                    extraFields = {
                        originalTimeSlot: null,
                        preferredTimeSlot: null,
                        notTimeRequest: notTimeRequest,
                        specialArrangement: formData.specialArrangement
                    };
                    break;
                default: // '其他'
                    notTimeRequest = `其他请求：${formData.reason}`;
                    extraFields = {
                        originalTimeSlot: null,
                        preferredTimeSlot: null,
                        notTimeRequest: notTimeRequest
                    };
                    break;
            }
            
            let requestData = {
                userId: user.id,
                username: user.username,
                userIdentity: user.userIdentity,
                requestType: formData.requestType,
                courseId: formData.courseId || null,
                courseName: formData.courseName || null,
                reason: formData.reason,
                status: 'pending',
                ...extraFields
            };
            
            let url = 'http://localhost:8080/api/requests';
            let method = 'POST';
            let successMessage = '申请已成功提交！';
            
            
            if (isEditMode && selectedRequest) {
                // 简化请求数据，只包含必要的字段
            requestData = {
        id: selectedRequest.id,
        userId: user.id,
        username: user.username,
        requestType: formData.requestType,
        courseId: formData.courseId || null,
        courseName: formData.courseName || null,
        reason: formData.reason,
        status: 'pending'
    };
    
    // 根据请求类型，添加特定字段
    if (formData.requestType === '调整上课时间') {
        requestData.originalTimeSlot = formData.originalTimeSlot;
        requestData.preferredTimeSlot = formData.preferredTimeSlot;
    } else {
        requestData.notTimeRequest = notTimeRequest;
    }
    
    url = 'http://localhost:8080/api/requests/update';
    method = 'POST';
    successMessage = '申请修改成功！';
            }
            

            // 在handleSubmitRequest中添加
            console.log('发送修改请求:', JSON.stringify(requestData, null, 2));



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
            
            console.log('响应状态:', response.status, response.statusText);
        
        // 先获取响应文本，用于调试
        const responseText = await response.text();
        console.log('响应内容:', responseText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseText}`);
        }
        
        // 只有在响应成功时，才尝试解析JSON
        let result;
        try {
            // 因为我们已经消费了响应体，需要手动解析JSON
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('解析响应JSON失败:', e);
            throw new Error(`解析响应失败: ${responseText}`);
        }
        
        if (result.success) {
            // 成功提交后，重新获取最新的申请列表
            await fetchData(user);
            setIsAddMode(false);
            setIsEditMode(false);
            setSelectedRequest(null);
            setFormData({
                title: '',
                requestType: '调整上课时间',
                courseId: '',
                courseName: '',
                originalTimeSlot: '',
                preferredTimeSlot: '',
                originalClassroom: '',
                preferredClassroom: '',
                facilityRequest: '',
                specialArrangement: '',
                reason: ''
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

    // 在组件内添加一个解析非时间请求的辅助函数
    const parseNotTimeRequest = (request: Request): {
        originalClassroom?: string,
        preferredClassroom?: string,
        facilityRequest?: string,
        specialArrangement?: string
    } => {
        if (!request.notTimeRequest) return {};
        
        const result: any = {};
        
        // 解析更换教室请求
        if (request.requestType === '更换教室') {
            const match = request.notTimeRequest.match(/原教室：(.*?);请求教室：(.*?)($|;)/);
            if (match) {
                result.originalClassroom = match[1] === '未指定' ? '' : match[1];
                result.preferredClassroom = match[2];
            }
        }
        
        // 解析增加教学设施请求
        else if (request.requestType === '增加教学设施') {
            const match = request.notTimeRequest.match(/增加教学设施：(.*?)($|;)/);
            if (match) {
                result.facilityRequest = match[1];
            }
        }
        
        // 解析特殊教学安排请求
        else if (request.requestType === '特殊教学安排') {
            const match = request.notTimeRequest.match(/特殊教学安排：(.*?)($|;)/);
            if (match) {
                result.specialArrangement = match[1];
            }
        }
        
        return result;
    };

    // 渲染基于申请类型的动态表单字段
    const renderDynamicFormFields = () => {
        switch (formData.requestType) {
            case '调整上课时间':
                return (
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
                                首选时间段 <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="preferredTimeSlot"
                                name="preferredTimeSlot"
                                value={formData.preferredTimeSlot}
                                onChange={handleInputChange}
                                placeholder="例如：周二下午5-6节"
                                required
                            />
                        </div>
                    </div>
                );
            
            case '更换教室':
                return (
                    <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="originalClassroom">原教室</label>
                        <input
                            type="text"
                            id="originalClassroom"
                            name="originalClassroom"
                            value={formData.originalClassroom}
                            onChange={handleInputChange}
                            placeholder="例如：A-101"
                        />
                    </div>
        
                    <div className="form-group">
                        <label htmlFor="preferredClassroom">
                            首选教室 <span className="required">*</span>
                        </label>
                        <select
                            id="preferredClassroom"
                            name="preferredClassroom"
                            value={formData.preferredClassroom}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">请选择教室</option>
                            {classrooms.map(room => (
                                <option key={room.classroomId} value={room.classroomName}>
                                    {room.classroomName} ({room.teachingBuilding})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                );
            
            case '增加教学设施':
                return (
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="facilityRequest">
                                需要的教学设施 <span className="required">*</span>
                            </label>
                            <select
                                id="facilityRequest"
                                name="facilityRequest"
                                value={formData.facilityRequest}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">请选择需要的教学设施</option>
                                {facilityOptions.map((facility, index) => (
                                    <option key={index} value={facility}>{facility}</option>
                                ))}
                            </select>
                            {formData.facilityRequest === '其他' && (
                                <input
                                    type="text"
                                    className="other-input"
                                    placeholder="请输入具体设施要求"
                                    value={formData.facilityRequest === '其他' ? formData.reason : ''}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                />
                            )}
                        </div>
                    </div>
                );
            
            case '特殊教学安排':
                return (
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="specialArrangement">
                                特殊教学安排 <span className="required">*</span>
                            </label>
                            <textarea
                                id="specialArrangement"
                                name="specialArrangement"
                                value={formData.specialArrangement}
                                onChange={handleInputChange}
                                placeholder="请详细描述特殊教学安排..."
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                );
            
            default:
                return null; // 其他类型不需要额外字段
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

                                <div className="form-group">
                                    <label htmlFor="title">申请标题</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="例如：申请调整课程时间（可选填）"
                                    />
                                </div>

                                <div className="form-row">
                                <div className="form-group">
        <label htmlFor="requestType">申请类型 <span className="required">*</span></label>
        <select
            id="requestType"
            name="requestType"
            value={formData.requestType}
            onChange={handleInputChange}
            required
            disabled={isEditMode} // 在编辑模式下禁用
            className={isEditMode ? "disabled-select" : ""} // 添加自定义样式
        >
            {requestTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
            ))}
        </select>
        {isEditMode && (
            <div className="form-hint">申请类型不可修改</div>
        )}
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
                                                <option key={course.courseId} value={course.courseId}>
                                                    {course.courseId} - {course.courseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 动态渲染基于申请类型的表单字段 */}
                                {renderDynamicFormFields()}

                                <div className="form-group">
                                    <label htmlFor="reason">
                                        申请理由 <span className="required">*</span>
                                        {formData.requestType === '其他' && <span className="note">（请在此详细说明您的申请）</span>}
                                    </label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        placeholder={formData.requestType === '其他' ? 
                                            "请详细说明您的申请内容和理由..." : 
                                            "请详细说明您的申请理由..."}
                                        required
                                        rows={5}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        className="submit-button"
                                        onClick={handleSubmitRequest}
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
                                    {requests.map(request => {
                                        // 解析非时间请求
                                        const parsedRequest = parseNotTimeRequest(request);
                                        
                                        // 合并原始请求和解析后的字段
                                        const displayRequest = {
                                            ...request,
                                            originalClassroom: request.originalClassroom || parsedRequest.originalClassroom,
                                            preferredClassroom: request.preferredClassroom || parsedRequest.preferredClassroom,
                                            facilityRequest: request.facilityRequest || parsedRequest.facilityRequest,
                                            specialArrangement: request.specialArrangement || parsedRequest.specialArrangement
                                        };
                                        
                                        return (
                                            <div key={displayRequest.id} className="request-card">
                                                <div className="request-header">
                                                    <h3>{displayRequest.title || `${displayRequest.requestType}申请`}</h3>
                                                    <div className={`request-status ${getStatusClass(displayRequest.status)}`}>
                                                        {getStatusName(displayRequest.status)}
                                                    </div>
                                                </div>

                                                <div className="request-info">
                                                    <div className="info-row">
                                                        <span className="info-label">申请类型:</span>
                                                        <span className="info-value">{displayRequest.requestType}</span>
                                                    </div>

                                                    {displayRequest.courseName && (
                                                        <div className="info-row">
                                                            <span className="info-label">相关课程:</span>
                                                            <span className="info-value">{displayRequest.courseName}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.originalTimeSlot && (
                                                        <div className="info-row">
                                                            <span className="info-label">原时间段:</span>
                                                            <span className="info-value">{displayRequest.originalTimeSlot}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.preferredTimeSlot && (
                                                        <div className="info-row">
                                                            <span className="info-label">首选时间段:</span>
                                                            <span className="info-value">{displayRequest.preferredTimeSlot}</span>
                                                        </div>
                                                    )}

                                                    {/* 动态显示非时间相关请求信息 */}
                                                    {displayRequest.notTimeRequest && displayRequest.requestType !== '调整上课时间' && (
                                                        <div className="info-row">
                                                            <span className="info-label">请求详情:</span>
                                                            <span className="info-value">{displayRequest.notTimeRequest}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.originalClassroom && (
                                                        <div className="info-row">
                                                            <span className="info-label">原教室:</span>
                                                            <span className="info-value">{displayRequest.originalClassroom}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.preferredClassroom && (
                                                        <div className="info-row">
                                                            <span className="info-label">首选教室:</span>
                                                            <span className="info-value">{displayRequest.preferredClassroom}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.facilityRequest && (
                                                        <div className="info-row">
                                                            <span className="info-label">需要设施:</span>
                                                            <span className="info-value">{displayRequest.facilityRequest}</span>
                                                        </div>
                                                    )}

                                                    {displayRequest.specialArrangement && (
                                                        <div className="info-row">
                                                            <span className="info-label">特殊安排:</span>
                                                            <span className="info-value">{displayRequest.specialArrangement}</span>
                                                        </div>
                                                    )}

                                                    <div className="info-row">
                                                        <span className="info-label">申请理由:</span>
                                                        <span className="info-value reason">{displayRequest.reason}</span>
                                                    </div>

                                                    <div className="info-row">
                                                        <span className="info-label">提交时间:</span>
                                                        <span className="info-value">{displayRequest.submissionTime}</span>
                                                    </div>
                                                </div>

                                                {/* 待处理的申请显示操作按钮 */}
                                                {displayRequest.status === 'pending' && (
                                                    <div className="request-actions">
                                                        <button
                                                            className="edit-button"
                                                            onClick={() => handleEditRequest(displayRequest)}
                                                            disabled={isAddMode || isEditMode}
                                                        >
                                                            修改
                                                        </button>
                                                        <button
                                                            className="withdraw-button"
                                                            onClick={() => handleWithdrawRequest(displayRequest)}
                                                            disabled={isAddMode || isEditMode}
                                                        >
                                                            撤销
                                                        </button>
                                                    </div>
                                                )}

                                                {/* 已处理的申请显示回复 */}
                                                {(displayRequest.status === 'approved' || displayRequest.status === 'rejected') && (
                                                    <div className="response-section">
                                                        <h4>教务处回复</h4>
                                                        <div className="response-content">
                                                            <p className="response-message">{displayRequest.responseMessage}</p>
                                                            <div className="response-info">
                                                                <span>处理人: {displayRequest.adminName || '系统管理员'}</span>
                                                                <span>回复时间: {displayRequest.responseTime || '未知'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
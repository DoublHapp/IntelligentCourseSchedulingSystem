//个性化申请传输对象：

package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userIdentity; // 学生/教师
    private String requestType; // 调整上课时间、更换教室等
    private String courseId;
    private String courseName;
    private String originalTimeSlot; // 原时间段
    private String preferredTimeSlot; // 期望时间段
    private String reason; // 申请原因
    private String status; // pending, approved, rejected
    private LocalDateTime submissionTime;
    private LocalDateTime responseTime;
    private String responseMessage;
    private Long adminId;
    private String adminName;
}
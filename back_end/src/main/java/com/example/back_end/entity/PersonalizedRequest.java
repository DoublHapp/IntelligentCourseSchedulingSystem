package com.example.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "personalized_requests")
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "user_identity")
    private String userIdentity; // 学生/教师
    
    @Column(name = "request_type")
    private String requestType; // 调整上课时间、更换教室等
    
    @Column(name = "course_id")
    private String courseId;
    
    @Column(name = "course_name")
    private String courseName;
    
    @Column(name = "original_time_slot")
    private String originalTimeSlot; // 原时间段
    
    @Column(name = "preferred_time_slot")
    private String preferredTimeSlot; // 期望时间段
    
    @Column(name = "reason", length = 500)
    private String reason; // 申请原因
    
    @Column(name = "status")
    private String status; // pending, approved, rejected
    
    @Column(name = "submission_time")
    private LocalDateTime submissionTime;
    
    @Column(name = "response_time")
    private LocalDateTime responseTime;
    
    @Column(name = "response_message", length = 500)
    private String responseMessage;
    
    @Column(name = "admin_id")
    private Long adminId;
    
    @Column(name = "admin_name")
    private String adminName;
}
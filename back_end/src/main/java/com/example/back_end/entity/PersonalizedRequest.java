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
    
    @Column(name = "task_id")
    private String taskId; // 课程ID

    @Column(name = "prefer_day")
    private String preferDay; // 偏好上课的日期：周一、周二、周三、周四、周五

    @Column(name = "prefer_period")
    private String preferPeriod; // 偏好上课的时段：上午/下午
}
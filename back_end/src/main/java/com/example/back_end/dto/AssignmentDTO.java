package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDTO {
    private String courseId;        // 课程ID，主键
    private String courseName;      // 课程名称
    private String classRoomId;     // 教室ID
    private String classRoomName;   // 教室名称
    private String slot;            // 时间段，格式: "5:1-2" 表示周五1-2节
}
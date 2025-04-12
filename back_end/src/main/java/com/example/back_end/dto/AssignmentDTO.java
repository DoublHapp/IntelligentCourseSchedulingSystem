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
    private String courseId; // 课程ID，主键
    private String courseName; // 课程名称
    private String classRoomId; // 教室ID
    private String classRoomName; // 教室名称
    private String slot; // 时间段，格式: "5:1-2" 表示周五1-2节
    private String weeks; // 周数，格式: "1,2,3,4,5,6,7,8,9,10,11,12"
    private String teachingClassId; // 教学班ID，主键
}
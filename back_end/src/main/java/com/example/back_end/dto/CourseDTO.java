package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String courseId;                  // 对应 Course.courseId
    private String courseName;                // 对应 Course.courseName
    private String courseEnglishName;         // 对应 Course.courseEnglishName
    private String courseCategory;            // 对应 Course.courseCategory
    private String courseAttribute;           // 对应 Course.courseAttribute
    private String courseType;                // 对应 Course.courseType
    private String courseNature;              // 对应 Course.courseNature
    private String courseOfferingDepartmentId;        // 需要从 courseOfferingDepartment 映射
    private String courseOfferingDepartment;      // 对应 Course.courseOfferingDepartment
    private String isEnabled;           // 直接对应
    private Integer totalHours;         // 直接对应
    private Integer theoreticalHours;   // 直接对应
    private Integer experimentalHours;  // 直接对应
    private Integer practicalHours;     // 直接对应
    private Integer labHours;           // 直接对应
    private Float credits;              // 直接对应
    private Integer weeklyHours;        // 直接对应
    private String isPurePracticalSession; // 直接对应
    private String description;         // 用于前端显示课程描述
    private List<String> prerequisites; // 先修课程代码列表
}
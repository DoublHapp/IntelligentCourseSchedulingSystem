package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDTO {
    private String id;               // 映射自 Class.classId
    private String name;             // 映射自 Class.className
    private String schoolSystem;     // 直接对应
    private String educationLevel;   // 直接对应
    private String type;             // 映射自 Class.classType
    private String counselor;        // 直接对应
    private String headTeacher;      // 直接对应
    private String classMonitor;     // 直接对应
    private String classAssistant;   // 直接对应
    private String expectedGraduationYear; // 直接对应
    private String graduated;        // 直接对应
    private Integer classSize;       // 直接对应
    private Integer maximumClassSize; // 直接对应
    private String admissionYear;    // 直接对应
    private String facultyDepartment; // 直接对应
    private String majorId;          // 直接对应
    private String major;            // 直接对应
    private String majorDirection;   // 直接对应
    private String campus;           // 直接对应
    private String assignedClassroomId; // 直接对应
    private String assignedClassroom; // 直接对应
}
package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private String id; // 用于前端显示，实际对应courseId
    private String academicYearTerm;
    private String courseId;
    private String courseName;
    private String teacherEmployeeId;
    private String instructorName;
    private String teachingClassComposition;
    private String teachingClassId;
    private Double courseCredits;
    private String teachingClassName;
    private String hourType;
    private Integer scheduledHours;
    private Integer arrangedHours;
    private Integer totalHours;
    private Integer teachingClassSize;
    private Integer schedulePriority;
    private String courseNature;
    private String campusOfCourseOffering;
    private String isExternalHire;
    private String courseOfferingDepartment;
    private String courseWeeklyHours;
    private Integer consecutiveClassSlots;
    private String designatedClassroomType;
    private String designatedClassroom;
    private String designatedTeachingBuilding;
    private String designatedTime;
    private String status; // 表示任务的排课状态：未排课、已排课、已完成等
}
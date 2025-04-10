package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomDTO {
    private String classroomId;                  // 对应 Classroom.classroomId
    private String classroomName;                // 对应 Classroom.classroomName
    private String campus;              // 直接对应
    private String teachingBuilding;    // 直接对应
    private String floor;               // 直接对应
    private String classroomLabel;      // 直接对应
    private String classroomType;       // 直接对应
    private String examSeatingCapacity; // 直接对应
    private Integer maximumClassSeatingCapacity; // 直接对应
    private String isHasAirConditioning;  // 对应 Classroom.isHasAirConditioning
    private String isEnabled;           // 直接对应
    private String classroomDescription; // 直接对应
    private String managementDepartment; // 直接对应
    private String weeklyScheduleHours;  // 直接对应
    private String classroomArea;        // 直接对应
    private String deskChairType;        // 直接对应
}
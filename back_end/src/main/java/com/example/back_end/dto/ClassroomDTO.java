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
    private String id;
    private String campus;
    private String teachingBuilding;
    private String floor;
    private String classroomLabel;
    private String classroomType;
    private String examSeatingCapacity;
    private Integer maximumClassSeatingCapacity;
    private String hasAirConditioning;
    private String isEnabled;
    private String classroomDescription;
    private String managementDepartment;
    private String weeklyScheduleHours;
    private String classroomArea;
    private String deskChairType;
}
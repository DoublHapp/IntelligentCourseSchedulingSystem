package com.example.back_end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "classrooms")
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {
    
    @Id
    @Column(name = "classroom_id")
    private String classroomId;
    
    @Column(name = "classroom_name")
    private String classroomName;

    private String campus;
    
    @Column(name = "teaching_building")
    private String teachingBuilding;
    
    private String floor;
    
    @Column(name = "classroom_label")
    private String classroomLabel;
    
    @Column(name = "classroom_type")
    private String classroomType;
    
    @Column(name = "exam_seating_capacity")
    private String examSeatingCapacity;
    
    @Column(name = "maximum_class_seating_capacity")
    private Integer maximumClassSeatingCapacity;
    
    @Column(name = "is_has_air_conditioning")
    private String isHasAirConditioning;
    
    @Column(name = "is_enabled")
    private String isEnabled;
    
    @Column(name = "classroom_description")
    private String classroomDescription;
    
    @Column(name = "management_department")
    private String managementDepartment;
    
    @Column(name = "weekly_schedule_hours")
    private String weeklyScheduleHours;
    
    @Column(name = "classroom_area")
    private String classroomArea;
    
    @Column(name = "desk_chair_type")
    private String deskChairType;
}
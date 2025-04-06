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
@Table(name = "tasks")
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    
    @Column(name = "academic_year_term")
    private String academicYearTerm;
    
    @Id
    @Column(name = "course_id")
    private String courseId;
    
    @Column(name = "course_name")
    private String courseName;
    
    @Column(name = "teacher_employee_id")
    private String teacherEmployeeId;
    
    @Column(name = "instructor_name")
    private String instructorName;
    
    @Column(name = "teaching_class_composition")
    private String teachingClassComposition;
    
    
    @Column(name = "teaching_class_id")
    private String teachingClassId;

    @Column(name = "course_credits")
    private Double courseCredits;

    @Column(name = "teaching_class_name")
    private String teachingClassName;

    @Column(name = "hour_type")
    private String hourType;

    @Column(name = "scheduled_hours")
    private Integer scheduledHours;

    @Column(name = "arranged_hours")
    private Integer arrangedHours;

    @Column(name = "total_hours")
    private Integer totalHours;

    @Column(name = "teaching_class_size")
    private Integer teachingClassSize;



    @Column(name = "schedule_priority")
    private Integer schedulePriority;   
    
    @Column(name = "course_nature")
    private String courseNature;

    @Column(name = "campus_of_course_offering")
    private String campusOfCourseOffering;

    @Column(name = "is_external_hire")
    private String isExternalHire;//enmu

    @Column(name = "course_offering_department")
    private String courseOfferingDepartment;

    @Column(name = "course_weekly_hours")
    private String courseWeeklyHours;

    @Column(name = "consecutive_class_slots")
    private Integer consecutiveClassSlots;

    @Column(name = "designated_classroom_type")
    private String designatedClassroomType;

    @Column(name = "designated_classroom")
    private String designatedClassroom;

    @Column(name = "designated_teaching_building")
    private String designatedTeachingBuilding;

    @Column(name = "designated_time")
    private String designatedTime;

}
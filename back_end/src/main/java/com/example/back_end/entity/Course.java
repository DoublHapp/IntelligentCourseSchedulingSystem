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
@Table(name = "courses")
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    
    @Id
    @Column(name = "course_id")
    private String courseId;
    
    @Column(name = "course_name")
    private String courseName;
    
    @Column(name = "course_category")
    private String courseCategory;
    
    @Column(name = "course_attribute")
    private String courseAttribute;
    
    @Column(name = "course_type")
    private String courseType;
    
    @Column(name = "course_nature")
    private String courseNature;
    
    @Column(name = "course_english_name")
    private String courseEnglishName;
    
    @Column(name = "course_offering_department")
    private String courseOfferingDepartment;
    
    @Column(name = "is_enabled")
    private String isEnabled;
    
    @Column(name = "total_hours")
    private Integer totalHours;
    
    @Column(name = "theoretical_hours")
    private Integer theoreticalHours;
    
    @Column(name = "experimental_hours")
    private Integer experimentalHours;
    
    @Column(name = "lab_hours")
    private Integer labHours;
    
    @Column(name = "practical_hours")
    private Integer practicalHours;
    
    @Column(name = "other_hours")
    private Integer otherHours;
    
    @Column(name = "credits")
    private Float credits;
    
    @Column(name = "weekly_hours")
    private Integer weeklyHours;
    
    @Column(name = "is_pure_practical_session")
    private String isPurePracticalSession;
}
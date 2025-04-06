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
@Table(name = "classes")
@NoArgsConstructor
@AllArgsConstructor
public class Class {
    
    @Id
    @Column(name = "class_id")
    private String classId;
    
    @Column(name = "class_name")
    private String className;
    
    @Column(name = "school_system")
    private String schoolSystem;
    
    @Column(name = "education_level")
    private String educationLevel;
    
    @Column(name = "class_type")
    private String classType;
    
    private String counselor;
    
    @Column(name = "head_teacher")
    private String headTeacher;
    
    @Column(name = "class_monitor")
    private String classMonitor;
    
    @Column(name = "class_assistant")
    private String classAssistant;
    
    @Column(name = "expected_graduation_year")
    private String expectedGraduationYear;
    
    private String graduated;
    
    @Column(name = "class_size")
    private Integer classSize;
    
    @Column(name = "maximum_class_size")
    private Integer maximumClassSize;
    
    @Column(name = "admission_year")
    private String admissionYear;
    
    @Column(name = "faculty_department")
    private String facultyDepartment;
    
    @Column(name = "major_id")
    private String majorId;
    
    private String major;
    
    @Column(name = "major_direction")
    private String majorDirection;
    
    private String campus;
    
    @Column(name = "assigned_classroom_id")
    private String assignedClassroomId;
    
    @Column(name = "assigned_classroom")
    private String assignedClassroom;
    
    private String remarks;
    
    @Column(name = "head_teacher_contact_number")
    private String headTeacherContactNumber;
    
    @Column(name = "head_teacher_employee_id")
    private String headTeacherEmployeeId;
    
    @Column(name = "graduation_academic_year_semester")
    private String graduationAcademicYearSemester;
    
    @Column(name = "enrollment_expansion")
    private String enrollmentExpansion;
    
    @Column(name = "academic_advisor")
    private String academicAdvisor;
}
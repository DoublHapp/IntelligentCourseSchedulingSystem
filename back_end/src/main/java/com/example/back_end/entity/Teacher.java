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
@Table(name = "teachers")
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {
    
    @Id
    @Column(name = "employee_id")
    private String id;
    
    @Column(name = "employee_name")
    private String name;
    
    private String gender;
    
    @Column(name = "english_name")
    private String englishName;
    
    private String ethnicity;
    
    @Column(name = "job_title")
    private String jobTitle;
    
    private String department;
    
    @Column(name = "is_external_hire")
    private String isExternalHire;
    
    @Column(name = "staff_category")
    private String staffCategory;
}
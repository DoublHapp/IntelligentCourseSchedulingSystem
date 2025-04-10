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
@Table(name = "departments")
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    
    @Id
    @Column(name = "department_code")// 主键是 department_code
    private Long departmentCode;
    
    @Column(name = "department_name")
    private String departmentName;
    
    @Column(name = "department_english_name")
    private String departmentEnglishName;
    
    @Column(name = "department_abbreviation")
    private String departmentAbbreviation;

    @Column(name = "department_address")
    private String departmentAddress;
    
    @Column(name = "is_physical_entity")
    private String isPhysicalEntity;
    
    @Column(name = "administrative_head")
    private String administrativeHead;
    
    @Column(name = "party_committee_head")
    private String partyCommitteeHead;
    
    @Column(name = "establishment_date")
    private String establishmentDate;
    
    @Column(name = "expiration_date")
    private String expirationDate;
    
    @Column(name = "affiliated_unit_category")
    private String affiliatedUnitCategory;
    
    @Column(name = "affiliated_unit_type")
    private String affiliatedUnitType;
    
    @Column(name = "parent_department")
    private String parentDepartment;//父部门名称
    
    @Column(name = "designated_teaching_building")
    private String designatedTeachingBuilding;
    
    @Column(name = "is_course_offering_department")
    private String isCourseOfferingDepartment;
    
    @Column(name = "is_course_attending_department")
    private String isCourseAttendingDepartment;
    
    @Column(name = "fixed_phone")
    private String fixedPhone;
    
    private String remarks;
    
    @Column(name = "is_enabled")
    private String isEnabled;
    
    @Column(name = "is_course_research_office")
    private String isCourseResearchOffice;
}
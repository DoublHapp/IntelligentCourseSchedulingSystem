package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    private Long departmentCode;                       // 对应 Department.departmentCode
    private String departmentName;                   // 对应 Department.departmentName
    private String departmentEnglishName;            // 对应 Department.departmentEnglishName
    private String departmentAbbreviation;                   // 对应 Department.departmentAbbreviation
    private String departmentAddress;                // 对应 Department.departmentAddress
    private String isPhysicalEntity;       // 直接对应
    private String administrativeHead;     // 直接对应
    private String partyCommitteeHead;     // 直接对应
    private String establishmentDate;      // 直接对应
    private String expirationDate;         // 直接对应
    private String affiliatedUnitCategory; // 直接对应
    private String affiliatedUnitType;     // 直接对应
    private String parentDepartment;               // 对应 Department.parentDepartment
    private String parentDepartmentName;             // 用于前端显示父部门名称
    private String designatedTeachingBuilding;  // 直接对应
    private String isCourseOfferingDepartment;  // 直接对应
    private String isCourseAttendingDepartment; // 直接对应
    private String fixedPhone;             // 直接对应
    private String remarks;            // 对应 Department.remarks
    private String isEnabled;              // 直接对应
    private String isCourseResearchOffice; // 直接对应
}
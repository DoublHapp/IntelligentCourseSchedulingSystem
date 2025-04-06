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
    private Long id;
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String parentName;
    private Integer level;
    private String isEnabled;
    private String isCourseOfferingDepartment;
    private String designatedTeachingBuilding;
}
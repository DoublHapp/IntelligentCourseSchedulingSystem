package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String id;
    private String code;
    private String name;
    private String englishName;
    private String category;
    private String attribute;
    private String type;
    private String nature;
    private Long departmentId;
    private String departmentName;
    private String isEnabled;
    private Integer totalHours;
    private Integer theoreticalHours;
    private Integer experimentalHours;
    private Integer practicalHours;
    private Float credits;
    private Integer weeklyHours;
    private String description;
    private List<String> prerequisites; // 先修课程代码列表
}
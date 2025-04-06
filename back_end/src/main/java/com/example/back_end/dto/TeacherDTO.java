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
public class TeacherDTO {
    private String id;
    private String name;
    private String gender;
    private String englishName;
    private String ethnicity;
    private String jobTitle;
    private String department;
    private Long departmentId;
    private String isExternalHire;
    private String staffCategory;
    private String email;
    private String phone;
    private List<String> specialization;
    private Integer maxWeeklyHours;
}
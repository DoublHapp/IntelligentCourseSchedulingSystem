package com.example.back_end.util;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalysisResult {
    private double conflictRate;
    private double averageClassroomUtilization;
    private Map<String, int[]> weeklyScheduleDistribution;
    private Map<String, Double> buildingUtilization;
    private Map<String, Integer> courseTypeDistribution;
    private Long totalTeachers;
    private Long totalCourses;
}

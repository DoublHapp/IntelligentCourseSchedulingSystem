//排课结果分析传输对象

package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleAnalysisDTO {
    // 基本统计数据
    private Integer totalTasks;
    private Integer scheduledTasks;
    private Integer unscheduledTasks;
    private Double classroomUtilizationRate;
    private Double teacherSatisfactionRate;
    
    // 教师工作量数据
    private List<String> teacherNames;
    private List<Integer> teacherWorkloads;
    
    // 教室使用分布
    private Map<String, Integer> classroomUsageCounts;
    
    // 课程时间分布
    private Map<Integer, Integer> coursesByDay; // 按星期几分布
    private Map<Integer, Integer> coursesByPeriod; // 按节次分布
    
    // 部门统计数据
    private Map<String, Map<String, Double>> departmentMetrics;
    
    // 优化建议
    private List<OptimizationSuggestionDTO> optimizationSuggestions;
}
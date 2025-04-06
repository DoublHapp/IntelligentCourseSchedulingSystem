//优化建议传输对象

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
public class OptimizationSuggestionDTO {
    private String category; // 教师优化、教室优化、课程优化等
    private String title;
    private String description;
    private String impact; // high, medium, low
    private String difficulty; // high, medium, low
    private List<String> affectedResources; // 受影响的资源ID列表
}
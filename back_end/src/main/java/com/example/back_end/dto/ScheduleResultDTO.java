//排课结果传输对象


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
public class ScheduleResultDTO {
    private String id;
    private String taskId;
    private String courseName;
    private String teacherName;
    private String teacherId;
    private String classroom;
    private String classroomId;
    private Integer week;
    private Integer day;
    private Integer period;
    private List<String> classNames;
    private String hourType;
}
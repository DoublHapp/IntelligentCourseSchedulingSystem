package com.example.back_end.util;

import com.example.back_end.util.Assignment;
import com.example.back_end.util.Classroom;
import com.example.back_end.util.Task;
import com.example.back_end.repository.AssignmentRepository;
import com.example.back_end.repository.ClassroomRepository;
import com.example.back_end.repository.TaskRepository;
import com.example.back_end.util.Schedule;
import com.example.back_end.util.ScheduleAnalyzer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ScheduleAnalyzerTest {

    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private ClassroomRepository classroomRepository;
    @Autowired
    private TaskRepository taskRepository;

    public void analyzeSchedule() {
        // 从数据库中获取所有 Assignment 数据
        final List<Classroom> classrooms = classroomRepository.findAll().stream()
                .map(classroom -> new Classroom(classroom))
                .collect(Collectors.toList());
        final List<Task> tasks = taskRepository.findAll().stream()
                .map(task -> new Task(task))
                .collect(Collectors.toList());
        List<Assignment> assignments = assignmentRepository.findAll().stream().map(assignment -> {
            Classroom classroom = classrooms.stream()
                    .filter(c -> c.getClassroomId().equals(assignment.getClassRoomId()))
                    .findFirst().orElse(null);
            List<Integer> timeSlots = new ArrayList<>();
            if (assignment.getSlot() != null) {
                String[] parts = assignment.getSlot().split(",");
                for (String part : parts) {
                    String[] subParts = part.split(":");
                    String[] timeParts = subParts[1].split("-");
                    int day = Integer.parseInt(subParts[0])-1;
                    int start = Integer.parseInt(timeParts[0])-1;
                    int timeSlot = day * Schedule.slotsOfDay + start;
                    timeSlots.add(timeSlot);
                }
            }
            Task task = tasks.stream()
                    .filter(t -> t.getTeachingClassId().equals(assignment.getTeachingClassId()))
                    .findFirst().orElse(null);
            return new Assignment(classroom, timeSlots, task);
        }).collect(Collectors.toList());

        // 创建 Schedule 对象
        Schedule schedule = new Schedule(assignments);

        // 创建 ScheduleAnalyzer 对象
        ScheduleAnalyzer scheduleAnalyzer = new ScheduleAnalyzer(schedule);

        // 调用方法并输出结果
        System.out.println("1. 排课冲突率:");
        double conflictRate = scheduleAnalyzer.calculateConflictRate();
        System.out.println("   冲突率: " + conflictRate);

        System.out.println("\n2. 教室平均使用率:");
        double averageUtilization = scheduleAnalyzer.calculateAverageClassroomUtilization();
        System.out.println("   平均使用率: " + averageUtilization);

        System.out.println("\n3. 周排课分布情况:");
        Map<String, int[]> weeklyDistribution = scheduleAnalyzer.analyzeWeeklyScheduleDistribution();
        for (Map.Entry<String, int[]> entry : weeklyDistribution.entrySet()) {
            System.out.println(
                    "   " + entry.getKey() + ": 上午课程数 = " + entry.getValue()[0] + ", 下午课程数 = " + entry.getValue()[1]);
        }

        System.out.println("\n4. 教学楼使用率:");
        Map<String, Double> buildingUtilization = scheduleAnalyzer.calculateBuildingUtilization();
        for (Map.Entry<String, Double> entry : buildingUtilization.entrySet()) {
            System.out.println(
                    "   教学楼 " + entry.getKey() + ": 使用率 = " + String.format("%.2f", entry.getValue() * 100) + "%");
        }

        System.out.println("\n5. 课程类型分布:");
        Map<String, Integer> courseTypeDistribution = scheduleAnalyzer.analyzeCourseTypeDistribution();
        for (Map.Entry<String, Integer> entry : courseTypeDistribution.entrySet()) {
            System.out.println("   " + entry.getKey() + ": " + entry.getValue() + " 门课程");
        }
    }
}
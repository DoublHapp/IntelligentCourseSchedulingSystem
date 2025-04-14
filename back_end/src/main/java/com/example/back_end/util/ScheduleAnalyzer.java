package com.example.back_end.util;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.back_end.entity.Teacher;
import com.example.back_end.repository.AssignmentRepository;
import com.example.back_end.repository.ClassroomRepository;
import com.example.back_end.repository.CourseRepository;
import com.example.back_end.repository.TaskRepository;
import com.example.back_end.repository.TeacherRepository;

import lombok.Data;

@Component
@Data
public class ScheduleAnalyzer {

    private Schedule schedule;
    private AssignmentRepository assignmentRepository;
    private ClassroomRepository classroomRepository;
    private TaskRepository taskRepository;
    private TeacherRepository teacherRepository;
    private CourseRepository courseRepository;

    @Autowired
    public void setAssignmentRepository(AssignmentRepository assignmentRepository,
            ClassroomRepository classroomRepository,
            TaskRepository taskRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.classroomRepository = classroomRepository;
        this.taskRepository = taskRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
    }

    // TODO:冲突分析
    // public void analyzeConflicts() {
    // List<Assignment> assignments = schedule.getAssignments();
    // Map<Integer, List<Assignment>> timeSlotMap = new HashMap<>();

    // //添加每一个任务到时间槽映射中
    // for (Assignment assignment : assignments) {
    // for (int timeSlot : assignment.getTimeSlots()) {
    // timeSlotMap.computeIfAbsent(timeSlot, k -> new
    // ArrayList<>()).add(assignment);
    // }
    // }

    // int timeConflicts = 0;
    // System.out.println("冲突分析:");
    // for (Map.Entry<Integer, List<Assignment>> entry : timeSlotMap.entrySet()) {
    // // 按时间槽遍历任务列表
    // Map<String, List<Assignment>> classroomMap = new HashMap<>();
    // for (Assignment assignment : entry.getValue()) {
    // String classroomId = assignment.getClassroom().getClassroomId();
    // classroomMap.computeIfAbsent(classroomId, k -> new
    // ArrayList<>()).add(assignment);
    // }

    // // 检查同一时间槽内是否有多个任务使用同一个教室
    // for (Map.Entry<String, List<Assignment>> classroomEntry :
    // classroomMap.entrySet()) {
    // if (classroomEntry.getValue().size() > 1) {
    // timeConflicts++;
    // System.out.println(" 时间冲突: 时间槽 " + entry.getKey() + " 教室 " +
    // classroomEntry.getKey() + " 被以下任务占用:");
    // for (Assignment assignment : classroomEntry.getValue()) {
    // System.out.println(" - " + assignment.getTask().getCourseName());
    // }
    // }
    // }
    // }
    // System.out.println(" 总时间冲突数: " + timeConflicts);

    // // 检测未被排入的课程
    // System.out.println("未排入课程分析:");
    // for (Assignment assignment : assignments) {
    // if (assignment.getTimeSlots() == null || assignment.getTimeSlots().isEmpty())
    // {
    // //TUDO:task修改 获取未排课的课程的指定教室
    // String classroomId = assignment.getTask().getClassroomId();

    // System.out.println(" 未排入课程: " + assignment.getTask().getCourseName() + "
    // (指定教室: " + classroomId + ")");
    // System.out.println(" 原因: 以下课程占用了教室 " + classroomId + ":");

    // for (Map.Entry<Integer, List<Assignment>> entry : timeSlotMap.entrySet()) {
    // for (Assignment occupyingAssignment : entry.getValue()) {
    // if (occupyingAssignment.getClassroom().getClassroomId().equals(classroomId))
    // {
    // System.out.println(" - 时间槽 " + entry.getKey() + ": " +
    // occupyingAssignment.getTask().getCourseName());
    // }
    // }
    // }
    // }
    // }
    // }

    // 调用所有分析方法
    public AnalysisResult analyzeSchedule() {
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
                    int day = Integer.parseInt(subParts[0]) - 1;
                    int start = Integer.parseInt(timeParts[0]) - 1;
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
        this.schedule = schedule;

        // 创建 ScheduleAnalyzer 对象
        double conflictRate = calculateConflictRate();
        double averageUtilization = calculateAverageClassroomUtilization();
        Map<String, int[]> weeklyDistribution = analyzeWeeklyScheduleDistribution();
        Map<String, Double> buildingUtilization = calculateBuildingUtilization();
        Map<String, Integer> courseTypeDistribution = analyzeCourseTypeDistribution();
        Long totalTeachers = teacherRepository.count();
        Long totalCourses = courseRepository.count();
        AnalysisResult analysisResult = new AnalysisResult(conflictRate, averageUtilization,
                weeklyDistribution, buildingUtilization, courseTypeDistribution,totalTeachers,totalCourses);

        return analysisResult;
    }

    // 排课冲突率
    public double calculateConflictRate() {
        List<Assignment> assignments = schedule.getAssignments();
        long unassignedCount = assignments.stream()
                .filter(assignment -> assignment.getTimeSlots() == null || assignment.getTimeSlots().isEmpty())
                .count();

        if (assignments.isEmpty()) {
            return 0.0; // 如果没有任务，冲突率为 0
        }

        double conflictRate = (double) unassignedCount / assignments.size();
        System.out.println("排课冲突率: " + (conflictRate * 100) + "%");
        return conflictRate;
    }

    // 教室使用率分析
    public double calculateAverageClassroomUtilization() {
        Map<String, Integer> classroomUsage = new HashMap<>();
        int totalSlotsPerWeek = Schedule.slotsOfWeek; // 一周总时间槽数

        // 统计每个教室被占用的时间槽数
        for (Assignment assignment : schedule.getAssignments()) {
            if (assignment.getClassroom() == null || assignment.getTimeSlots() == null) {
                continue; // 跳过未分配教室或时间槽的任务
            }
            String classroomId = assignment.getClassroom().getClassroomId();
            int usedSlots = assignment.getTimeSlots().size();
            classroomUsage.put(classroomId, classroomUsage.getOrDefault(classroomId, 0) + usedSlots);
        }

        // 计算所有教室的使用率
        double totalUtilizationRate = 0.0;
        int classroomCount = classroomUsage.size();

        for (Map.Entry<String, Integer> entry : classroomUsage.entrySet()) {
            int usedSlots = entry.getValue();
            double utilizationRate = (double) usedSlots / totalSlotsPerWeek;
            totalUtilizationRate += utilizationRate;
        }

        // 计算平均使用率
        double averageUtilizationRate = classroomCount > 0 ? totalUtilizationRate / classroomCount : 0.0;
        System.out.println("总教室平均使用率: " + String.format("%.2f", averageUtilizationRate * 100) + "%");
        return averageUtilizationRate;
    }

    // 周排课分布情况分析
    // 统计每周的上午和下午课程数
    public Map<String, int[]> analyzeWeeklyScheduleDistribution() {
        // 定义上午和下午的时间槽范围
        int morningSlotsStart = 0; // 上午时间槽起始索引
        int morningSlotsEnd = 3; // 上午时间槽结束索引（包含）
        int afternoonSlotsStart = 4; // 下午时间槽起始索引
        int afternoonSlotsEnd = 7; // 下午时间槽结束索引（包含）

        // 定义每天的课程统计
        Map<String, int[]> dailyDistribution = new LinkedHashMap<>();
        dailyDistribution.put("周一", new int[2]); // [上午课程数, 下午课程数]
        dailyDistribution.put("周二", new int[2]);
        dailyDistribution.put("周三", new int[2]);
        dailyDistribution.put("周四", new int[2]);
        dailyDistribution.put("周五", new int[2]);

        // 遍历所有任务，统计每天上午和下午的课程数
        for (Assignment assignment : schedule.getAssignments()) {
            if (assignment.getTimeSlots() == null) {
                continue; // 跳过未分配时间槽的任务
            }

            for (int timeSlot : assignment.getTimeSlots()) {
                int dayIndex = timeSlot / Schedule.slotsOfDay; // 计算是周几
                int slotIndex = timeSlot % Schedule.slotsOfDay; // 计算是一天中的第几个时间槽

                String day = switch (dayIndex) {
                    case 0 -> "周一";
                    case 1 -> "周二";
                    case 2 -> "周三";
                    case 3 -> "周四";
                    case 4 -> "周五";
                    default -> null; // 忽略周末
                };

                if (day != null) {
                    if (slotIndex >= morningSlotsStart && slotIndex <= morningSlotsEnd) {
                        dailyDistribution.get(day)[0]++; // 上午课程数 +1
                    } else if (slotIndex >= afternoonSlotsStart && slotIndex <= afternoonSlotsEnd) {
                        dailyDistribution.get(day)[1]++; // 下午课程数 +1
                    }
                }
            }
        }

        // 返回分析结果
        return dailyDistribution;
    }

    // 教学楼使用率
    public Map<String, Double> calculateBuildingUtilization() {

        Map<String, Integer> buildingUsage = new HashMap<>();
        Map<String, Set<String>> buildingClassrooms = new HashMap<>();

        int totalSlotsPerWeek = Schedule.slotsOfWeek; // 一周总时间槽数

        // 统计每个教学楼被占用的时间槽数，并收集每个教学楼的教室集合
        for (Assignment assignment : schedule.getAssignments()) {
            if (assignment.getClassroom() == null || assignment.getTimeSlots() == null) {
                continue; // 跳过未分配教室或时间槽的任务
            }
            String buildingName = assignment.getClassroom().getTeachingBuilding();
            String classroomId = assignment.getClassroom().getClassroomId();

            int usedSlots = assignment.getTimeSlots().size();

            // 累加教学楼的时间槽使用数
            buildingUsage.put(buildingName, buildingUsage.getOrDefault(buildingName, 0) + usedSlots);

            // 收集教学楼的教室
            buildingClassrooms.computeIfAbsent(buildingName, k -> new HashSet<>()).add(classroomId);
        }

        // 计算每个教学楼的使用率
        Map<String, Double> buildingUtilization = new HashMap<>();

        for (Map.Entry<String, Integer> entry : buildingUsage.entrySet()) {
            String buildingName = entry.getKey();
            int usedSlots = entry.getValue();

            // 获取该教学楼的教室总数
            int classroomCount = buildingClassrooms.getOrDefault(buildingName, Collections.emptySet()).size();

            // 使用率 = 被占用时间槽数 / (教学楼总教室数 × 每周总时间槽数)
            double utilizationRate = classroomCount > 0 ? (double) usedSlots / (classroomCount * totalSlotsPerWeek)
                    : 0.0;
            buildingUtilization.put(buildingName, utilizationRate);
        }

        // 输出结果
        System.out.println("教学楼使用率:");
        for (Map.Entry<String, Double> entry : buildingUtilization.entrySet()) {
            System.out.println(
                    "  教学楼 " + entry.getKey() + ": 使用率 " + String.format("%.2f", entry.getValue() * 100) + "%");
        }

        return buildingUtilization;
    }

    // 课程类型分布分析
    public Map<String, Integer> analyzeCourseTypeDistribution() {
        Map<String, Integer> courseTypeDistribution = new HashMap<>();

        for (Assignment assignment : schedule.getAssignments()) {
            String courseType = assignment.getTask().getCourseNature();
            courseTypeDistribution.put(courseType, courseTypeDistribution.getOrDefault(courseType, 0) + 1);
        }

        System.out.println("课程类型分布分析:");
        for (Map.Entry<String, Integer> entry : courseTypeDistribution.entrySet()) {
            System.out.println("  " + entry.getKey() + ": " + entry.getValue() + " 门课程");
        }

        return courseTypeDistribution;
    }

    // // TODO:4. 教师和班级安排分析
    // public void analyzeTeacherAndClassConflicts() {
    // Map<String, List<Assignment>> teacherAssignments = new HashMap<>();
    // Map<String, List<Assignment>> classAssignments = new HashMap<>();

    // for (Assignment assignment : schedule.getAssignments()) {
    // String teacherId = assignment.getTask().getTeacherEmployeeId();
    // String classId = assignment.getTask().getTeachingClassComposition();

    // teacherAssignments.computeIfAbsent(teacherId, k -> new
    // ArrayList<>()).add(assignment);
    // classAssignments.computeIfAbsent(classId, k -> new
    // ArrayList<>()).add(assignment);
    // }

    // System.out.println("教师安排冲突:");
    // for (Map.Entry<String, List<Assignment>> entry :
    // teacherAssignments.entrySet()) {
    // if (hasTimeConflicts(entry.getValue())) {
    // System.out.println(" 教师 " + entry.getKey() + " 存在时间冲突");
    // }
    // }

    // System.out.println("班级安排冲突:");
    // for (Map.Entry<String, List<Assignment>> entry : classAssignments.entrySet())
    // {
    // if (hasTimeConflicts(entry.getValue())) {
    // System.out.println(" 班级 " + entry.getKey() + " 存在时间冲突");
    // }
    // }
    // }

    // private boolean hasTimeConflicts(List<Assignment> assignments) {
    // Set<Integer> occupiedSlots = new HashSet<>();
    // for (Assignment assignment : assignments) {
    // for (int timeSlot : assignment.getTimeSlots()) {
    // if (!occupiedSlots.add(timeSlot)) {
    // return true; // 存在冲突
    // }
    // }
    // }
    // return false;
    // }

    // // TUDP:5. 任务完成率分析
    // public void analyzeTaskCompletion(List<Task> allTasks) {
    // List<Assignment> assignments = schedule.getAssignments();
    // int totalTasks = allTasks.size();
    // int completedTasks = assignments.size();
    // int uncompletedTasks = totalTasks - completedTasks;

    // System.out.println("任务完成率分析:");
    // System.out.println(" 总任务数: " + totalTasks);
    // System.out.println(" 已完成任务数: " + completedTasks);
    // System.out.println(" 未完成任务数: " + uncompletedTasks);

    // if (uncompletedTasks > 0) {
    // System.out.println("未完成任务列表:");
    // for (Task task : allTasks) {
    // boolean isCompleted = assignments.stream()
    // .anyMatch(assignment -> assignment.getTask().equals(task));
    // if (!isCompleted) {
    // System.out.println(" - " + task.getCourseName());
    // }
    // }
    // }
    // }

    // // TUDO:6. 分布均衡性分析
    // public void analyzeDistribution() {
    // Map<Integer, Integer> timeSlotDistribution = new HashMap<>();
    // Map<String, Integer> classroomDistribution = new HashMap<>();

    // for (Assignment assignment : schedule.getAssignments()) {
    // for (int timeSlot : assignment.getTimeSlots()) {
    // timeSlotDistribution.put(timeSlot,
    // timeSlotDistribution.getOrDefault(timeSlot, 0) + 1);
    // }
    // String classroomId = assignment.getClassroom().getClassroomId();
    // classroomDistribution.put(classroomId,
    // classroomDistribution.getOrDefault(classroomId, 0) + 1);
    // }

    // System.out.println("分布均衡性分析:");
    // System.out.println(" 时间分布:");
    // for (Map.Entry<Integer, Integer> entry : timeSlotDistribution.entrySet()) {
    // System.out.println(" 时间槽 " + entry.getKey() + ": " + entry.getValue() + "
    // 个任务");
    // }

    // System.out.println(" 教室分布:");
    // for (Map.Entry<String, Integer> entry : classroomDistribution.entrySet()) {
    // System.out.println(" 教室 " + entry.getKey() + ": " + entry.getValue() + "
    // 个任务");
    // }
    // }
}
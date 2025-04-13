package com.example.back_end.util;

import java.util.List;
import java.util.Random;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import lombok.Data;

@Data
public class Schedule {

    private List<Assignment> assignments; // 每个课程的安排
    private double fitness; // 适应度

    // TODO:这三个变量重命名为何classroom的格式一致
    public static final int slotsOfWeek = 40; // 一周的时段数量
    public static final int weeks = 20; // 一学期的周数
    public static final int slotsOfDay = 8; // 一天的时段数量

    public static List<PersonalizedRequest> personalizedRequests = new ArrayList<>(); // 个性化请求列表

    // 构造函数
    public Schedule(List<Assignment> assignments) {
        this.assignments = assignments;
        this.fitness = calculateFitness();
    }

    // 适应度计算逻辑
    // TODO:待完成
    @Deprecated
    public double calculateFitness() {
        double score = 0.0;

        // 记录每个老师使用的教室
        HashMap<String, List<String>> teacherClassroomMap = new HashMap<>();
        // 记录每个班级使用的教室
        HashMap<String, List<String>> classClassroomMap = new HashMap<>();

        for (Assignment assignment : assignments) {
            if (assignment.getClassroom() != null && assignment.getTimeSlots() != null) {
                score += 1.0; // 存在合法安排，加分

                String classroomId = assignment.getClassroom().getClassroomId();

                String teacherId = assignment.getTask().getTeacherEmployeeId();
                teacherClassroomMap
                        .computeIfAbsent(teacherId, k -> new ArrayList<>())
                        .add(classroomId); // 记录老师使用的教室

                String classes = assignment.getTask().getTeachingClassComposition();
                classClassroomMap
                        .computeIfAbsent(classes, k -> new ArrayList<>())
                        .add(classroomId); // 记录班级使用的教室

                // 判断满足个性化请求的数量
                Long satisfiedRequests = personalizedRequests.stream()
                        .filter(request -> {
                            if (assignment.getTask().getTeachingClassId().equals(request.getTaskId())) {
                                String preferDay = request.getPreferDay();
                                String preferPeriod = request.getPreferPeriod();
                                for (Integer slot : assignment.getTimeSlots()) {
                                    int day = slot / slotsOfDay + 1; // 计算星期几 补正偏差
                                    int start = slot % slotsOfDay + 1; // 计算开始节次 补正偏差
                                    if (preferDay.equals(String.valueOf(day))) {
                                        // TODO:这里的数字使用变量会更好，如果修改了一天的时间槽数量，这里也要相应更改
                                        return preferPeriod.equals("上午") ? (start >= 1 && start <= 4) : // 上午1-4节
                                                preferPeriod.equals("下午") ? (start >= 5 && start <= 8) : // 下午5-8节
                                                        false; // 其他情况不满足个性化请求
                                    }
                                }
                            }
                            return false; // 不满足个性化请求
                        })
                        .count();

                // TODO:适应度权重待定
                score += ((double) satisfiedRequests) * 0.1; // 满足个性化请求，加分
            }
        }

        // 遍历teracherClassroomMap
        for (List<String> classroomIds : teacherClassroomMap.values()) {
            HashSet<String> uniqueClassrooms = new HashSet<>(classroomIds);
            // 教师重复率越高，加分越多，最多一分
            double repeatRate = 1.0 - (double) uniqueClassrooms.size() / classroomIds.size();
            score += repeatRate;
        }

        // 遍历classClassroomMap
        for (List<String> classroomIds : classClassroomMap.values()) {
            HashSet<String> uniqueClassrooms = new HashSet<>(classroomIds);
            // 班级重复率越高，加分越多，最多一分
            double repeatRate = 1.0 - (double) uniqueClassrooms.size() / classroomIds.size();
            score += repeatRate;
        }

        return score;
        // return score/ assignments.size(); // 适应度为合法安排的比例
    }

}

package com.example.back_end.util;

import java.util.List;
import java.util.Random;

import java.util.ArrayList;

import lombok.Data;

@Data
public class Schedule {

    private List<Assignment> assignments; // 每个课程的安排
    private double fitness; // 适应度

    public static final int slotsOfWeek = 40; // 一周的时段数量
    public static final int weeks = 20; // 一学期的周数
    public static final int slotsOfDay = 8; // 一天的时段数量

    // 构造函数
    public Schedule(List<Assignment> assignments) {
        this.assignments = assignments;
        this.fitness = calculateFitness();
    }

    public Schedule(List<Classroom> classrooms, List<Task> tasks) {
        List<Assignment> assignments = new ArrayList<>();
        Random random = new Random();

        for (Task task : tasks) {
            Classroom classroom = classrooms.get(random.nextInt(classrooms.size()));
            assignments.add(new Assignment(classroom, task));
        }

        this.assignments = assignments;
        this.fitness = calculateFitness();
    }

    // 适应度计算逻辑
    // TODO:待完成
    public double calculateFitness() {
        double score = 0.0;

        for (Assignment assignment : assignments) {
            /*
             * 合法性检测在生成时就执行，故这里不再需要
             * if (assignment.isValid()) {
             * score += 1.0; // 合法性加分
             * }
             */
            if(assignment.getClassroom()!=null&&assignment.getTimeSlots()!=null){
                score += 1.0; // 存在的安排加分
            }
        }

        return score/ assignments.size(); // 适应度为合法安排的比例
    }

}

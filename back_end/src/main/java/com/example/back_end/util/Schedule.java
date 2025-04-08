package com.example.back_end.util;

import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

import com.example.back_end.entity.Classroom;
import com.example.back_end.repository.AssignmentRepository;

import lombok.Data;

@Data
@Component
@Scope("prototype") // 每次注入时创建一个新的实例
public class Schedule {

    private List<Assignment> assignments; // 每个课程的安排
    private double fitness; // 适应度

    public static final int slotsOfWeek = 40; // 一周的时段数量
    public static final int weeks = 20; // 一学期的周数
    public static final int slotsOfDay = 8; // 一天的时段数量

    @Autowired
    private GeneticAlgorithmScheduler scheduler; // 自动注入 GeneticAlgorithmScheduler

    @Autowired
    private AssignmentRepository assignmentRepository; // 自动注入 AssignmentRepository

    @Autowired
    private ApplicationContext applicationContext; // 自动注入 ApplicationContext

    @Autowired
    private ScheduleFactory scheduleFactory; // 自动注入 ScheduleFactory

    // 构造函数
    public Schedule(List<Assignment> assignments) {
        this.assignments = assignments;
        this.fitness = calculateFitness();
    }

    // 适应度计算逻辑
    public double calculateFitness() {
        double score = 0.0;

        // 初始化合法性列表
        List<Boolean> validityList = new ArrayList<>();
        for (int i = 0; i < assignments.size(); i++) {
            validityList.add(true); // 默认所有安排合法
        }

        // 检查冲突和合法性
        checkTimeSlotConflicts(validityList);
        checkAssignmentValid(validityList);

        for (boolean valid : validityList) {
            if (valid) {
                score += 1.0; // 合法安排加分
            }
        }

        // 适应度 = 合法安排数量 / 总安排数量
        return score / assignments.size();
    }

    // 时间冲突检测
    private void checkTimeSlotConflicts(List<Boolean> validityList) {
        List<Boolean> timeSlotOccupied = new ArrayList<>(slotsOfWeek);
        for (int i = 0; i < slotsOfWeek; i++) {
            timeSlotOccupied.add(false); // 初始化时间段占用情况
        }

        for (Assignment assignment : assignments) {
            List<Integer> timeSlots = assignment.getTimeSlots(); // 获取课程安排的时间槽列表
            for (int timeSlot : timeSlots) {
                if (timeSlotOccupied.get(timeSlot)) {
                    validityList.set(assignments.indexOf(assignment), false); // 标记为不合法
                } else {
                    timeSlotOccupied.set(timeSlot, true); // 标记时间段已占用
                }
            }
        }
    }

    // 合法性检测
    private void checkAssignmentValid(List<Boolean> validityList) {
        for (Assignment assignment : assignments) {
            if (!assignment.isValid()) {
                validityList.set(assignments.indexOf(assignment), false); // 标记为不合法
            }
        }
    }

    // 交叉呼唤逻辑
    public Schedule crossoverWith(Schedule other) {
        List<Assignment> newAssignments = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < assignments.size(); i++) {
            // 随机选择当前个体或另一个个体的安排
            if (random.nextBoolean()) {
                newAssignments.add(assignments.get(i));
            } else {
                newAssignments.add(other.getAssignments().get(i));
            }
        }

        // 返回新的 Schedule 实例
        return applicationContext.getBean(Schedule.class, newAssignments);
    }
    // 变异逻辑
    public void mutate() {
        //随机更改一个安排的时间段或地点
        Random random = new Random();
        int index = random.nextInt(assignments.size());
        Assignment assignment = assignments.get(index);
        // 随机选择一个时间段或地点进行变异
        if (random.nextBoolean()) {
            // 变更时间段
            assignment.randomChangeTimeSlots();
        } else {
            // 变更地点
            int newClassroomIndex = random.nextInt(scheduler.getClassrooms().size());
            Classroom newClassroom = scheduler.getClassrooms().get(newClassroomIndex);
            assignment.setClassroom(newClassroom);
        }
    }
    public Schedule clone() {
        List<Assignment> clonedAssignments = new ArrayList<>();
        for (Assignment assignment : assignments) {
            clonedAssignments.add(assignment);
        }
        return applicationContext.getBean(Schedule.class, clonedAssignments);
    }
    // 模拟保存到数据库的方法
    public void saveToDatabase() {
        //先删除表中所有数据
        assignmentRepository.deleteAll();
        //保存每个安排到数据库
        for (Assignment assignment : assignments) {
            com.example.back_end.entity.Assignment entity = new com.example.back_end.entity.Assignment();
            entity.setCourseId(assignment.getTask().getCourseId());
            entity.setCourseName(assignment.getTask().getCourseName());
            entity.setClassRoomId(assignment.getClassroom().getClassroomId());
            entity.setClassRoomName(assignment.getClassroom().getClassroomName());
            entity.setSlot(assignment.getTimeSlotsString());

            try {
                assignmentRepository.save(entity);
                System.out.println("Saved entity: " + entity);
            } catch (Exception e) {
                System.err.println("Failed to save entity: " + e.getMessage());
            }
        }
    }
}

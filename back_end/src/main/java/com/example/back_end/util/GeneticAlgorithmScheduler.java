package com.example.back_end.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;


import org.springframework.stereotype.Component;

import com.example.back_end.entity.Classroom;
import com.example.back_end.entity.Task;
import com.example.back_end.repository.ClassroomRepository;
import com.example.back_end.repository.TaskRepository;

import lombok.Data;

@Component
@Data
public class GeneticAlgorithmScheduler {

    private static final int POPULATION_SIZE = 100; // 种群大小
    private static final int MAX_GENERATIONS = 500; // 最大迭代次数
    private static final double MUTATION_RATE = 0.1; // 变异率
    private static final double CROSSOVER_RATE = 0.8; // 交叉率
    private static final Random random = new Random();
    private final ScheduleFactory scheduleFactory; // 排课方案工厂

    private final List<Classroom> classrooms;
    private final List<Task> tasks;

    public GeneticAlgorithmScheduler(ClassroomRepository classroomRepository, TaskRepository taskRepository, ScheduleFactory scheduleFactory) {
        this.classrooms = classroomRepository.findAll();
        this.tasks = taskRepository.findAll();
        this.scheduleFactory = scheduleFactory;
    }

    public Schedule generateSchedule() {
        List<Schedule> population = initializePopulation();

        for (int generation = 0; generation < MAX_GENERATIONS; generation++) {
            population = evolvePopulation(population);

            System.out.println("Generation " + generation + ": Best fitness = " + getBestSchedule(population).getFitness());
            // 检查是否找到可行解
            Schedule bestSchedule = getBestSchedule(population);
            if (bestSchedule.getFitness() >= 1.0) {
                return bestSchedule; // 返回最优解
            }
        }

        Schedule bestSchedule = getBestSchedule(population);
        bestSchedule.saveToDatabase(); // 将最佳排课方案存入数据库
        // 返回最优解（即使未达到完全可行）
        return bestSchedule;
    }

    private List<Schedule> initializePopulation() {
        List<Schedule> population = new ArrayList<>();
        for (int i = 0; i < POPULATION_SIZE; i++) {
            population.add(scheduleFactory.createSchedule(classrooms, tasks));
        }
        return population;
    }

    private List<Schedule> evolvePopulation(List<Schedule> population) {
        List<Schedule> newPopulation = new ArrayList<>();

        for (int i = 0; i < POPULATION_SIZE; i++) {
            Schedule parent1 = selectParent(population);
            Schedule parent2 = selectParent(population);

            Schedule offspring = crossover(parent1, parent2);
            mutate(offspring);

            newPopulation.add(offspring);
        }

        return newPopulation;
    }

    private Schedule selectParent(List<Schedule> population) {
        // 轮盘赌选择法
        double totalFitness = population.stream().mapToDouble(Schedule::getFitness).sum();
        double randomValue = random.nextDouble() * totalFitness;

        double cumulativeFitness = 0.0;
        for (Schedule schedule : population) {
            cumulativeFitness += schedule.getFitness();
            if (cumulativeFitness >= randomValue) {
                return schedule;
            }
        }

        return population.get(population.size() - 1); // 返回最后一个作为备选
    }

    private Schedule crossover(Schedule parent1, Schedule parent2) {
        if (random.nextDouble() > CROSSOVER_RATE) {
            return parent1.clone(); // 不进行交叉，直接返回父代
        }

        return parent1.crossoverWith(parent2); // 调用交叉方法
    }

    private void mutate(Schedule schedule) {
        if (random.nextDouble() < MUTATION_RATE) {
            schedule.mutate(); // 调用变异方法
        }
    }

    private Schedule getBestSchedule(List<Schedule> population) {
        return population.stream().max((s1, s2) -> Double.compare(s1.getFitness(), s2.getFitness())).orElse(null);
    }
}
package com.example.back_end.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

import com.example.back_end.repository.AssignmentRepository;
import com.example.back_end.repository.ClassroomRepository;
import com.example.back_end.repository.TaskRepository;
import lombok.Data;

@Component
@Data
public class GeneticAlgorithmScheduler {

    private static final int POPULATION_SIZE = 100; // 种群大小
    private static final int MAX_GENERATIONS = 10; // 最大迭代次数
    private static final double MUTATION_RATE = 1.0; // 变异率
    private static final double CROSSOVER_RATE = 0.8; // 交叉率
    private static final Random random = new Random();

    private final List<Classroom> classrooms;
    private final List<Task> tasks;
    private final AssignmentRepository assignmentRepository;

    public GeneticAlgorithmScheduler(ClassroomRepository classroomRepository, TaskRepository taskRepository,
            AssignmentRepository assignmentRepository) {
        this.classrooms = classroomRepository.findAll().stream()
                .map(classroom -> new Classroom(classroom))
                .collect(Collectors.toList());
        this.tasks = taskRepository.findAll().stream()
                .map(task -> new Task(task))
                .collect(Collectors.toList());
        this.assignmentRepository = assignmentRepository;
    }

    public Schedule generateSchedule() {
        // 初始化种群
        List<TaskList> population = initializePopulation();

        for (int generation = 0; generation < MAX_GENERATIONS; generation++) {
            population = evolvePopulation(population);

            System.out.println(
                    "Generation " + generation + ": Best fitness = " + getBestSchedule(population).getFitness());
            /*
             * // 检查是否找到可行解
             * Schedule bestSchedule = getBestSchedule(population);
             * if (bestSchedule.getFitness() >= 1.0) {
             * return bestSchedule; // 返回最优解
             * }
             */
        }

        Schedule bestSchedule = getBestSchedule(population);
        saveToDatabase(bestSchedule); // 保存到数据库
        // 返回最优解（即使未达到完全可行）
        return bestSchedule;
    }

    // 使用task中的优先级生成初始种群，每个TaskList默认优先级高的在前
    private List<TaskList> initializePopulation() {
        Map<Integer, List<Task>> taskMap = tasks.stream()
                .collect(Collectors.groupingBy(Task::getSchedulePriority));
        List<TaskList> population = new ArrayList<>();

        for (int i = 0; i < POPULATION_SIZE; i++) {
            // 遍历taskmap
            List<Task> taskList = new ArrayList<>();
            taskMap.forEach((priority, list) -> {
                Collections.shuffle(list);
                taskList.addAll(list);
            });
            population.add(createTaskList(taskList));
        }

        return population;
    }

    private List<TaskList> evolvePopulation(List<TaskList> population) {
        List<TaskList> newPopulation = new ArrayList<>();

        newPopulation.add(getBestTaskList(population)); // 保留最优个体
        for (int i = 1; i < POPULATION_SIZE; i++) {
            // 选择
            TaskList parent1 = selectParent(population);
            TaskList parent2 = selectParent(population);

            TaskList offspring = crossover(parent1, parent2);
            mutate(offspring);

            newPopulation.add(offspring);
        }

        return newPopulation;
    }

    private TaskList selectParent(List<TaskList> population) {
        // 轮盘赌选择法
        double totalFitness = population.stream().mapToDouble(TaskList::getFitness).sum();
        double randomValue = random.nextDouble() * totalFitness;

        double cumulativeFitness = 0.0;
        for (TaskList schedule : population) {
            cumulativeFitness += schedule.getFitness();
            if (cumulativeFitness >= randomValue) {
                return schedule;
            }
        }

        return population.get(population.size() - 1); // 返回最后一个作为备选
    }

    private TaskList crossover(TaskList parent1, TaskList parent2) {
        if (random.nextDouble() > CROSSOVER_RATE) {
            return createTaskList(parent2); // 不进行交叉，直接返回父代
        }

        List<Task> parent1Tasks = parent1.getTasks();
        List<Task> parent2Tasks = parent2.getTasks();

        int size = parent1Tasks.size();
        // 随机选择一个子区间 L
        int left = random.nextInt(size); // 子区间左边界（包含）
        int right = random.nextInt(size - left) + left; // 子区间右边界（包含）

        // 提取父代 B 中子区间 L 的任务
        List<Task> subListFromParent2 = parent2Tasks.subList(left, right + 1);

        // 构造子代任务列表
        List<Task> childTasks = new ArrayList<>();
        int parent1Index = 0;

        for (int i = 0; i < size; i++) {
            if (i >= left && i <= right) {
                // 子区间 L 的部分从父代 B 中复制
                childTasks.add(parent2Tasks.get(i));
            } else {
                // 非子区间 L 的部分从父代 A 中复制，跳过子区间 L 中的任务
                while (subListFromParent2.contains(parent1Tasks.get(parent1Index))) {
                    parent1Index++;
                }

                childTasks.add(parent1Tasks.get(parent1Index));
                parent1Index++;
            }
        }
        return createTaskList(childTasks); // 调用交叉方法
    }

    private void mutate(TaskList taskList) {
        if (random.nextDouble() > MUTATION_RATE) {
            return; // 不进行变异
        }

        // 获取任务列表
        List<Task> tasks = taskList.getTasks();
        int size = tasks.size();

        // 随机选择一个任务的索引
        int fromIndex = random.nextInt(size);

        // 随机选择一个新的位置索引
        int toIndex = random.nextInt(size);

        // 位置相同直接返回
        while (toIndex == fromIndex) {
            return;
        }

        // 将任务移动到新位置
        Task task = tasks.remove(fromIndex); // 从原位置移除任务
        tasks.add(toIndex, task); // 插入到新位置

        // 更新任务列表的适应度
        Schedule schedule = generateScheduleGreedyily(taskList);
        taskList.setSchedule(schedule);
        taskList.setFitness(schedule.getFitness());
    }

    private TaskList getBestTaskList(List<TaskList> population) {
        return population.stream().max((s1, s2) -> Double.compare(s1.getFitness(), s2.getFitness())).orElse(null);
    }

    private Schedule getBestSchedule(List<TaskList> population) {
        return getBestTaskList(population).getSchedule();
    }

    // TODO:此处可优化效率
    private TaskList createTaskList(List<Task> tasks) {
        TaskList taskList = new TaskList(tasks);
        Schedule schedule = generateScheduleGreedyily(taskList);
        taskList.setSchedule(schedule); // 使用贪心算法生成初始排课方案
        taskList.setFitness(schedule.getFitness());
        return taskList;
    }

    private TaskList createTaskList(TaskList taskList) {
        TaskList newTaskList = new TaskList(taskList.getTasks());
        Schedule schedule = generateScheduleGreedyily(newTaskList);
        newTaskList.setSchedule(schedule);
        newTaskList.setFitness(schedule.getFitness());
        return newTaskList;
    }

    // TODO:验证该贪心算法
    private Schedule generateScheduleGreedyily(TaskList taskList) {
        // System.out.println("hashcode: " + taskList.hashCode());
        List<Assignment> assignments = new ArrayList<>();

        // 刷新每个教室的时间占用情况！!!
        for (Classroom classroom : classrooms) {
            classroom.releaseAllSlots();
        }
        // 处理每个排课任务
        for (Task task : taskList.getTasks()) {
            List<Classroom> validClassrooms = classrooms.stream().filter(classroom -> task.isValid(classroom))
                    .collect(Collectors.toList());

            Classroom classroom = null;
            List<Integer> timeSlots = null;
            // TODO:一门课一周需要排多次，每次时长不同的情况未考虑
            // 遍历所有合法的教室
            for (Classroom room : validClassrooms) {
                // 需要排的数量
                int classNum = task.getHoursOfWeek() / task.getDurationTime();
                timeSlots = room.tryOccupySlots(task.getWeeks(), task.getDurationTime(),
                        classNum);
                if (timeSlots != null) {
                    classroom = room;
                    break; // 找到一个有效的教室和时间段后，跳出循环
                }
            }
            Assignment assignment = new Assignment(classroom, timeSlots, task);
            assignments.add(assignment); // 添加到排课列表
        }

        Schedule schedule = new Schedule(assignments);
        return schedule;
    }

    // 模拟保存到数据库的方法
    private void saveToDatabase(Schedule schedule) {
        // 先删除表中所有数据
        assignmentRepository.deleteAll();
        // 保存每个安排到数据库
        List<Assignment> assignments = schedule.getAssignments();
        for (Assignment assignment : assignments) {
            com.example.back_end.entity.Assignment entity = assignment.toEntity();

            try {
                assignmentRepository.save(entity);
                System.out.println("Saved entity: " + entity);
            } catch (Exception e) {
                System.err.println("Failed to save entity: " + e.getMessage());
            }
        }
    }

    /*
     * 时间冲突检测方法
     */
    public List<Assignment> getConflicts() {
        List<Assignment> conflicts = new ArrayList<>();
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
                    int day = Integer.parseInt(subParts[0]) - 1;// 修正偏差
                    int start = Integer.parseInt(timeParts[0]) - 1;// 修正偏差
                    int timeSlot = day * Schedule.slotsOfDay + start;
                    timeSlots.add(timeSlot);
                }
            }
            Task task = tasks.stream()
                    .filter(t -> t.getTeachingClassId().equals(assignment.getTeachingClassId()))
                    .findFirst().orElse(null);
            return new Assignment(classroom, timeSlots, task);
        }).collect(Collectors.toList());

        for (Classroom classroom : classrooms) {
            classroom.releaseAllSlots();
        }

        for (Assignment assignment : assignments) {
            Classroom classroom = assignment.getClassroom();
            List<Integer> timeSlots = assignment.getTimeSlots();
            Task task = assignment.getTask();

            // 检查时间段是否冲突
            if (classroom != null && timeSlots != null) {
                List<Integer> weeks = task.getWeeks();
                for (int timeSlot : timeSlots) {
                    int start = timeSlot;
                    int end = start + task.getDurationTime() - 1;
                    if (!classroom.isRangeAvailable(weeks, start, end)) {
                        conflicts.add(assignment);
                        break; // 找到冲突后跳出循环
                    }
                }
                // 如果没有冲突，则占用时间段
                if (!conflicts.contains(assignment)) {
                    for (int timeSlot : timeSlots) {
                        int start = timeSlot;
                        int end = start + task.getDurationTime() - 1;
                        classroom.occupyRange(weeks, start, end);
                    }
                }
            }
        }

        return conflicts;
    }
}
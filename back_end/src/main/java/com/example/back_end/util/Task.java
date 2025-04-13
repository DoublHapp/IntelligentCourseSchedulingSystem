package com.example.back_end.util;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Task extends com.example.back_end.entity.Task {

    private List<Integer> weeks; // 课程安排的周次
    private int HoursOfWeek;
    private int durationTime; // 连续节次
    // 初始化开始周、结束周、连续节次、连排节次

    private void initialize() {
        // 格式: startWeek-endWeek:durationTime,startWeek-endWeek:durationTime,...
        String schedule = getCourseWeeklyScheduleHours();
        String[] parts = schedule.split(",");
        for (String part : parts) {
            String[] subParts = part.split(":");
            String[] weeks = subParts[0].split("-");
            // 索引从0开始，实际周从1开始，进行偏差补正
            int startWeek = Integer.parseInt(weeks[0]) - 1;
            int endWeek = Integer.parseInt(weeks[1]) - 1;
            int HoursOfWeek = Integer.parseInt(subParts[1]);
            this.HoursOfWeek = HoursOfWeek;
            int durationTime = getConsecutiveClassSlots();
            this.durationTime = durationTime;

            this.weeks= new ArrayList<>();
            for(int i = startWeek; i <= endWeek; i++) {
                this.weeks.add(i);
            }
        }
    }

    /*
     * 计算中需要用到的任务信息
     * 1. 课程优先级
     * 2. 指定教室
     * 3. 指定教室类型
     * 4. 连续节次
     * 5. 课程人数
     * 6. 课程每周学时
     * 7. 课程ID
     * 8. 课程名称
     * 9. 教师id
     * 10. 教学班组成
     * 11. 教学班id
     */
    public Task(com.example.back_end.entity.Task task) {
        setSchedulePriority(task.getSchedulePriority());
        setDesignatedClassroom(task.getDesignatedClassroom());
        setDesignatedClassroomType(task.getDesignatedClassroomType());
        setConsecutiveClassSlots(task.getConsecutiveClassSlots());
        setTeachingClassSize(task.getTeachingClassSize());
        setCourseWeeklyScheduleHours(task.getCourseWeeklyScheduleHours());
        setCourseId(task.getCourseId());
        setCourseName(task.getCourseName());
        setTeacherEmployeeId(task.getTeacherEmployeeId());
        setTeachingClassComposition(task.getTeachingClassComposition());
        setTeachingClassId(task.getTeachingClassId());
        setCourseNature(task.getCourseNature());
        initialize();
    }

    // 判断该任务是否可以安排在一个教室
    public boolean isValid(Classroom classroom) {
        // 检查安排是否有效（例如：教室容量足够、时间段无冲突等）
        // 容量检测
        final int capacity = classroom.getMaximumClassSeatingCapacity();
        final int studentCount = getTeachingClassSize();
        if (capacity < studentCount) {
            return false;
        }

        // 指定教室
        final String specifiedClassroom = getDesignatedClassroom();
        final String classroomName = classroom.getClassroomName();
        if (specifiedClassroom != null && specifiedClassroom.length() > 0
                && !specifiedClassroom.equals(classroomName)) {
            return false;
        }

        // 指定教室类型
        final String specifiedClassroomType = getDesignatedClassroomType();
        final String classroomType = classroom.getClassroomType();
        if (specifiedClassroomType != null && specifiedClassroomType.length() > 0
                && !specifiedClassroomType.equals(classroomType)) {
            return false;
        }

        return true;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        Task task = (Task) obj;
        return hashCode() == task.hashCode();
    }

    @Override
    public int hashCode() {
        return getTeachingClassId().hashCode();
    }

}

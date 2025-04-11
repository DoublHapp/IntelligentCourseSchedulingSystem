package com.example.back_end.util;

import lombok.Data;

@Data
public class Task extends com.example.back_end.entity.Task {

    private int startWeek;
    private int endWeek;
    private int HoursOfWeek;
    private int durationTime; // 连续节次
    //初始化开始周、结束周、连续节次、连排节次
    private void initialize(){
        String schedule = getCourseWeeklyScheduleHours(); // 格式: startWeek-endWeek:durationTime
        String[] parts = schedule.split(":");
        String[] weeks = parts[0].split("-");
        //索引从0开始，实际周从1开始，进行偏差补正
        int startWeek = Integer.parseInt(weeks[0])-1;
        int endWeek = Integer.parseInt(weeks[1])-1;
        int HoursOfWeek = Integer.parseInt(parts[1]);
        this.startWeek = startWeek;
        this.endWeek = endWeek;
        this.HoursOfWeek = HoursOfWeek;
        int durationTime=getConsecutiveClassSlots();
        this.durationTime = durationTime;
        //TODO:删除该测试信息
        if(durationTime == 0){
            System.out.println(getCourseName() + "的课程安排的连续节次为0，使用默认值\n\n\n\n\n");
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
        initialize();
    }
    
    //判断该任务是否可以安排在一个教室
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
        if (specifiedClassroom != null && !specifiedClassroom.equals(classroomName)) {
            return false;
        }

        // 指定教室类型
        final String specifiedClassroomType = getDesignatedClassroomType();
        final String classroomType = classroom.getClassroomType();
        if (specifiedClassroomType != null && !specifiedClassroomType.equals(classroomType)) {
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
        return getCourseId().equals(task.getCourseId());
    }

    @Override
    public int hashCode() {
        return getCourseId().hashCode();
    }

}

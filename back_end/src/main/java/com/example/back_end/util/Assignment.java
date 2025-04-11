package com.example.back_end.util;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Assignment {
    private Task task; // 课程任务
    private Classroom classroom;
    private List<Integer> timeSlots; // 周视图下的课程安排的时间槽列表

    private int startWeek;
    private int endWeek;
    private int HoursOfWeek;
    private int durationTime; // 连续节次
    public Assignment(Classroom classroom, List<Integer> timeSlots, Task task) {
        this.task = task;
        this.classroom = classroom;
        this.timeSlots = timeSlots;
        initialize();
    }

    public Assignment(Classroom classroom, Task task) {
        this.task = task;
        this.classroom = classroom;
        initialize();
        randomChangeTimeSlots();
    }

    //初始化开始周、结束周、连续节次、连排节次
    @Deprecated
    private void initialize(){
        String schedule = task.getCourseWeeklyScheduleHours(); // 格式: startWeek-endWeek:durationTime
        String[] parts = schedule.split(":");
        String[] weeks = parts[0].split("-");
        //索引从0开始，实际周从1开始，进行偏差补正
        int startWeek = Integer.parseInt(weeks[0])-1;
        int endWeek = Integer.parseInt(weeks[1])-1;
        int HoursOfWeek = Integer.parseInt(parts[1]);
        this.startWeek = startWeek;
        this.endWeek = endWeek;
        this.HoursOfWeek = HoursOfWeek;
        int durationTime=task.getConsecutiveClassSlots();
        this.durationTime = durationTime;
        //TODO:删除该测试信息
        if(durationTime == 0){
            System.out.println(task.getCourseName() + "的课程安排的连续节次为0，使用默认值\n\n\n\n\n");
        }
    }

    //TODO:检查是否正确
    public boolean isValid() {
        // 检查安排是否有效（例如：教室容量足够、时间段无冲突等）
        // 容量检测
        final int capacity = classroom.getMaximumClassSeatingCapacity();
        final int studentCount = task.getTeachingClassSize();
        if (capacity < studentCount) {
            return false;
        }

        // 指定教室
        final String specifiedClassroom = task.getDesignatedClassroom();
        final String classroomName = classroom.getClassroomName();
        if (specifiedClassroom != null && !specifiedClassroom.equals(classroomName)) {
            return false;
        }

        // 指定教室类型
        final String specifiedClassroomType = task.getDesignatedClassroomType();
        final String classroomType = classroom.getClassroomType();
        if (specifiedClassroomType != null && !specifiedClassroomType.equals(classroomType)) {
            return false;
        }
        
        //课程在周安排的开始时间是否能正常连续上完课程
        for (int slot : timeSlots) {
            int slotOfDay = slot % Schedule.slotsOfDay;
            if (slotOfDay + durationTime > Schedule.slotsOfWeek) {
                return false; // 超出一天的时间槽范围
            }
        }

        return true;
    }

    //生成学期视图下的时间槽
    public List<Integer> getTimeSlotsInTerm() {
        List<Integer> slots = new ArrayList<>();

        final int slotsOfWeek = Schedule.slotsOfWeek;

        for (int week = startWeek; week <= endWeek; week++) {
            for(int slot : timeSlots) {
                for (int i = 0; i < durationTime; i++) {
                    slots.add(slot + week * slotsOfWeek + i);
                }
            }
        }

        return slots;
    }

    //随机更改时间段
    @Deprecated
    public void randomChangeTimeSlots() {
        //一周中需要排几节课
        //TODO:删除该测试信息
        if(durationTime == 0){
            System.out.println(task.getCourseName() + "的课程安排的连续节次为0，使用默认值\n\n\n\n\n");
            durationTime = HoursOfWeek;
        }
        int classNum = HoursOfWeek/durationTime;
        //一周中有多少个时间槽
        List<Integer> timeSlots = new ArrayList<>();
        for (int i = 0; i < classNum; i++) {
            int randomTimeSlot = (int) (Math.random() * Schedule.slotsOfWeek);
            timeSlots.add(randomTimeSlot);
        }
        this.timeSlots = timeSlots;
    }

    //获取 day:start-end,dat:start-end格式的时间字符串
    public String getTimeSlotsString() {
        StringBuilder timeSlotsString = new StringBuilder();
        for (int i = 0; i < timeSlots.size(); i++) {
            int slot = timeSlots.get(i);
            int day = slot / Schedule.slotsOfDay + 1;// 修正偏差
            int start = slot % Schedule.slotsOfDay + 1;// 修正偏差
            int end = start + durationTime - 1;
            timeSlotsString.append(day).append(":").append(start).append("-").append(end);
            if (i < timeSlots.size() - 1) {
                timeSlotsString.append(",");
            }
        }
        return timeSlotsString.toString();
    }
}

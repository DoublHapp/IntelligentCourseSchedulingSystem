package com.example.back_end.util;

import java.util.List;

import lombok.Data;

@Data
public class Assignment {
    private Task task; // 课程任务
    private Classroom classroom;
    private List<Integer> timeSlots; // 周视图下的课程安排的时间槽列表，只记录开始时间
    private List<Integer> weeks; // 课程安排的周列表

    public Assignment(Classroom classroom, List<Integer> timeSlots, Task task) {
        this.task = task;
        this.classroom = classroom;
        this.timeSlots = timeSlots;
        this.weeks = task.getWeeks(); // 课程安排的周列表
    }

    public com.example.back_end.entity.Assignment toEntity() {
        com.example.back_end.entity.Assignment entity = new com.example.back_end.entity.Assignment();
        entity.setCourseId(getTask().getCourseId());
        entity.setCourseName(getTask().getCourseName());
        entity.setTeachingClassId(getTask().getTeachingClassId());
        if (classroom == null) {
            entity.setClassRoomId(null);
            entity.setClassRoomName(null);
            entity.setSlot(null);
            entity.setWeeks(null);
        } else {
            entity.setClassRoomId(classroom.getClassroomId());
            entity.setClassRoomName(classroom.getClassroomName());
            entity.setSlot(getTimeSlotsString());
            entity.setWeeks(getWeeksString());
        }
        return entity;
    }

    // 获取 day:start-end,dat:start-end格式的时间字符串
    public String getTimeSlotsString() {
        StringBuilder timeSlotsString = new StringBuilder();
        for (int i = 0; i < timeSlots.size(); i++) {
            int slot = timeSlots.get(i);
            int day = slot / Schedule.slotsOfDay + 1;// 修正偏差
            int start = slot % Schedule.slotsOfDay + 1;// 修正偏差
            int end = start + task.getDurationTime() - 1;
            timeSlotsString.append(day).append(":").append(start).append("-").append(end);
            if (i < timeSlots.size() - 1) {
                timeSlotsString.append(",");
            }
        }
        return timeSlotsString.toString();
    }

    public String getWeeksString() {
        StringBuilder weeksString = new StringBuilder();
        for (int i = 0; i < weeks.size(); i++) {
            int week = weeks.get(i);
            weeksString.append(week + 1);// 修正偏差
            if (i < weeks.size() - 1) {
                weeksString.append(",");
            }
        }
        return weeksString.toString();
    }
}

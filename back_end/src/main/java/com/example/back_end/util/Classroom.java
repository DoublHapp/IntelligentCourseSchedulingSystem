package com.example.back_end.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Classroom extends com.example.back_end.entity.Classroom {
    private boolean[] timeSlots; // 布尔值序列，表示教室的时间占用情况

    // 每天课程时段数量（常量）
    private static final int SLOTS_PER_DAY = 8;
    private static final int DAYS_PER_WEEK = 5;
    private static final int WEEKS_PER_SEMESTER = 20;

    public Classroom(com.example.back_end.entity.Classroom classroom) {
        setClassroomId(classroom.getClassroomId());
        setClassroomName(classroom.getClassroomName());
        setMaximumClassSeatingCapacity(classroom.getMaximumClassSeatingCapacity());
        setClassroomType(classroom.getClassroomType());
        this.timeSlots = new boolean[SLOTS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_SEMESTER];
        Arrays.fill(this.timeSlots, false);
    }

    // 检查某个时间段是否被占用
    public boolean isOccupied(int slot) {
        validateSlot(slot);
        return timeSlots[slot];
    }

    // 释放所有时间段
    public void releaseAllSlots() {
        Arrays.fill(timeSlots, false);
    }

    // 占用某个时间段
    public void occupySlot(int slot) {
        validateSlot(slot);
        if (timeSlots[slot]) {
            throw new IllegalStateException("Time slot " + slot + " is already occupied.");
        }
        timeSlots[slot] = true;
    }

    // 释放某个时间段
    public void releaseSlot(int slot) {
        validateSlot(slot);
        if (!timeSlots[slot]) {
            throw new IllegalStateException("Time slot " + slot + " is not occupied.");
        }
        timeSlots[slot] = false;
    }

    // 检查某个时间段范围是否全部空闲
    public boolean isRangeAvailable(int startSlot, int endSlot) {
        validateSlot(startSlot);
        validateSlot(endSlot);
        if (startSlot > endSlot) {
            throw new IllegalArgumentException("Start slot cannot be greater than end slot.");
        }
        for (int i = startSlot; i <= endSlot; i++) {
            if (timeSlots[i]) {
                return false;
            }
        }
        return true;
    }

    // 占用某个时间段范围
    public void occupyRange(int startSlot, int endSlot) {
        if (!isRangeAvailable(startSlot, endSlot)) {
            throw new IllegalStateException("Some slots in the range are already occupied.");
        }
        for (int i = startSlot; i <= endSlot; i++) {
            timeSlots[i] = true;
        }
    }

    // 释放某个时间段范围
    public void releaseRange(int startSlot, int endSlot) {
        validateSlot(startSlot);
        validateSlot(endSlot);
        for (int i = startSlot; i <= endSlot; i++) {
            timeSlots[i] = false;
        }
    }

    // 验证时间段是否合法
    private void validateSlot(int slot) {
        if (slot < 0 || slot >= timeSlots.length) {
            throw new IllegalArgumentException("Invalid time slot: " + slot);
        }
    }

    // 检查指定连续周次的某时间段是否可用
    public boolean isRangeAvailable(List<Integer> weeks, int startSlot, int endSlot) {
        for (int week : weeks) {
            for (int i = startSlot; i <= endSlot; i++) {
                if (timeSlots[week * DAYS_PER_WEEK * SLOTS_PER_DAY + i]) {
                    return false; // 时间段已被占用
                }
            }
        }
        return true; // 时间段可用
    }
    // 占用指定连续周次的某时间段
    public void occupyRange(List<Integer> weeks, int startSlot, int endSlot) {
        for (int week : weeks) {
            for (int i = startSlot; i <= endSlot; i++) {
                timeSlots[week * DAYS_PER_WEEK * SLOTS_PER_DAY + i] = true;
            }
        }
    }
    // 释放指定连续周次的某时间段
    public void releaseRange(int startWeek, int endWeek, int startSlot, int endSlot) {
        if (startWeek < 0 || endWeek >= WEEKS_PER_SEMESTER || startSlot < 0 || endSlot >= timeSlots.length) {
            throw new IllegalArgumentException("Invalid week or time slot.");
        }
        for (int week = startWeek; week <= endWeek; week++) {
            for (int i = startSlot; i <= endSlot; i++) {
                timeSlots[week * DAYS_PER_WEEK * SLOTS_PER_DAY + i] = false;
            }
        }
    }

    // 获取教室的布尔值序列
    public boolean[] getTimeSlots() {
        return timeSlots.clone(); // 返回副本以保护原始数据
    }

    // 尝试占用若干连续时间段
    public List<Integer> tryOccupySlots(List<Integer> weeks, int length, int num) {
        List<Integer> timeSlots = new ArrayList<>();

        for (int day = 0; day < DAYS_PER_WEEK; day++) {
            for (int start = day * SLOTS_PER_DAY; start < day * SLOTS_PER_DAY + SLOTS_PER_DAY - length + 1; start++) {
                int end = start + length - 1;
                if (isRangeAvailable(weeks, start, end)) {
                    timeSlots.add(start);
                    break;// 每天只排一次
                }
            }
            if (timeSlots.size() == num) {
                break; // 找到足够的时间段
            }
        }

        if (timeSlots.size() == num) {
            for (int i = 0; i < timeSlots.size(); i++) {
                int start = timeSlots.get(i);
                int end = start + length - 1;
                occupyRange(weeks, start, end);
            }
            return timeSlots;
        }

        return null; // 无法占用指定长度的时间段
    }
}

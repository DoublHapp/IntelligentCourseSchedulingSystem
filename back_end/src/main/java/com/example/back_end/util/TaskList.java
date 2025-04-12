package com.example.back_end.util;

import java.util.List;

import lombok.Data;

@Data
public class TaskList {
    private List<Task> tasks;
    private Schedule schedule;
    private double fitness;
    public TaskList() {
        this.tasks = null;
    }

    public TaskList(List<Task> tasks) {
        this.tasks = tasks;
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        TaskList other = (TaskList) obj;
        if (tasks == null) {
            if (other.tasks != null) {
                return false;
            }
        } else if (!tasks.equals(other.tasks)) {
            return false;
        }
        return true;
    }

    public int hashCode() {
        int result = 1;
        result = 31 * result + (tasks == null ? 0 : tasks.hashCode());
        return result;
    }
}

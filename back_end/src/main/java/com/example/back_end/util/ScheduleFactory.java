package com.example.back_end.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import com.example.back_end.entity.Classroom;
import com.example.back_end.entity.Task;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class ScheduleFactory {
    
@Autowired
    private ApplicationContext applicationContext;

    public Schedule createSchedule(List<Classroom> classrooms, List<Task> tasks) {
        List<Assignment> assignments = new ArrayList<>();
        Random random = new Random();

        for (Task task : tasks) {
            Classroom classroom = classrooms.get(random.nextInt(classrooms.size()));
            assignments.add(new Assignment(classroom, task));
        }

        return applicationContext.getBean(Schedule.class, assignments);
    }
}

package com.example.back_end.service;

import org.springframework.stereotype.Service;
import com.example.back_end.util.GeneticAlgorithmScheduler;

@Service
public class AssignmentService {
    private GeneticAlgorithmScheduler geneticAlgorithmScheduler;

    public AssignmentService(GeneticAlgorithmScheduler geneticAlgorithmScheduler) {
        this.geneticAlgorithmScheduler = geneticAlgorithmScheduler;
    }

    public void generateAssignments(){
        geneticAlgorithmScheduler.generateSchedule();
    }
}
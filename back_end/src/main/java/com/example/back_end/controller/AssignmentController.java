package com.example.back_end.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.back_end.service.AssignmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;





@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {
    private final AssignmentService assignmentService;
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/generate")
    public ResponseEntity<String> generateAssignments() {
        try {
            System.out.println("开始排课");
            assignmentService.generateAssignments();
            return ResponseEntity.ok("排课成功");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("排课失败"+ e.getMessage());
            return ResponseEntity.status(500).body("排课失败: " + e.getMessage());
        }
    }
}

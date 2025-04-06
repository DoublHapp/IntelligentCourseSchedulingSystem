package com.example.back_end.service;

import com.example.back_end.entity.Task;
import com.example.back_end.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    
    private final TaskRepository taskRepository;
    
    
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    
    public List<Task> findAll() {
        return taskRepository.findAll();
    }
    
    public Optional<Task> findById(String courseId) {
        return taskRepository.findById(courseId);
    }
    
    public List<Task> findByAcademicYearTerm(String academicYearTerm) {
        return taskRepository.findByAcademicYearTerm(academicYearTerm);
    }
    
    public List<Task> findByInstructorName(String instructorName) {
        return taskRepository.findByInstructorName(instructorName);
    }
    
    public List<Task> findByTeachingClassName(String teachingClassName) {
        return taskRepository.findByTeachingClassName(teachingClassName);
    }
    
    public List<Task> findByCourseName(String courseName) {
        return taskRepository.findByCourseName(courseName);
    }
    
    public List<Task> findByCampusOfCourseOffering(String campus) {
        return taskRepository.findByCampusOfCourseOffering(campus);
    }
    
    public List<Task> findByCourseOfferingDepartment(String department) {
        return taskRepository.findByCourseOfferingDepartment(department);
    }
    
    public List<Task> findByCourseNature(String courseNature) {
        return taskRepository.findByCourseNature(courseNature);
    }
    
    public List<Task> findByHourType(String hourType) {
        return taskRepository.findByHourType(hourType);
    }
    
    public Task save(Task task) {
        return taskRepository.save(task);
    }
    
    public void deleteById(String courseId) {
        taskRepository.deleteById(courseId);
    }
    
    // 查找某教师在某学期的排课任务
    public List<Task> findByInstructorNameAndAcademicYearTerm(String instructorName, String academicYearTerm) {
        return taskRepository.findByInstructorNameAndAcademicYearTerm(instructorName, academicYearTerm);
    }
    
    // 查找某班级在某学期的排课任务
    public List<Task> findByTeachingClassCompositionAndAcademicYearTerm(String className, String academicYearTerm) {
        return taskRepository.findByTeachingClassCompositionContainingAndAcademicYearTerm(className, academicYearTerm);
    }
}
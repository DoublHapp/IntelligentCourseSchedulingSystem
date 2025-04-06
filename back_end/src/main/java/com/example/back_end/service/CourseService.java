package com.example.back_end.service;

import com.example.back_end.entity.Course;
import com.example.back_end.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    
    private final CourseRepository courseRepository;
    
    
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }
    
    public List<Course> findAll() {
        return courseRepository.findAll();
    }
    
    public Optional<Course> findById(String id) {
        return courseRepository.findById(id);
    }
    public List<Course> findByCourseOfferingDepartment(String department){
        return courseRepository.findByCourseOfferingDepartment(department);
    };
    
    public List<Course> findByNameContaining(String name) {
        return courseRepository.findByCourseNameContaining(name);
    }
    
    public List<Course> findByNameOrCodeContaining(String keyword) {
        return courseRepository.findByCourseNameContainingOrCourseIdContaining(keyword, keyword);
    }
    
    public Course save(Course course) {
        return courseRepository.save(course);
    }
    
    public void deleteById(String id) {
        courseRepository.deleteById(id);
    }
    
    // 查找指定课程的先修课程
    public List<Course> findPrerequisitesForCourse(String courseId) {
        return courseRepository.findPrerequisitesForCourse(courseId);
    }
}
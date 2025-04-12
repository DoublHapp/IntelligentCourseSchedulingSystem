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
    
    public List<Course> findByCourseOfferingDepartment(String department) {
        return courseRepository.findByCourseOfferingDepartment(department);
    }
    
    public List<Course> findByNameContaining(String name) {
        return courseRepository.findByCourseNameContaining(name);
    }
    
    public List<Course> findByNameOrCodeContaining(String keyword) {
        return courseRepository.findByCourseNameContainingOrCourseIdContaining(keyword, keyword);
    }
    
    public List<Course> findByCourseCategory(String category) {
        return courseRepository.findByCourseCategory(category);
    }
    
    public List<Course> findByCourseAttribute(String attribute) {
        return courseRepository.findByCourseAttribute(attribute);
    }
    
    public List<Course> findByCourseType(String type) {
        return courseRepository.findByCourseType(type);
    }
    
    public List<Course> findByCourseNature(String nature) {
        return courseRepository.findByCourseNature(nature);
    }
    
    public List<Course> findByCredits(Float credits) {
        return courseRepository.findByCredits(credits);
    }
    
    public List<Course> findByIsPurePracticalSession(String isPurePracticalSession) {
        return courseRepository.findByIsPurePracticalSession(isPurePracticalSession);
    }
    
    public List<Course> findByTotalHoursBetween(Integer minHours, Integer maxHours) {
        return courseRepository.findByTotalHoursBetween(minHours, maxHours);
    }
    
    public List<Course> findByWeeklyHours(Integer weeklyHours) {
        return courseRepository.findByWeeklyHours(weeklyHours);
    }
    
    public List<Course> findByIsEnabled(String isEnabled) {
        return courseRepository.findByIsEnabled(isEnabled);
    }
    
    public Course save(Course course) {
        return courseRepository.save(course);
    }
    
    public void deleteById(String id) {
        courseRepository.deleteById(id);
    }
    
  
}
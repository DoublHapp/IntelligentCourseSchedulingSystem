package com.example.back_end.repository;

import com.example.back_end.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    
    List<Task> findByAcademicYearTerm(String academicYearTerm);
    
    List<Task> findByInstructorName(String instructorName);
    
    List<Task> findByTeachingClassName(String teachingClassName);
    
    List<Task> findByCourseName(String courseName);
    
    List<Task> findByCampusOfCourseOffering(String campus);
    
    List<Task> findByCourseOfferingDepartment(String department);
    
    List<Task> findByCourseNature(String courseNature);
    
    List<Task> findByHourType(String hourType);
    
    List<Task> findByInstructorNameAndAcademicYearTerm(String instructorName, String academicYearTerm);
    
    List<Task> findByTeachingClassCompositionContainingAndAcademicYearTerm(String className, String academicYearTerm);
}
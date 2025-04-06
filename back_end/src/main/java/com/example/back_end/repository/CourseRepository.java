package com.example.back_end.repository;

import com.example.back_end.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    
    /**
     * 根据课程名称模糊查询
     */
    List<Course> findByCourseNameContaining(String name);
    
   /**
     * 根据课程代码模糊查询
     */
    List<Course> findByCourseIdContaining(String code); // code对应courseId
    
    /**
     * 根据课程名称或代码模糊查询
     */
    List<Course> findByCourseNameContainingOrCourseIdContaining(String name, String code);
    

    
    /**
     * 根据课程类型查询课程
     */
    List<Course> findByCourseType(String type);
    
    /**
     * 根据课程性质查询课程
     */
    List<Course> findByCourseNature(String nature);
    
    /**
     * 根据学分查询课程
     */
    List<Course> findByCredits(Float credits);
    
    /**
     * 查询指定课程的先修课程
     */
    @Query(value = "SELECT c.* FROM courses c JOIN course_prerequisites cp ON c.course_id = cp.prerequisite_id WHERE cp.course_id = :courseId", nativeQuery = true)
    List<Course> findPrerequisitesForCourse(String courseId);
    
    /**
     * 查询某学院开设的所有课程
     */
    List<Course> findByCourseOfferingDepartment(String department);
    
    /**
     * 查询是否为纯实践课程
     */
    List<Course> findByIsPurePracticalSession(String isPurePracticalSession);
}
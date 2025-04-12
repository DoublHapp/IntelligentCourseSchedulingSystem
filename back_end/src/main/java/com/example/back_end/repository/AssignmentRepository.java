package com.example.back_end.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.back_end.entity.Assignment;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    
      
    // 根据教室ID查找排课
    List<Assignment> findByClassRoomId(String classRoomId);
    
    // 查询所有与特定课程相关的排课
    List<Assignment> findByCourseName(String courseName);
    
    // 通过课程ID和教室ID查询特定排课
    Assignment findByCourseIdAndClassRoomId(String courseId, String classRoomId);
    
    // 通过时间段查询排课（模糊匹配）
    List<Assignment> findBySlotContaining(String slotPattern);
    
    // 查询与某个班级关联的所有排课（通过关联Task表）
    @Query(value = "SELECT a.* FROM assignment a JOIN tasks t ON a.course_id = t.course_id " +
           "WHERE t.teaching_class_composition LIKE CONCAT('%', :className, '%')", nativeQuery = true)
    List<Assignment> findByClassName(@Param("className") String className);
    
    // 查询与某个教师关联的所有排课（通过关联Task表）
    @Query(value = "SELECT a.* FROM assignment a JOIN tasks t ON a.course_id = t.course_id " +
           "WHERE t.instructor_name = :teacherName", nativeQuery = true)
    List<Assignment> findByTeacherName(@Param("teacherName") String teacherName);
}
package com.example.back_end.repository;

import com.example.back_end.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {
    
    /**
     * 根据教师姓名模糊查询
     */
    List<Teacher> findByNameContaining(String name);
    
    /**
     * 根据部门查询教师
     */
    List<Teacher> findByDepartment(String department);
    
    /**
     * 根据职称查询教师
     */
    List<Teacher> findByJobTitle(String jobTitle);
    
    /**
     * 根据性别查询教师
     */
    List<Teacher> findByGender(String gender);
    
    /**
     * 查询外聘教师
     */
    List<Teacher> findByIsExternalHireEquals(String isExternalHire);
    
    /**
     * 根据教师类别查询
     */
    List<Teacher> findByStaffCategory(String category);
    
    /**
     * 查询指定教师在某学期教授的课程
     */
    @Query(value = "SELECT DISTINCT c.course_name FROM tasks t JOIN courses c ON t.course_id = c.course_id WHERE t.teacher_employee_id = :teacherId AND t.semester = :semester", nativeQuery = true)
    List<String> findTeacherCurrentCourses(String teacherId, String semester);
    
    /**
     * 根据教师姓名和部门查询
     */
    List<Teacher> findByNameContainingAndDepartment(String name, String department);
    
    /**
     * 根据教师ID批量查询
     */
    @Query("SELECT t FROM Teacher t WHERE t.id IN :ids")
    List<Teacher> findByTeacherIds(List<String> ids);
    
    /**
     * 根据民族查询教师
     */
    List<Teacher> findByEthnicity(String ethnicity);

}

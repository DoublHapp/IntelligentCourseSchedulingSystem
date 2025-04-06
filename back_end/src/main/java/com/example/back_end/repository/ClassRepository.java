package com.example.back_end.repository;

import com.example.back_end.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, String> {
    
    /**
     * 根据院系查找班级
     */
    List<Class> findByFacultyDepartment(String department);
    
    /**
     * 根据专业查找班级
     */
    List<Class> findByMajor(String major);
    
    /**
     * 根据是否毕业查找班级
     */
    List<Class> findByGraduated(String graduated);
    
    /**
     * 根据入学年份查找班级
     */
    List<Class> findByAdmissionYear(String year);
    
    /**
     * 根据校区查找班级
     */
    List<Class> findByCampus(String campus);
    
    /**
     * 查询某专业下的所有班级
     */
    List<Class> findByMajorId(String majorId);
    
    /**
     * 根据班级名称模糊查询
     */
    List<Class> findByClassNameContaining(String className);
    
    /**
     * 根据班级ID查询多个班级
     */
    @Query("SELECT c FROM Class c WHERE c.id IN :ids")
    List<Class> findByClassIds(List<String> ids);
    
    /**
     * 根据年级和专业查询班级
     */
    @Query("SELECT c FROM Class c WHERE c.admissionYear = :year AND c.major = :major")
    List<Class> findByYearAndMajor(String year, String major);
    
    /**
     * 查询某个教学楼的所有班级
     */
    List<Class> findByAssignedClassroomId(String classroomId);
}
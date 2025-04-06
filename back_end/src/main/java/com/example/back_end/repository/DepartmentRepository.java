package com.example.back_end.repository;

import com.example.back_end.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    /**
     * 根据部门名称模糊查询
     */
    List<Department> findByDepartmentNameContaining(String name);
    
   /**
     * 根据部门代码模糊查询（将Long转为字符串）
     */
    @Query("SELECT d FROM Department d WHERE CAST(d.id AS string) LIKE %:code%")
    List<Department> findByIdContaining(String code);
    
    /**
     * 根据部门名称或代码模糊查询
     */
    @Query("SELECT d FROM Department d WHERE d.departmentName LIKE %:keyword% OR CAST(d.id AS string) LIKE %:keyword%")
    List<Department> findByDepartmentNameContainingOrIdContaining(String keyword);
    
   /**
     * 查询所有顶级部门（没有父部门的）
     */
    List<Department> findByParentDepartmentIsNull();
    
     /**
     * 根据父部门ID查询子部门 (修改此方法名以匹配实体类属性名称)
     */
    List<Department> findByParentDepartment(String parentDepartment);
    
    /**
     * 查询是否为课程开设单位的部门
     */
    List<Department> findByIsCourseOfferingDepartmentEquals(String isCourseOfferingDepartment);
    
    /**
     * 查询是否为实体部门
     */
    List<Department> findByIsPhysicalEntityEquals(String isPhysicalEntity);
    
 
    
    /**
     * 根据指定教学楼查询部门
     */
    List<Department> findByDesignatedTeachingBuilding(String teachingBuilding);
}
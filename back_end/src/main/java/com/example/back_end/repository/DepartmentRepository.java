package com.example.back_end.repository;

import com.example.back_end.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

  /**
     * 根据部门代码查询
     */
    Optional<Department> findByDepartmentCode(Long DepartmentCode);
    
    /**
     * 根据部门名称模糊查询
     */
    List<Department> findByDepartmentNameContaining(String name);
    
    /**
     * 根据部门英文名称模糊查询
     */
    List<Department> findByDepartmentEnglishNameContaining(String englishName);
    
    /**
     * 根据部门缩写模糊查询
     */
    List<Department> findByDepartmentAbbreviationContaining(String abbreviation);
    
    /**
     * 根据部门名称或缩写模糊查询
     */
    @Query("SELECT d FROM Department d WHERE d.departmentName LIKE %:keyword% OR d.departmentAbbreviation LIKE %:keyword%")
    List<Department> findByDepartmentNameContainingOrDepartmentAbbreviationContaining(@Param("keyword") String keyword);
    
    /**
     * 查询所有顶级部门（没有父部门的）
     */
    List<Department> findByParentDepartmentIsNull();
    
    /**
     * 根据父部门查询子部门
     */
    List<Department> findByParentDepartment(String parentDepartment);
    
    /**
     * 根据指定教学楼查询部门
     */
    List<Department> findByDesignatedTeachingBuilding(String teachingBuilding);
    
    /**
     * 查询是否为课程开设单位的部门
     */
    List<Department> findByIsCourseOfferingDepartmentEquals(String isCourseOfferingDepartment);
    
    /**
     * 查询是否为课程学习单位的部门
     */
    List<Department> findByIsCourseAttendingDepartmentEquals(String isCourseAttendingDepartment);
    
    /**
     * 查询是否为实体部门
     */
    List<Department> findByIsPhysicalEntityEquals(String isPhysicalEntity);
    
    /**
     * 查询是否为课程研究室的部门
     */
    List<Department> findByIsCourseResearchOfficeEquals(String isCourseResearchOffice);
    
    /**
     * 根据启用状态查询部门
     */
    List<Department> findByIsEnabled(String isEnabled);
    
    /**
     * 根据单位类别查询部门
     */
    List<Department> findByAffiliatedUnitCategory(String category);
    
    /**
     * 根据单位类型查询部门
     */
    List<Department> findByAffiliatedUnitType(String type);
    
    /**
     * 根据行政负责人查询部门
     */
    List<Department> findByAdministrativeHeadContaining(String head);

    /**
 * 查询最大部门代码
 */
  @Query("SELECT MAX(d.departmentCode) FROM Department d")
  Long findMaxDepartmentCode();

}
package com.example.back_end.service;

import com.example.back_end.entity.Department;
import com.example.back_end.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    
    public List<Department> findAll() {
        return departmentRepository.findAll();
    }
    
    public Optional<Department> findByDepartmentCode(Long DepartmentCode) {
        return departmentRepository.findByDepartmentCode(DepartmentCode);
    }
    
    public Department save(Department department) {
        return departmentRepository.save(department);
    }
    
    public void deleteById(Long id) {
        departmentRepository.deleteById(id);
    }
    
    // 根据名称或缩写查找部门
    public List<Department> findByNameOrCodeContaining(String keyword) {
        return departmentRepository.findByDepartmentNameContainingOrDepartmentAbbreviationContaining(keyword);
    }
    
    // 查找顶级部门（没有父部门的）
    public List<Department> findTopLevelDepartments() {
        return departmentRepository.findByParentDepartmentIsNull();
    }
    
    // 通过父部门ID查找子部门
    public List<Department> findByParentId(Long parentId) {
        return departmentRepository.findByParentDepartment(parentId.toString());
    }
    
    // 根据教学楼查找部门
    public List<Department> findByDesignatedTeachingBuilding(String buildingId) {
        return departmentRepository.findByDesignatedTeachingBuilding(buildingId);
    }
    
    // 查找可开设课程的部门
    public List<Department> findCourseOfferingDepartments() {
        return departmentRepository.findByIsCourseOfferingDepartmentEquals("Y");
    }
    
    // 查找可学习课程的部门
    public List<Department> findCourseAttendingDepartments() {
        return departmentRepository.findByIsCourseAttendingDepartmentEquals("Y");
    }
    
    // 查找实体部门
    public List<Department> findPhysicalEntityDepartments() {
        return departmentRepository.findByIsPhysicalEntityEquals("Y");
    }
    
    // 查找课程研究室部门
    public List<Department> findCourseResearchOfficeDepartments() {
        return departmentRepository.findByIsCourseResearchOfficeEquals("Y");
    }
    
    // 根据单位类别查询部门
    public List<Department> findByAffiliatedUnitCategory(String category) {
        return departmentRepository.findByAffiliatedUnitCategory(category);
    }
    
    // 根据单位类型查询部门
    public List<Department> findByAffiliatedUnitType(String type) {
        return departmentRepository.findByAffiliatedUnitType(type);
    }
    
    // 根据启用状态查询部门
    public List<Department> findByIsEnabled(String isEnabled) {
        return departmentRepository.findByIsEnabled(isEnabled);
    }
}
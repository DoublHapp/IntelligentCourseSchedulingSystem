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
    
    public Optional<Department> findById(Long id) {
        return departmentRepository.findById(id);
    }
    
    public Department save(Department department) {
        return departmentRepository.save(department);
    }
    
    public void deleteById(Long id) {
        departmentRepository.deleteById(id);
    }
    
    // 根据名称或代码查找部门
    public List<Department> findByNameOrCodeContaining(String keyword) {
        return departmentRepository.findByDepartmentNameContainingOrIdContaining(keyword);
    }
    
    // 查找顶级部门（没有父部门的）
    public List<Department> findTopLevelDepartments() {
        return departmentRepository.findByParentDepartmentIsNull();
    }
    
   // 通过父部门ID查找子部门 (修改实现以使用正确的仓库方法)
   public List<Department> findByParentId(Long parentId) {
    return departmentRepository.findByParentDepartment(parentId.toString());
}
}
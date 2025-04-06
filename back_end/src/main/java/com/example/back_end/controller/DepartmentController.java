package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.DepartmentDTO;
import com.example.back_end.entity.Department;
import com.example.back_end.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<DepartmentDTO>>> getAllDepartments() {
        try {
            List<Department> departments = departmentService.findAll();
            List<DepartmentDTO> departmentDTOs = departments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取部门列表成功", departmentDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取部门列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/top-level")
    public ResponseEntity<ApiResponseDTO<List<DepartmentDTO>>> getTopLevelDepartments() {
        try {
            List<Department> departments = departmentService.findTopLevelDepartments();
            List<DepartmentDTO> departmentDTOs = departments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取顶级部门列表成功", departmentDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取顶级部门列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/children/{parentId}")
    public ResponseEntity<ApiResponseDTO<List<DepartmentDTO>>> getChildDepartments(@PathVariable Long parentId) {
        try {
            List<Department> departments = departmentService.findByParentId(parentId);
            List<DepartmentDTO> departmentDTOs = departments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取子部门列表成功", departmentDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取子部门列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO<List<DepartmentDTO>>> searchDepartments(@RequestParam String keyword) {
        try {
            List<Department> departments = departmentService.findByNameOrCodeContaining(keyword);
            List<DepartmentDTO> departmentDTOs = departments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("搜索部门成功", departmentDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("搜索部门失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<DepartmentDTO>> getDepartmentById(@PathVariable Long id) {
        try {
            return departmentService.findById(id)
                    .map(department -> ResponseEntity.ok(ApiResponseDTO.success("获取部门成功", convertToDTO(department))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("部门不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取部门失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<DepartmentDTO>> createDepartment(@RequestBody Department department) {
        try {
            Department savedDepartment = departmentService.save(department);
            return ResponseEntity.ok(ApiResponseDTO.success("创建部门成功", convertToDTO(savedDepartment)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建部门失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<DepartmentDTO>> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        try {
            if (!departmentService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("部门不存在"));
            }
            department.setId(id);
            Department updatedDepartment = departmentService.save(department);
            return ResponseEntity.ok(ApiResponseDTO.success("更新部门成功", convertToDTO(updatedDepartment)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新部门失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteDepartment(@PathVariable Long id) {
        try {
            if (!departmentService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("部门不存在"));
            }
            
            // 检查是否有子部门
            List<Department> childDepartments = departmentService.findByParentId(id);
            if (!childDepartments.isEmpty()) {
                return ResponseEntity.ok(ApiResponseDTO.error("该部门下有子部门，无法删除"));
            }
            
            departmentService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除部门成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除部门失败: " + e.getMessage()));
        }
    }
    
    private DepartmentDTO convertToDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getDepartmentName());
        dto.setCode(department.getDepartmentAbbreviation());
        dto.setDescription(department.getRemarks());
        dto.setParentId(department.getParentDepartment() != null ? Long.valueOf(department.getParentDepartment()) : null);
        dto.setParentName(department.getParentDepartment());
        dto.setIsEnabled(department.getIsEnabled());
        dto.setIsCourseOfferingDepartment(department.getIsCourseOfferingDepartment());
        dto.setDesignatedTeachingBuilding(department.getDesignatedTeachingBuilding());
        return dto;
    }
}
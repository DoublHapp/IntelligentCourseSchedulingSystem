package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.TeacherDTO;
import com.example.back_end.entity.Teacher;
import com.example.back_end.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherController {
    
    private final TeacherService teacherService;
    
    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<TeacherDTO>>> getAllTeachers() {
        try {
            List<Teacher> teachers = teacherService.findAll();
            List<TeacherDTO> teacherDTOs = teachers.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取教师列表成功", teacherDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教师列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TeacherDTO>> getTeacherById(@PathVariable String id) {
        try {
            return teacherService.findById(id)
                    .map(teacher -> ResponseEntity.ok(ApiResponseDTO.success("获取教师成功", convertToDTO(teacher))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("教师不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教师失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponseDTO<List<TeacherDTO>>> getTeachersByDepartment(@PathVariable String departmentId) {
        try {
            List<Teacher> teachers = teacherService.findByDepartment(departmentId);
            List<TeacherDTO> teacherDTOs = teachers.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取部门教师列表成功", teacherDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取部门教师列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO<List<TeacherDTO>>> searchTeachers(@RequestParam String keyword) {
        try {
            List<Teacher> teachers = teacherService.findByName(keyword);
            List<TeacherDTO> teacherDTOs = teachers.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("搜索教师成功", teacherDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("搜索教师失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<TeacherDTO>> createTeacher(@RequestBody Teacher teacher) {
        try {
            Teacher savedTeacher = teacherService.save(teacher);
            return ResponseEntity.ok(ApiResponseDTO.success("创建教师成功", convertToDTO(savedTeacher)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建教师失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TeacherDTO>> updateTeacher(@PathVariable String id, @RequestBody Teacher teacher) {
        try {
            if (!teacherService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教师不存在"));
            }
            teacher.setId(id);
            Teacher updatedTeacher = teacherService.save(teacher);
            return ResponseEntity.ok(ApiResponseDTO.success("更新教师成功", convertToDTO(updatedTeacher)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新教师失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteTeacher(@PathVariable String id) {
        try {
            if (!teacherService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教师不存在"));
            }
            teacherService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除教师成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除教师失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/available-time")
    public ResponseEntity<ApiResponseDTO<List<String>>> getTeacherAvailableTime(
            @PathVariable String id, 
            @RequestParam String semester) {
        try {
            List<String> availableTimes = teacherService.getTeacherAvailableTime(id, semester);
            return ResponseEntity.ok(ApiResponseDTO.success("获取教师可用时间成功", availableTimes));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教师可用时间失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/current-courses")
    public ResponseEntity<ApiResponseDTO<List<String>>> getTeacherCurrentCourses(
            @PathVariable String id, 
            @RequestParam String semester) {
        try {
            List<String> courses = teacherService.getTeacherCurrentCourses(id, semester);
            return ResponseEntity.ok(ApiResponseDTO.success("获取教师当前课程成功", courses));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教师当前课程失败: " + e.getMessage()));
        }
    }
    
    private TeacherDTO convertToDTO(Teacher teacher) {
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setName(teacher.getName());
        dto.setGender(teacher.getGender());
        dto.setEnglishName(teacher.getEnglishName());
        dto.setEthnicity(teacher.getEthnicity());
        dto.setJobTitle(teacher.getJobTitle());
        dto.setDepartment(teacher.getDepartment());
        dto.setIsExternalHire(teacher.getIsExternalHire());
        dto.setStaffCategory(teacher.getStaffCategory());
        
        // 假设专业方向是以逗号分隔的字符串
        if (teacher.getStaffCategory() != null && !teacher.getStaffCategory().isEmpty()) {
            dto.setSpecialization(Arrays.asList(teacher.getStaffCategory().split(",")));
        }
        
        return dto;
    }
}
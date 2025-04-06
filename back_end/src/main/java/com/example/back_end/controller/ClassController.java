package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.ClassDTO;
import com.example.back_end.entity.Class;
import com.example.back_end.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassController {
    
    private final ClassService classService;
    
    
    public ClassController(ClassService classService) {
        this.classService = classService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getAllClasses() {
        try {
            List<Class> classes = classService.findAll();
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取班级列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ClassDTO>> getClassById(@PathVariable String id) {
        try {
            return classService.findById(id)
                    .map(clazz -> ResponseEntity.ok(ApiResponseDTO.success("获取班级成功", convertToDTO(clazz))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("班级不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取班级失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getClassesByDepartment(@PathVariable String department) {
        try {
            List<Class> classes = classService.findByFacultyDepartment(department);
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取院系班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取院系班级列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/major/{major}")
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getClassesByMajor(@PathVariable String major) {
        try {
            List<Class> classes = classService.findByMajor(major);
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取专业班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取专业班级列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/graduated/{graduated}")
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getClassesByGraduated(@PathVariable String graduated) {
        try {
            List<Class> classes = classService.findByGraduated(graduated);
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取毕业状态班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取毕业状态班级列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admission-year/{year}")
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getClassesByAdmissionYear(@PathVariable String year) {
        try {
            List<Class> classes = classService.findByAdmissionYear(year);
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取入学年份班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取入学年份班级列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/campus/{campus}")
    public ResponseEntity<ApiResponseDTO<List<ClassDTO>>> getClassesByCampus(@PathVariable String campus) {
        try {
            List<Class> classes = classService.findByCampus(campus);
            List<ClassDTO> classDTOs = classes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取校区班级列表成功", classDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取校区班级列表失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<ClassDTO>> createClass(@RequestBody Class clazz) {
        try {
            Class savedClass = classService.save(clazz);
            return ResponseEntity.ok(ApiResponseDTO.success("创建班级成功", convertToDTO(savedClass)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建班级失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ClassDTO>> updateClass(@PathVariable String id, @RequestBody Class clazz) {
        try {
            if (!classService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("班级不存在"));
            }
            clazz.setClassId(id);
            Class updatedClass = classService.save(clazz);
            return ResponseEntity.ok(ApiResponseDTO.success("更新班级成功", convertToDTO(updatedClass)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新班级失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteClass(@PathVariable String id) {
        try {
            if (!classService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("班级不存在"));
            }
            classService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除班级成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除班级失败: " + e.getMessage()));
        }
    }
    
    private ClassDTO convertToDTO(Class clazz) {
        ClassDTO dto = new ClassDTO();
        dto.setId(clazz.getClassId());
        dto.setName(clazz.getClassName());
        dto.setSchoolSystem(clazz.getSchoolSystem());
        dto.setEducationLevel(clazz.getEducationLevel());
        dto.setType(clazz.getClassType());
        dto.setCounselor(clazz.getCounselor());
        dto.setHeadTeacher(clazz.getHeadTeacher());
        dto.setClassMonitor(clazz.getClassMonitor());
        dto.setClassAssistant(clazz.getClassAssistant());
        dto.setExpectedGraduationYear(clazz.getExpectedGraduationYear());
        dto.setGraduated(clazz.getGraduated());
        dto.setClassSize(clazz.getClassSize());
        dto.setMaximumClassSize(clazz.getMaximumClassSize());
        dto.setAdmissionYear(clazz.getAdmissionYear());
        dto.setFacultyDepartment(clazz.getFacultyDepartment());
        dto.setMajorId(clazz.getMajorId());
        dto.setMajor(clazz.getMajor());
        dto.setMajorDirection(clazz.getMajorDirection());
        dto.setCampus(clazz.getCampus());
        dto.setAssignedClassroomId(clazz.getAssignedClassroomId());
        dto.setAssignedClassroom(clazz.getAssignedClassroom());
        return dto;
    }
}
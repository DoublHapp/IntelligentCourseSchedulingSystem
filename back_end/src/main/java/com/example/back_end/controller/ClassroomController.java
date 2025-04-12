package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.ClassroomDTO;
import com.example.back_end.entity.Classroom;
import com.example.back_end.service.ClassroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassroomController {
    
    private final ClassroomService classroomService;
    

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getAllClassrooms() {
        try {
            List<Classroom> classrooms = classroomService.findAll();
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教室列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ClassroomDTO>> getClassroomById(@PathVariable String id) {
        try {
            return classroomService.findById(id)
                    .map(classroom -> ResponseEntity.ok(ApiResponseDTO.success("获取教室成功", convertToDTO(classroom))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("教室不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教室失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/teachingBuilding/{teachingBuilding}")
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getClassroomsByTeachingBuilding(@PathVariable String teachingBuilding) {
        try {
            List<Classroom> classrooms = classroomService.findByTeachingBuilding(teachingBuilding);
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取教学楼教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教学楼教室列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/campus/{campus}")
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getClassroomsByCampus(@PathVariable String campus) {
        try {
            List<Classroom> classrooms = classroomService.findByCampus(campus);
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取校区教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取校区教室列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getClassroomsByType(@PathVariable String type) {
        try {
            List<Classroom> classrooms = classroomService.findByClassroomType(type);
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定类型教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定类型教室列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/available")
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getAvailableClassrooms() {
        try {
            List<Classroom> classrooms = classroomService.findAvailableClassrooms();
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取可用教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取可用教室列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/capacity/{capacity}")
    public ResponseEntity<ApiResponseDTO<List<ClassroomDTO>>> getClassroomsByCapacity(@PathVariable Integer capacity) {
        try {
            List<Classroom> classrooms = classroomService.findByCapacityGreaterThanEqual(capacity);
            List<ClassroomDTO> classroomDTOs = classrooms.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定容量教室列表成功", classroomDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定容量教室列表失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<ClassroomDTO>> createClassroom(@RequestBody Classroom classroom) {
        try {
            Classroom savedClassroom = classroomService.save(classroom);
            return ResponseEntity.ok(ApiResponseDTO.success("创建教室成功", convertToDTO(savedClassroom)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建教室失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ClassroomDTO>> updateClassroom(@PathVariable String id, @RequestBody Classroom classroom) {
        try {
            if (!classroomService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教室不存在"));
            }
            classroom.setClassroomId(id);
            Classroom updatedClassroom = classroomService.save(classroom);
            return ResponseEntity.ok(ApiResponseDTO.success("更新教室成功", convertToDTO(updatedClassroom)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新教室失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteClassroom(@PathVariable String id) {
        try {
            if (!classroomService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教室不存在"));
            }
            classroomService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除教室成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除教室失败: " + e.getMessage()));
        }
    }
    
    private ClassroomDTO convertToDTO(Classroom classroom) {
        ClassroomDTO dto = new ClassroomDTO();
        dto.setClassroomId(classroom.getClassroomId());
        dto.setClassroomName(classroom.getClassroomName());
        dto.setCampus(classroom.getCampus());
        dto.setTeachingBuilding(classroom.getTeachingBuilding());
        dto.setFloor(classroom.getFloor());
        dto.setClassroomLabel(classroom.getClassroomLabel());
        dto.setClassroomType(classroom.getClassroomType());
        dto.setExamSeatingCapacity(classroom.getExamSeatingCapacity());
        dto.setMaximumClassSeatingCapacity(classroom.getMaximumClassSeatingCapacity());
        dto.setIsHasAirConditioning(classroom.getIsHasAirConditioning());
        dto.setIsEnabled(classroom.getIsEnabled());
        dto.setClassroomDescription(classroom.getClassroomDescription());
        dto.setManagementDepartment(classroom.getManagementDepartment());
        dto.setWeeklyScheduleHours(classroom.getWeeklyScheduleHours());
        dto.setClassroomArea(classroom.getClassroomArea());
        dto.setDeskChairType(classroom.getDeskChairType());
        return dto;
    }
}
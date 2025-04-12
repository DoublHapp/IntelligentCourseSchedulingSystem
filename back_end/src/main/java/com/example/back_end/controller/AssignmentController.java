package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.AssignmentDTO;
import com.example.back_end.entity.Assignment;
import com.example.back_end.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {
    private final AssignmentService assignmentService;
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }
    //生成排课
    @GetMapping("/generate")
    public ResponseEntity<String> generateAssignments() {
        try {
            System.out.println("开始排课");
            assignmentService.generateAssignments();
            return ResponseEntity.ok("排课成功");
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("排课失败"+ e.getMessage());
            return ResponseEntity.status(500).body("排课失败: " + e.getMessage());
        }
    }

     // 获取所有排课结果
     @GetMapping("/getAll")
     public ResponseEntity<ApiResponseDTO<List<AssignmentDTO>>> getAllAssignments() {
         try {
             List<Assignment> assignments = assignmentService.findAll();
             List<AssignmentDTO> assignmentDTOs = assignments.stream()
                     .map(this::convertToDTO)
                     .collect(Collectors.toList());
             return ResponseEntity.ok(ApiResponseDTO.success("获取排课结果成功", assignmentDTOs));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取排课结果失败: " + e.getMessage()));
         }
     }
 
     // 根据课程ID获取排课
     @GetMapping("/{courseId}")
     public ResponseEntity<ApiResponseDTO<AssignmentDTO>> getAssignmentById(@PathVariable String courseId) {
         try {
             return assignmentService.findById(courseId)
                     .map(assignment -> ResponseEntity.ok(ApiResponseDTO.success("获取排课结果成功", convertToDTO(assignment))))
                     .orElseGet(() -> ResponseEntity.ok(ApiResponseDTO.error("未找到该排课结果")));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取排课结果失败: " + e.getMessage()));
         }
     }
 
     // 根据教室ID获取排课
     @GetMapping("/classroom/{classroomId}")
     public ResponseEntity<ApiResponseDTO<List<AssignmentDTO>>> getAssignmentsByClassroom(@PathVariable String classroomId) {
         try {
             List<Assignment> assignments = assignmentService.findByClassroomId(classroomId);
             List<AssignmentDTO> assignmentDTOs = assignments.stream()
                     .map(this::convertToDTO)
                     .collect(Collectors.toList());
             return ResponseEntity.ok(ApiResponseDTO.success("获取教室排课结果成功", assignmentDTOs));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取教室排课结果失败: " + e.getMessage()));
         }
     }
 
     // 根据班级ID获取排课
     @GetMapping("/class/{classId}")
     public ResponseEntity<ApiResponseDTO<List<AssignmentDTO>>> getAssignmentsByClass(@PathVariable String classId) {
         try {
             List<Assignment> assignments = assignmentService.findByClassId(classId);
             List<AssignmentDTO> assignmentDTOs = assignments.stream()
                     .map(this::convertToDTO)
                     .collect(Collectors.toList());
             return ResponseEntity.ok(ApiResponseDTO.success("获取班级排课结果成功", assignmentDTOs));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取班级排课结果失败: " + e.getMessage()));
         }
     }
 
     // 根据教师ID获取排课
     @GetMapping("/teacher/{teacherId}")
     public ResponseEntity<ApiResponseDTO<List<AssignmentDTO>>> getAssignmentsByTeacher(@PathVariable String teacherId) {
         try {
             List<Assignment> assignments = assignmentService.findByTeacherId(teacherId);
             List<AssignmentDTO> assignmentDTOs = assignments.stream()
                     .map(this::convertToDTO)
                     .collect(Collectors.toList());
             return ResponseEntity.ok(ApiResponseDTO.success("获取教师排课结果成功", assignmentDTOs));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取教师排课结果失败: " + e.getMessage()));
         }
     }
 
     // 创建或更新排课
     @PostMapping("/create")
     public ResponseEntity<ApiResponseDTO<AssignmentDTO>> createAssignment(@RequestBody AssignmentDTO assignmentDTO) {
         try {
             Assignment assignment = convertToEntity(assignmentDTO);
             Assignment savedAssignment = assignmentService.save(assignment);
             return ResponseEntity.ok(ApiResponseDTO.success("创建排课成功", convertToDTO(savedAssignment)));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("创建排课失败: " + e.getMessage()));
         }
     }
 
     // 更新排课
     @PutMapping("{courseId}")
     public ResponseEntity<ApiResponseDTO<AssignmentDTO>> updateAssignment(
             @PathVariable String courseId,
             @RequestBody AssignmentDTO assignmentDTO) {
         try {
             if (!assignmentService.findById(courseId).isPresent()) {
                 return ResponseEntity.ok(ApiResponseDTO.error("排课不存在"));
             }
             Assignment assignment = convertToEntity(assignmentDTO);
             assignment.setCourseId(courseId); // 确保使用路径中的ID
             Assignment updatedAssignment = assignmentService.save(assignment);
             return ResponseEntity.ok(ApiResponseDTO.success("更新排课成功", convertToDTO(updatedAssignment)));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("更新排课失败: " + e.getMessage()));
         }
     }
 
     // 删除排课
     @DeleteMapping("/{courseId}")
     public ResponseEntity<ApiResponseDTO<Void>> deleteAssignment(@PathVariable String courseId) {
         try {
             if (!assignmentService.findById(courseId).isPresent()) {
                 return ResponseEntity.ok(ApiResponseDTO.error("排课不存在"));
             }
             assignmentService.deleteById(courseId);
             return ResponseEntity.ok(ApiResponseDTO.success("删除排课成功", null));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("删除排课失败: " + e.getMessage()));
         }
     }
 
     // 获取班级列表
     @GetMapping("/classes")
     public ResponseEntity<ApiResponseDTO<List<Object>>> getAllClasses() {
         try {
             List<Object> classes = assignmentService.findAllClasses();
             return ResponseEntity.ok(ApiResponseDTO.success("获取班级列表成功", classes));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取班级列表失败: " + e.getMessage()));
         }
     }
 
     // 获取教师列表
     @GetMapping("/teachers")
     public ResponseEntity<ApiResponseDTO<List<Object>>> getAllTeachers() {
         try {
             List<Object> teachers = assignmentService.findAllTeachers();
             return ResponseEntity.ok(ApiResponseDTO.success("获取教师列表成功", teachers));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取教师列表失败: " + e.getMessage()));
         }
     }
 
     // 获取教室列表
     @GetMapping("/classrooms")
     public ResponseEntity<ApiResponseDTO<List<Object>>> getAllClassrooms() {
         try {
             List<Object> classrooms = assignmentService.findAllClassrooms();
             return ResponseEntity.ok(ApiResponseDTO.success("获取教室列表成功", classrooms));
         } catch (Exception e) {
             return ResponseEntity.ok(ApiResponseDTO.error("获取教室列表失败: " + e.getMessage()));
         }
     }
 
     // DTO转换为实体
     private Assignment convertToEntity(AssignmentDTO dto) {
         Assignment entity = new Assignment();
         entity.setCourseId(dto.getCourseId());
         entity.setCourseName(dto.getCourseName());
         entity.setClassRoomId(dto.getClassRoomId());
         entity.setClassRoomName(dto.getClassRoomName());
         entity.setSlot(dto.getSlot());
         return entity;
     }
 
     // 实体转换为DTO
     private AssignmentDTO convertToDTO(Assignment entity) {
         AssignmentDTO dto = new AssignmentDTO();
         dto.setCourseId(entity.getCourseId());
         dto.setCourseName(entity.getCourseName());
         dto.setClassRoomId(entity.getClassRoomId());
         dto.setClassRoomName(entity.getClassRoomName());
         dto.setSlot(entity.getSlot());
         return dto;
     }


}

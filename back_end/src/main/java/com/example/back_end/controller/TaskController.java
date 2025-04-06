package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.TaskDTO;
import com.example.back_end.entity.Task;
import com.example.back_end.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {
    
    private final TaskService taskService;
    
    
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getAllTasks() {
        try {
            List<Task> tasks = taskService.findAll();
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取排课任务列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> getTaskByCourseId(@PathVariable String courseId) {
        try {
            return taskService.findById(courseId)
                    .map(task -> ResponseEntity.ok(ApiResponseDTO.success("获取排课任务成功", convertToDTO(task))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("排课任务不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取排课任务失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/academic-year-term/{term}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByAcademicYearTerm(@PathVariable String term) {
        try {
            List<Task> tasks = taskService.findByAcademicYearTerm(term);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取学期排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取学期排课任务列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/teacher/{instructorName}/term/{term}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByInstructorAndTerm(
            @PathVariable String instructorName, 
            @PathVariable String term) {
        try {
            List<Task> tasks = taskService.findByInstructorNameAndAcademicYearTerm(instructorName, term);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取教师学期排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教师学期排课任务列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/class/{className}/term/{term}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByClassAndTerm(
            @PathVariable String className, 
            @PathVariable String term) {
        try {
            List<Task> tasks = taskService.findByTeachingClassCompositionAndAcademicYearTerm(className, term);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取班级学期排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取班级学期排课任务列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByDepartment(@PathVariable String department) {
        try {
            List<Task> tasks = taskService.findByCourseOfferingDepartment(department);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取院系排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取院系排课任务列表失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<TaskDTO>> createTask(@RequestBody Task task) {
        try {
            // 检查是否已存在相同ID的任务
            if (taskService.findById(task.getCourseId()).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("课程ID已存在，无法创建"));
            }
            Task savedTask = taskService.save(task);
            return ResponseEntity.ok(ApiResponseDTO.success("创建排课任务成功", convertToDTO(savedTask)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建排课任务失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponseDTO<TaskDTO>> updateTask(@PathVariable String courseId, @RequestBody Task task) {
        try {
            if (!taskService.findById(courseId).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("排课任务不存在"));
            }
            // 确保使用URL中的courseId作为主键
            task.setCourseId(courseId);
            Task updatedTask = taskService.save(task);
            return ResponseEntity.ok(ApiResponseDTO.success("更新排课任务成功", convertToDTO(updatedTask)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新排课任务失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteTask(@PathVariable String courseId) {
        try {
            if (!taskService.findById(courseId).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("排课任务不存在"));
            }
            taskService.deleteById(courseId);
            return ResponseEntity.ok(ApiResponseDTO.success("删除排课任务成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除排课任务失败: " + e.getMessage()));
        }
    }
    
    // 查询特定课时类型的排课任务
    @GetMapping("/hour-type/{hourType}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByHourType(@PathVariable String hourType) {
        try {
            List<Task> tasks = taskService.findByHourType(hourType);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定课时类型排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定课时类型排课任务列表失败: " + e.getMessage()));
        }
    }
    
    // 查询特定课程性质的排课任务
    @GetMapping("/nature/{courseNature}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByCourseNature(@PathVariable String courseNature) {
        try {
            List<Task> tasks = taskService.findByCourseNature(courseNature);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定课程性质排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定课程性质排课任务列表失败: " + e.getMessage()));
        }
    }
    
    // 查询特定校区的排课任务
    @GetMapping("/campus/{campus}")
    public ResponseEntity<ApiResponseDTO<List<TaskDTO>>> getTasksByCampus(@PathVariable String campus) {
        try {
            List<Task> tasks = taskService.findByCampusOfCourseOffering(campus);
            List<TaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定校区排课任务列表成功", taskDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定校区排课任务列表失败: " + e.getMessage()));
        }
    }
    
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getCourseId()); // 使用courseId作为DTO中的id
        dto.setAcademicYearTerm(task.getAcademicYearTerm());
        dto.setCourseId(task.getCourseId());
        dto.setCourseName(task.getCourseName());
        dto.setTeacherEmployeeId(task.getTeacherEmployeeId());
        dto.setInstructorName(task.getInstructorName());
        dto.setTeachingClassComposition(task.getTeachingClassComposition());
        dto.setTeachingClassId(task.getTeachingClassId());
        dto.setCourseCredits(task.getCourseCredits());
        dto.setTeachingClassName(task.getTeachingClassName());
        dto.setHourType(task.getHourType());
        dto.setScheduledHours(task.getScheduledHours());
        dto.setArrangedHours(task.getArrangedHours());
        dto.setTotalHours(task.getTotalHours());
        dto.setTeachingClassSize(task.getTeachingClassSize());
        dto.setSchedulePriority(task.getSchedulePriority());
        dto.setCourseNature(task.getCourseNature());
        dto.setCampusOfCourseOffering(task.getCampusOfCourseOffering());
        dto.setIsExternalHire(task.getIsExternalHire());
        dto.setCourseOfferingDepartment(task.getCourseOfferingDepartment());
        dto.setCourseWeeklyHours(task.getCourseWeeklyHours());
        dto.setConsecutiveClassSlots(task.getConsecutiveClassSlots());
        dto.setDesignatedClassroomType(task.getDesignatedClassroomType());
        dto.setDesignatedClassroom(task.getDesignatedClassroom());
        dto.setDesignatedTeachingBuilding(task.getDesignatedTeachingBuilding());
        dto.setDesignatedTime(task.getDesignatedTime());
        // 添加排课状态字段，假设默认为未排课
        dto.setStatus("未排课");
        return dto;
    }
}
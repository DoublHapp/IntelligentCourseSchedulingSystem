package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.CourseDTO;
import com.example.back_end.entity.Course;
import com.example.back_end.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.back_end.repository.CourseRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {
    
    private final CourseService courseService;
    private final CourseRepository courseRepository;
    
    public CourseController(CourseService courseService, CourseRepository courseRepository) {
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CourseDTO>>> getAllCourses() {
        try {
            List<Course> courses = courseService.findAll();
            List<CourseDTO> courseDTOs = courses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取课程列表成功", courseDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取课程列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<CourseDTO>> getCourseById(@PathVariable String id) {
        try {
            return courseService.findById(id)
                    .map(course -> ResponseEntity.ok(ApiResponseDTO.success("获取课程成功", convertToDTO(course))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("课程不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取课程失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<ApiResponseDTO<List<CourseDTO>>> getCoursesByDepartment(@PathVariable String departmentName) {
        try {
            List<Course> courses = courseService.findByCourseOfferingDepartment(departmentName);
            List<CourseDTO> courseDTOs = courses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取部门课程列表成功", courseDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取部门课程列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO<List<CourseDTO>>> searchCourses(@RequestParam String keyword) {
        try {
            List<Course> courses = courseService.findByNameOrCodeContaining(keyword);
            List<CourseDTO> courseDTOs = courses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("搜索课程成功", courseDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("搜索课程失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/prerequisites")
    public ResponseEntity<ApiResponseDTO<List<CourseDTO>>> getCoursePrerequisites(@PathVariable String id) {
        try {
            List<Course> prerequisites = courseService.findPrerequisitesForCourse(id);
            List<CourseDTO> prerequisiteDTOs = prerequisites.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取先修课程成功", prerequisiteDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取先修课程失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<CourseDTO>> createCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.save(course);
            return ResponseEntity.ok(ApiResponseDTO.success("创建课程成功", convertToDTO(savedCourse)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建课程失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<CourseDTO>> updateCourse(@PathVariable String id, @RequestBody Course course) {
        try {
            if (!courseService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("课程不存在"));
            }
            course.setCourseId(id);
            Course updatedCourse = courseService.save(course);
            return ResponseEntity.ok(ApiResponseDTO.success("更新课程成功", convertToDTO(updatedCourse)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新课程失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteCourse(@PathVariable String id) {
        try {
            if (!courseService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("课程不存在"));
            }
            courseService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除课程成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除课程失败: " + e.getMessage()));
        }
    }
    
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
    dto.setCourseId(course.getCourseId());
    dto.setCourseName(course.getCourseName());
    dto.setCourseEnglishName(course.getCourseEnglishName());
    dto.setCourseCategory(course.getCourseCategory());
    dto.setCourseAttribute(course.getCourseAttribute());
    dto.setCourseType(course.getCourseType());
    dto.setCourseNature(course.getCourseNature());
    dto.setCourseOfferingDepartment(course.getCourseOfferingDepartment());
    dto.setIsEnabled(course.getIsEnabled());
    dto.setTotalHours(course.getTotalHours());
    dto.setTheoreticalHours(course.getTheoreticalHours());
    dto.setExperimentalHours(course.getExperimentalHours());
    dto.setPracticalHours(course.getPracticalHours());
    dto.setLabHours(course.getLabHours());
    dto.setCredits(course.getCredits());
    dto.setWeeklyHours(course.getWeeklyHours());
    dto.setIsPurePracticalSession(course.getIsPurePracticalSession());
    
    // 这里需要查询先修课程信息，可能需要额外的代码来处理
    // 假设前端只需要先修课程ID列表
    List<Course> prerequisites = courseRepository.findPrerequisitesForCourse(course.getCourseId());
    List<String> prerequisiteIds = prerequisites.stream()
            .map(Course::getCourseId)
            .collect(Collectors.toList());
    dto.setPrerequisites(prerequisiteIds);
        return dto;
    }
}
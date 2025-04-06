package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.PersonalizedRequestDTO;
import com.example.back_end.entity.PersonalizedRequest;
import com.example.back_end.service.PersonalizedRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class PersonalizedRequestController {
    
    private final PersonalizedRequestService requestService;
    
    public PersonalizedRequestController(PersonalizedRequestService requestService) {
        this.requestService = requestService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<PersonalizedRequestDTO>>> getAllRequests() {
        try {
            List<PersonalizedRequest> requests = requestService.findAll();
            List<PersonalizedRequestDTO> requestDTOs = requests.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取申请列表成功", requestDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取申请列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponseDTO<List<PersonalizedRequestDTO>>> getRequestsByUser(@PathVariable Long userId) {
        try {
            List<PersonalizedRequest> requests = requestService.findByUserId(userId);
            List<PersonalizedRequestDTO> requestDTOs = requests.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取用户申请列表成功", requestDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取用户申请列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/pending")
    public ResponseEntity<ApiResponseDTO<List<PersonalizedRequestDTO>>> getPendingRequests() {
        try {
            List<PersonalizedRequest> requests = requestService.findByStatus("pending");
            List<PersonalizedRequestDTO> requestDTOs = requests.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取待处理申请列表成功", requestDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取待处理申请列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> getRequestById(@PathVariable Long id) {
        try {
            return requestService.findById(id)
                    .map(request -> ResponseEntity.ok(ApiResponseDTO.success("获取申请成功", convertToDTO(request))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("申请不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取申请失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> createRequest(@RequestBody PersonalizedRequest request) {
        try {
            request.setSubmissionTime(LocalDateTime.now());
            request.setStatus("pending");
            PersonalizedRequest savedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("创建申请成功", convertToDTO(savedRequest)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建申请失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> approveRequest(
            @PathVariable Long id, 
            @RequestParam Long adminId,
            @RequestParam(required = false) String responseMessage) {
        try {
            if (!requestService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("申请不存在"));
            }
            
            PersonalizedRequest request = requestService.findById(id).get();
            request.setStatus("approved");
            request.setResponseTime(LocalDateTime.now());
            request.setAdminId(adminId);
            request.setResponseMessage(responseMessage);
            
            PersonalizedRequest updatedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("批准申请成功", convertToDTO(updatedRequest)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("批准申请失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> rejectRequest(
            @PathVariable Long id, 
            @RequestParam Long adminId,
            @RequestParam String responseMessage) {
        try {
            if (!requestService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("申请不存在"));
            }
            
            PersonalizedRequest request = requestService.findById(id).get();
            request.setStatus("rejected");
            request.setResponseTime(LocalDateTime.now());
            request.setAdminId(adminId);
            request.setResponseMessage(responseMessage);
            
            PersonalizedRequest updatedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("拒绝申请成功", convertToDTO(updatedRequest)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("拒绝申请失败: " + e.getMessage()));
        }
    }
    
    private PersonalizedRequestDTO convertToDTO(PersonalizedRequest request) {
        PersonalizedRequestDTO dto = new PersonalizedRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUserId());
        dto.setUsername(request.getUsername());
        dto.setUserIdentity(request.getUserIdentity());
        dto.setRequestType(request.getRequestType());
        dto.setCourseId(request.getCourseId());
        dto.setCourseName(request.getCourseName());
        dto.setOriginalTimeSlot(request.getOriginalTimeSlot());
        dto.setPreferredTimeSlot(request.getPreferredTimeSlot());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setSubmissionTime(request.getSubmissionTime());
        dto.setResponseTime(request.getResponseTime());
        dto.setResponseMessage(request.getResponseMessage());
        dto.setAdminId(request.getAdminId());
        dto.setAdminName(request.getAdminName());
        return dto;
    }
}
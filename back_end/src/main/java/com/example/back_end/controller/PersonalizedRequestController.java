package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.PersonalizedRequestDTO;
import com.example.back_end.entity.PersonalizedRequest;
import com.example.back_end.service.PersonalizedRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> createRequest(
            @RequestBody PersonalizedRequest request) {
        try {
            PersonalizedRequest savedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("创建申请成功", convertToDTO(savedRequest)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建申请失败: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> updateRequest(
            @PathVariable Long id,
            @RequestBody PersonalizedRequest request) {
        try {
            Optional<PersonalizedRequest> existingRequestOpt = requestService.findById(id);
            if (!existingRequestOpt.isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("申请不存在"));
            }

            // 获取现有请求
            PersonalizedRequest existingRequest = existingRequestOpt.get();

            // 验证用户是否有权限修改
            if (!existingRequest.getUserId().equals(request.getUserId())) {
                return ResponseEntity.ok(ApiResponseDTO.error("无权修改此申请"));
            }

            // 保留原始ID和提交时间
            request.setId(id);

            // 打印请求详情，帮助调试
            System.out.println("修改请求数据: " + request);

            // 保存更新后的请求
            PersonalizedRequest updatedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("修改申请成功", convertToDTO(updatedRequest)));
        } catch (Exception e) {
            e.printStackTrace(); // 打印详细错误信息到控制台
            return ResponseEntity.ok(ApiResponseDTO.error("修改申请失败: " + e.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponseDTO<PersonalizedRequestDTO>> updateRequestWithPost(
            @RequestBody PersonalizedRequest request) {
        try {
            Optional<PersonalizedRequest> existingRequestOpt = requestService.findById(request.getId());
            if (!existingRequestOpt.isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("申请不存在"));
            }

            // 获取现有请求
            PersonalizedRequest existingRequest = existingRequestOpt.get();

            // 验证用户是否有权限修改
            if (!existingRequest.getUserId().equals(request.getUserId())) {
                return ResponseEntity.ok(ApiResponseDTO.error("无权修改此申请"));
            }

            // 打印请求详情，帮助调试
            System.out.println("修改请求数据: " + request);

            // 保存更新后的请求
            PersonalizedRequest updatedRequest = requestService.save(request);
            return ResponseEntity.ok(ApiResponseDTO.success("修改申请成功", convertToDTO(updatedRequest)));
        } catch (Exception e) {
            e.printStackTrace(); // 打印详细错误信息到控制台
            return ResponseEntity.ok(ApiResponseDTO.error("修改申请失败: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteRequest(@PathVariable Long id) {
        try {
            Optional<PersonalizedRequest> existingRequest = requestService.findById(id);
            if (!existingRequest.isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("申请不存在"));
            }

            requestService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("撤销申请成功", null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponseDTO.error("撤销申请失败: " + e.getMessage()));
        }
    }

    private PersonalizedRequestDTO convertToDTO(PersonalizedRequest request) {
        PersonalizedRequestDTO dto = new PersonalizedRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUserId());
        dto.setUsername(request.getUsername());
        dto.setUserIdentity(request.getUserIdentity());
        dto.setTaskId(request.getTaskId());
        dto.setPreferDay(request.getPreferDay());
        dto.setPreferPeriod(request.getPreferPeriod());
        return dto;
    }
}
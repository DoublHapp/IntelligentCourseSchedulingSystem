package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.BuildingDTO;
import com.example.back_end.entity.Building;
import com.example.back_end.service.BuildingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buildings")
@CrossOrigin(origins = "http://localhost:5173")
public class BuildingController {
    
    private final BuildingService buildingService;
    
    
    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<BuildingDTO>>> getAllBuildings() {
        try {
            List<Building> buildings = buildingService.findAll();
            List<BuildingDTO> buildingDTOs = buildings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取教学楼列表成功", buildingDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教学楼列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<BuildingDTO>> getBuildingById(@PathVariable String id) {
        try {
            return buildingService.findById(id)
                    .map(building -> ResponseEntity.ok(ApiResponseDTO.success("获取教学楼成功", convertToDTO(building))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("教学楼不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取教学楼失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/campus/{campus}")
    public ResponseEntity<ApiResponseDTO<List<BuildingDTO>>> getBuildingsByCampus(@PathVariable String campus) {
        try {
            List<Building> buildings = buildingService.findByCampus(campus);
            List<BuildingDTO> buildingDTOs = buildings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取校区教学楼列表成功", buildingDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取校区教学楼列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponseDTO<List<BuildingDTO>>> getBuildingsByStatus(@PathVariable String status) {
        try {
            List<Building> buildings = buildingService.findByStatus(status);
            List<BuildingDTO> buildingDTOs = buildings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取指定状态教学楼列表成功", buildingDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取指定状态教学楼列表失败: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDTO<BuildingDTO>> createBuilding(@RequestBody Building building) {
        try {
            Building savedBuilding = buildingService.save(building);
            return ResponseEntity.ok(ApiResponseDTO.success("创建教学楼成功", convertToDTO(savedBuilding)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("创建教学楼失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<BuildingDTO>> updateBuilding(@PathVariable String id, @RequestBody Building building) {
        try {
            if (!buildingService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教学楼不存在"));
            }
            building.setTeachingBuildingId(id);
            Building updatedBuilding = buildingService.save(building);
            return ResponseEntity.ok(ApiResponseDTO.success("更新教学楼成功", convertToDTO(updatedBuilding)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新教学楼失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteBuilding(@PathVariable String id) {
        try {
            if (!buildingService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("教学楼不存在"));
            }
            buildingService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除教学楼成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除教学楼失败: " + e.getMessage()));
        }
    }
    
    private BuildingDTO convertToDTO(Building building) {
        BuildingDTO dto = new BuildingDTO();
        dto.setId(building.getTeachingBuildingId());
        dto.setName(building.getTeachingBuildingName());
        dto.setCampus(building.getCampusName());
        dto.setAvailabilityStatus(building.getAvailabilityStatus());
        return dto;
    }
}
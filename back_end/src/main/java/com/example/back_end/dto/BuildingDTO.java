package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingDTO {
    private String id;                  // 对应 Building.teachingBuildingId
    private String name;                // 对应 Building.teachingBuildingName
    private String campus;              // 对应 Building.campusName
    private String availabilityStatus;  // 对应 Building.availabilityStatus
}
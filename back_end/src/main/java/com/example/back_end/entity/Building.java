package com.example.back_end.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Entity
@Table(name = "buildings")
@NoArgsConstructor
@AllArgsConstructor
public class Building {
    
    @Id
    @Column(name = "teaching_building_id")
    private String teachingBuildingId;
    
    @Column(name = "teaching_building_name")
    private String teachingBuildingName;
    
    @Column(name = "campus_name")
    private String campusName;
    
    @Column(name = "availability_status")
    private String availabilityStatus;
}
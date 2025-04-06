package com.example.back_end.repository;

import com.example.back_end.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, String> {
    
    /**
     * 根据校区名称查询教学楼
     */
    List<Building> findByCampusName(String campusName);
    
    /**
     * 根据可用状态查询教学楼
     */
    List<Building> findByAvailabilityStatus(String status);
    
    /**
     * 根据名称模糊查询教学楼
     */
    List<Building> findByTeachingBuildingNameContaining(String name);
    
    /**
     * 根据校区名称和可用状态查询教学楼
     */
    List<Building> findByCampusNameAndAvailabilityStatus(String campus, String status);
}
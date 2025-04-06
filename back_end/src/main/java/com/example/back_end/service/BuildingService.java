package com.example.back_end.service;

import com.example.back_end.entity.Building;
import com.example.back_end.repository.BuildingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BuildingService {
    
    private final BuildingRepository buildingRepository;
    
   
    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }
    
    public List<Building> findAll() {
        return buildingRepository.findAll();
    }
    
    public Optional<Building> findById(String id) {
        return buildingRepository.findById(id);
    }
    
    public List<Building> findByCampus(String campus) {
        return buildingRepository.findByCampusName(campus);
    }
    
    public List<Building> findByStatus(String status) {
        return buildingRepository.findByAvailabilityStatus(status);
    }
    
    public Building save(Building building) {
        return buildingRepository.save(building);
    }
    
    public void deleteById(String id) {
        buildingRepository.deleteById(id);
    }
}
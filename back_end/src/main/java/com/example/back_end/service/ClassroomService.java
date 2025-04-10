package com.example.back_end.service;

import com.example.back_end.entity.Classroom;
import com.example.back_end.repository.ClassroomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClassroomService {
    
    private final ClassroomRepository classroomRepository;
    
    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }
    
    public List<Classroom> findAll() {
        return classroomRepository.findAll();
    }
    
    public Optional<Classroom> findById(String id) {
        return classroomRepository.findById(id);
    }
    
    public List<Classroom> findByName(String name) {
        return classroomRepository.findByClassroomNameContaining(name);
    }
    
    public List<Classroom> findByTeachingBuilding(String buildingId) {
        return classroomRepository.findByTeachingBuilding(buildingId);
    }
    
    public List<Classroom> findByCampus(String campus) {
        return classroomRepository.findByCampus(campus);
    }
    
    public List<Classroom> findByClassroomType(String type) {
        return classroomRepository.findByClassroomType(type);
    }
    
    public List<Classroom> findByFloor(String floor) {
        return classroomRepository.findByFloor(floor);
    }
    
    public List<Classroom> findByTeachingBuildingAndFloor(String teachingBuilding, String floor) {
        return classroomRepository.findByTeachingBuildingAndFloor(teachingBuilding, floor);
    }
    
    public List<Classroom> findByManagementDepartment(String department) {
        return classroomRepository.findByManagementDepartment(department);
    }
    
    public List<Classroom> findByCampusAndClassroomType(String campus, String type) {
        return classroomRepository.findByCampusAndClassroomType(campus, type);
    }
    
    public List<Classroom> findByIds(List<String> ids) {
        return classroomRepository.findByClassroomIds(ids);
    }
    
    public Classroom save(Classroom classroom) {
        return classroomRepository.save(classroom);
    }
    
    public void deleteById(String id) {
        classroomRepository.deleteById(id);
    }
    
    /**
     * 查找可用的教室
     */
    public List<Classroom> findAvailableClassrooms() {
        return classroomRepository.findByIsEnabledEquals("Y");
    }
    
    /**
     * 通过容量查找教室(大于等于指定容量)
     */
    public List<Classroom> findByCapacityGreaterThanEqual(Integer capacity) {
        return classroomRepository.findByMaximumClassSeatingCapacityGreaterThanEqual(capacity);
    }
    
    /**
     * 查询特定容量范围内的教室
     */
    public List<Classroom> findByCapacityBetween(Integer minCapacity, Integer maxCapacity) {
        return classroomRepository.findByCapacityBetween(minCapacity, maxCapacity);
    }

    /**
     * 查询带空调的教室
     */
    public List<Classroom> findByHasAirConditioning(String hasAirConditioning) {
        return classroomRepository.findByIsHasAirConditioningEquals(hasAirConditioning);
    }
}
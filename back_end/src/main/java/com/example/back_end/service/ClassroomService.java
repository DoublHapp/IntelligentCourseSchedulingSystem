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
    
    public List<Classroom> findByTeachingBuilding(String buildingId) {
        return classroomRepository.findByTeachingBuilding(buildingId);
    }
    
    
    public List<Classroom> findByCampus(String campus) {
        return classroomRepository.findByCampus(campus);
    }
    
    public List<Classroom> findByClassroomType(String type) {
        return classroomRepository.findByClassroomType(type);
    }
    
    public Classroom save(Classroom classroom) {
        return classroomRepository.save(classroom);
    }
    
    public void deleteById(String id) {
        classroomRepository.deleteById(id);
    }
    
    // 查找可用的教室
    public List<Classroom> findAvailableClassrooms() {
        return classroomRepository.findByIsEnabledEquals("是");
    }
    
    // 通过容量查找教室
    public List<Classroom> findByCapacityGreaterThanEqual(Integer capacity) {
        return classroomRepository.findByMaximumClassSeatingCapacityGreaterThanEqual(capacity);
    }

     /**
     * 查询带空调的教室
     */
    public List<Classroom> findByHasAirConditioning(String hasAirConditioning) {
        // 修改调用方法名以匹配 Repository 中的方法
        return classroomRepository.findByIsHasAirConditioningEquals(hasAirConditioning);
    }
}
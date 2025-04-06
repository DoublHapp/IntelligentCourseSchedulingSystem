package com.example.back_end.repository;

import com.example.back_end.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, String> {
    
  
    
    /**
     * 根据校区查找教室
     */
    List<Classroom> findByCampus(String campus);
    
    /**
     * 根据教室类型查找教室
     */
    List<Classroom> findByClassroomType(String type);
    
    /**
     * 根据可用状态查找教室
     */
    List<Classroom> findByIsEnabledEquals(String status);
    
    /**
     * 根据容量查找教室(>=)
     */
    List<Classroom> findByMaximumClassSeatingCapacityGreaterThanEqual(Integer capacity);
    /**
     * 根据教学楼查找教室
     */
    List<Classroom> findByTeachingBuilding(String teachingBuilding);
    
    /**
     * 根据校区和教室类型查找教室
     */
    List<Classroom> findByCampusAndClassroomType(String campus, String classroomType);
    
    /**
     * 根据教室ID查询多个教室
     */
    @Query("SELECT c FROM Classroom c WHERE c.id IN :ids")
    List<Classroom> findByClassroomIds(List<String> ids);
    
    /**
     * 查询特定容量范围内的教室
     */
    @Query("SELECT c FROM Classroom c WHERE c.maximumClassSeatingCapacity BETWEEN :minCapacity AND :maxCapacity")
    List<Classroom> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);
    
    /**
     * 查询带空调的教室
     */
    List<Classroom> findByIsHasAirConditioningEquals(String isHasAirConditioning);
    
}
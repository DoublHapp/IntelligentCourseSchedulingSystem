package com.example.back_end.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.back_end.entity.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    // 这里可以添加自定义查询方法
    
}

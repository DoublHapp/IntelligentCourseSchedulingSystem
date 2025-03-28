package com.example.back_end.repository;

import com.example.back_end.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // 可以添加自定义查询方法
}
package com.example.back_end.repository;

import com.example.back_end.entity.PersonalizedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalizedRequestRepository extends JpaRepository<PersonalizedRequest, Long> {
    
    List<PersonalizedRequest> findByUserId(Long userId);
    
    List<PersonalizedRequest> findByTaskId(String taskId);
    
    // 新增方法：根据用户ID和任务ID查询申请
    List<PersonalizedRequest> findByUserIdAndTaskId(Long userId, String taskId);
}
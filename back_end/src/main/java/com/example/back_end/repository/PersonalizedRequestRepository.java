package com.example.back_end.repository;

import com.example.back_end.entity.PersonalizedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PersonalizedRequestRepository extends JpaRepository<PersonalizedRequest, Long> {
    
    List<PersonalizedRequest> findByUserId(Long userId);
    
    List<PersonalizedRequest> findByStatus(String status);
    
    List<PersonalizedRequest> findByRequestType(String requestType);
    
    List<PersonalizedRequest> findBySubmissionTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<PersonalizedRequest> findByAdminId(Long adminId);
    
    List<PersonalizedRequest> findByUserIdAndStatus(Long userId, String status);
}
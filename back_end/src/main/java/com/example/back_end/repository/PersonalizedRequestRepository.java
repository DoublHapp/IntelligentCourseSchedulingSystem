package com.example.back_end.repository;

import com.example.back_end.entity.PersonalizedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PersonalizedRequestRepository extends JpaRepository<PersonalizedRequest, Long> {
    
    List<PersonalizedRequest> findByUserId(Long userId);
    
    List<PersonalizedRequest> findByTaskId(String taskId);

    List<PersonalizedRequest> findByPreferDay(String preferDay);

    List<PersonalizedRequest> findByPreferPeriod(String preferPeriod);
}
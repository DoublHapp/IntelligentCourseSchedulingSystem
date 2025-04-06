package com.example.back_end.service;

import com.example.back_end.entity.PersonalizedRequest;
import com.example.back_end.repository.PersonalizedRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PersonalizedRequestService {
    
    private final PersonalizedRequestRepository requestRepository;
    
    
    public PersonalizedRequestService(PersonalizedRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }
    
    public List<PersonalizedRequest> findAll() {
        return requestRepository.findAll();
    }
    
    public Optional<PersonalizedRequest> findById(Long id) {
        return requestRepository.findById(id);
    }
    
    public List<PersonalizedRequest> findByUserId(Long userId) {
        return requestRepository.findByUserId(userId);
    }
    
    public List<PersonalizedRequest> findByStatus(String status) {
        return requestRepository.findByStatus(status);
    }
    
    public List<PersonalizedRequest> findByRequestType(String requestType) {
        return requestRepository.findByRequestType(requestType);
    }
    
    public List<PersonalizedRequest> findBySubmissionTimeBetween(LocalDateTime start, LocalDateTime end) {
        return requestRepository.findBySubmissionTimeBetween(start, end);
    }
    
    public List<PersonalizedRequest> findByAdminId(Long adminId) {
        return requestRepository.findByAdminId(adminId);
    }
    
    public List<PersonalizedRequest> findByUserIdAndStatus(Long userId, String status) {
        return requestRepository.findByUserIdAndStatus(userId, status);
    }
    
    public PersonalizedRequest save(PersonalizedRequest request) {
        return requestRepository.save(request);
    }
    
    public void deleteById(Long id) {
        requestRepository.deleteById(id);
    }
}
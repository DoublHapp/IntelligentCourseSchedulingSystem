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

    public List<PersonalizedRequest> findByTaskId(String taskId) {
        return requestRepository.findByTaskId(taskId);
    }
    
    public PersonalizedRequest save(PersonalizedRequest request) {
        return requestRepository.save(request);
    }
    
    public void deleteById(Long id) {
        requestRepository.deleteById(id);
    }
}
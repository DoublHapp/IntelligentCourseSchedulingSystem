package com.example.back_end.service;

import com.example.back_end.entity.Class;
import com.example.back_end.repository.ClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClassService {
    
    private final ClassRepository classRepository;
    
    
    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }
    
    public List<Class> findAll() {
        return classRepository.findAll();
    }
    
    public Optional<Class> findById(String id) {
        return classRepository.findById(id);
    }
    
    public List<Class> findByFacultyDepartment(String department) {
        return classRepository.findByFacultyDepartment(department);
    }
    
    public List<Class> findByMajor(String major) {
        return classRepository.findByMajor(major);
    }
    
    public List<Class> findByGraduated(String graduated) {
        return classRepository.findByGraduated(graduated);
    }
    
    public List<Class> findByAdmissionYear(String year) {
        return classRepository.findByAdmissionYear(year);
    }
    
    public List<Class> findByCampus(String campus) {
        return classRepository.findByCampus(campus);
    }
    
    public Class save(Class classObj) {
        return classRepository.save(classObj);
    }
    
    public void deleteById(String id) {
        classRepository.deleteById(id);
    }
}
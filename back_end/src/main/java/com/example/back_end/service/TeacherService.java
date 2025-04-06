package com.example.back_end.service;

import com.example.back_end.entity.Teacher;
import com.example.back_end.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {
    
    private final TeacherRepository teacherRepository;
    
    
    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }
    
    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }
    
    public Optional<Teacher> findById(String id) {
        return teacherRepository.findById(id);
    }
    
    public List<Teacher> findByName(String name) {
        return teacherRepository.findByNameContaining(name);
    }
    
    public List<Teacher> findByDepartment(String department) {
        return teacherRepository.findByDepartment(department);
    }
    
    public Teacher save(Teacher teacher) {
        return teacherRepository.save(teacher);
    }
    
    public void deleteById(String id) {
        teacherRepository.deleteById(id);
    }
    
    // 获取教师可用时间
    public List<String> getTeacherAvailableTime(String teacherId, String academicYearSemester) {
        // TODO: 根据教师已有课程安排，计算可用时间
        return new ArrayList<>();
    }
    
    // 获取教师当前教授的课程
    public List<String> getTeacherCurrentCourses(String teacherId, String academicYearSemester) {
        return teacherRepository.findTeacherCurrentCourses(teacherId, academicYearSemester);
    }
}
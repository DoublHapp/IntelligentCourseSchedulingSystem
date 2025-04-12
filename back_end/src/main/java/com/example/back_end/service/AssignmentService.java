package com.example.back_end.service;

import org.springframework.stereotype.Service;
import com.example.back_end.entity.Assignment;
import com.example.back_end.repository.AssignmentRepository;
import com.example.back_end.util.GeneticAlgorithmScheduler;
import com.example.back_end.repository.ClassRepository;
import com.example.back_end.repository.ClassroomRepository;
import com.example.back_end.repository.TeacherRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AssignmentService {
    private GeneticAlgorithmScheduler geneticAlgorithmScheduler;
    private final AssignmentRepository assignmentRepository;
    private final ClassRepository classRepository;
    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;

    public AssignmentService(
        GeneticAlgorithmScheduler geneticAlgorithmScheduler,
        AssignmentRepository assignmentRepository,
        ClassRepository classRepository,
        TeacherRepository teacherRepository,
        ClassroomRepository classroomRepository) {
    this.geneticAlgorithmScheduler = geneticAlgorithmScheduler;
    this.assignmentRepository = assignmentRepository;
    this.classRepository = classRepository;
    this.teacherRepository = teacherRepository;
    this.classroomRepository = classroomRepository;
}

   
    //生成排课
    public void generateAssignments(){
        geneticAlgorithmScheduler.generateSchedule();
    }

     // 获取所有排课结果
     public List<Assignment> findAll() {
        return assignmentRepository.findAll();
    }

    // 通过ID查找排课
    public Optional<Assignment> findById(String courseId) {
        return assignmentRepository.findById(courseId);
    }

    // 通过教室ID查找排课
    public List<Assignment> findByClassroomId(String classroomId) {
        return assignmentRepository.findByClassRoomId(classroomId);
    }

    // 通过课程名称查找排课
    public List<Assignment> findByCourseName(String courseName) {
        return assignmentRepository.findByCourseName(courseName);
    }

    // 通过班级名称查找排课
    public List<Assignment> findByClassId(String classId) {
        // 获取班级名称
        Optional<com.example.back_end.entity.Class> classEntity = classRepository.findById(classId);
        if (classEntity.isPresent()) {
            String className = classEntity.get().getClassName();
            return assignmentRepository.findByClassName(className);
        }
        return new ArrayList<>();
    }

    // 通过教师ID查找排课
    public List<Assignment> findByTeacherId(String teacherId) {
        // 获取教师姓名
        Optional<com.example.back_end.entity.Teacher> teacher = teacherRepository.findById(teacherId);
        if (teacher.isPresent()) {
            String teacherName = teacher.get().getName();
            return assignmentRepository.findByTeacherName(teacherName);
        }
        return new ArrayList<>();
    }

    // 保存或更新排课
    public Assignment save(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    // 删除排课
    public void deleteById(String courseId) {
        assignmentRepository.deleteById(courseId);
    }

    // 获取所有班级列表
    public List<Object> findAllClasses() {
        return classRepository.findAll().stream()
                .map(clazz -> Map.of(
                    "id", clazz.getClassId(),
                    "name", clazz.getClassName()
                ))
                .collect(java.util.stream.Collectors.toList());
    }

    // 获取所有教师列表
    public List<Object> findAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(teacher -> Map.of(
                    "id", teacher.getId(),
                    "name", teacher.getName()
                ))
                .collect(java.util.stream.Collectors.toList());
    }

    // 获取所有教室列表
    public List<Object> findAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(classroom -> Map.of(
                    "id", classroom.getClassroomId(),
                    "name", classroom.getClassroomName()
                ))
                .collect(java.util.stream.Collectors.toList());
    }
}
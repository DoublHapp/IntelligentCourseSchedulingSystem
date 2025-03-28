package com.example.back_end.service;

import com.example.back_end.dto.LoginRequest;
import com.example.back_end.dto.LoginResponse;
import com.example.back_end.dto.UserDTO;
import com.example.back_end.entity.User;
import com.example.back_end.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByUsernameAndPasswordAndUserIdentity(
                loginRequest.getUsername(), 
                loginRequest.getPassword(), 
                loginRequest.getUserIdentity()
        );
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserDTO userDTO = new UserDTO();
            userDTO.setId(user.getId());
            userDTO.setUsername(user.getUsername());
            userDTO.setUserIdentity(user.getUserIdentity());
            
            return LoginResponse.success(userDTO);
        } else {
            return LoginResponse.error("用户名或密码错误，或者选择的用户身份不匹配");
        }
    }
    
    public void initDefaultUsers() {
        // 如果没有任何用户，创建默认用户
        if (userRepository.count() == 0) {
            // 创建管理员用户
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("password");
            admin.setUserIdentity("administrator");
            userRepository.save(admin);
            
            // 创建教师用户
            User teacher = new User();
            teacher.setUsername("teacher");
            teacher.setPassword("password");
            teacher.setUserIdentity("teacher");
            userRepository.save(teacher);
            
            // 创建学生用户
            User student = new User();
            student.setUsername("student");
            student.setPassword("password");
            student.setUserIdentity("student");
            userRepository.save(student);
        }
    }

}

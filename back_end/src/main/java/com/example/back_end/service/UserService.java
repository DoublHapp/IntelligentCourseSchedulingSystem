package com.example.back_end.service;

import com.example.back_end.entity.User;
import com.example.back_end.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User save(User user) {
          // 如果密码不为空且不是已经加密的格式，则进行加密
    if (user.getPassword() != null && !user.getPassword().isEmpty() && !user.getPassword().startsWith("$2a$")) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }
    
    // 如果是新用户（没有ID）且没有设置创建时间，则设置创建时间
    if (user.getId() == null && user.getCreatedAt() == null) {
        user.setCreatedAt(LocalDateTime.now());
    }
    
    return userRepository.save(user);
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
    
    // 初始化默认用户
    public void initDefaultUsers() {
           Optional<User> existingAdmin = userRepository.findByUsername("admin");
        
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setUserIdentity("administrator");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("已创建默认管理员用户: admin/password");
        } else {
            // 检查现有管理员密码是否为BCrypt格式，如果不是则更新
            User admin = existingAdmin.get();
            if (!admin.getPassword().startsWith("$2a$")) {
                admin.setPassword(passwordEncoder.encode("password"));
                userRepository.save(admin);
                System.out.println("已更新管理员密码为BCrypt格式");
            }
        }
    }
    
    // 用户认证
    public boolean authenticate(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }
}
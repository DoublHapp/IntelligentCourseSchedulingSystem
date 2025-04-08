package com.example.back_end;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.example.back_end.repository.UserRepository;
import com.example.back_end.service.UserService;

import java.util.Optional; // 修改为java.util.Optional
import com.example.back_end.entity.User; // 添加User实体类的导入

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;


@SpringBootApplication
public class BackEndApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackEndApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 初始化默认用户
            userService.initDefaultUsers();
            
            // 打印出管理员用户信息，用于调试
            Optional<User> adminUser = userRepository.findByUsername("admin");
            if (adminUser.isPresent()) {
                User admin = adminUser.get();
                System.out.println("管理员用户信息：");
                System.out.println("用户名: " + admin.getUsername());
                System.out.println("用户身份: " + admin.getUserIdentity());
                System.out.println("密码是否匹配 'password': " + 
                    passwordEncoder.matches("password", admin.getPassword()));
            } else {
                System.out.println("未找到管理员用户");
            }
        };
    }

    
}

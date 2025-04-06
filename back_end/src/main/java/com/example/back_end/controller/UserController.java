package com.example.back_end.controller;

import com.example.back_end.dto.ApiResponseDTO;
import com.example.back_end.dto.LoginRequestDTO;
import com.example.back_end.dto.LoginResponseDTO;
import com.example.back_end.dto.UserDTO;
import com.example.back_end.entity.User;
import com.example.back_end.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // 允许前端访问



public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }
    
    @PostMapping("/login")
public ResponseEntity<ApiResponseDTO<LoginResponseDTO>> login(@RequestBody LoginRequestDTO loginRequest) {
    try {
        Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponseDTO.error("用户名不存在"));
        }
        
        User user = userOpt.get();
        boolean authenticated = false;
        
        // 特殊处理：检查密码是否是BCrypt格式
        if (user.getPassword().startsWith("$2a$")) {
            authenticated = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        } else {
            // 如果不是BCrypt格式，直接比较（临时处理）
            authenticated = loginRequest.getPassword().equals(user.getPassword());
            // 立即更新为BCrypt格式
            if (authenticated) {
                user.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
                userService.save(user);
                System.out.println("用户 " + user.getUsername() + " 的密码已更新为BCrypt格式");
            }
        }
        
        // 检查用户角色是否匹配
        boolean roleMatches = loginRequest.getUserIdentity().equalsIgnoreCase(user.getUserIdentity());
        
        if (authenticated && roleMatches) {
            LoginResponseDTO response = LoginResponseDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .userIdentity(user.getUserIdentity())
                    .token("mock-jwt-token") // 实际系统中应生成JWT Token
                    .success(true)
                    .message("登录成功")
                    .build();
            return ResponseEntity.ok(ApiResponseDTO.success("登录成功", response));
        } else if (authenticated) {
            return ResponseEntity.ok(ApiResponseDTO.error("用户角色不匹配"));
        } else {
            return ResponseEntity.ok(ApiResponseDTO.error("密码不正确"));
        }
    } catch (Exception e) {
        e.printStackTrace(); // 调试用
        return ResponseEntity.ok(ApiResponseDTO.error("登录失败: " + e.getMessage()));
    }
}
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponseDTO<UserDTO>> register(@RequestBody User user) {
        try {
            if (userService.findByUsername(user.getUsername()).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("用户名已存在"));
            }
            User savedUser = userService.save(user);
            UserDTO userDTO = convertToDTO(savedUser);
            return ResponseEntity.ok(ApiResponseDTO.success("注册成功", userDTO));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("注册失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponseDTO<List<UserDTO>>> getAllUsers() {
        try {
            List<User> users = userService.findAll();
            List<UserDTO> userDTOs = users.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponseDTO.success("获取用户列表成功", userDTOs));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取用户列表失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponseDTO<UserDTO>> getUserById(@PathVariable Long id) {
        try {
            return userService.findById(id)
                    .map(user -> ResponseEntity.ok(ApiResponseDTO.success("获取用户成功", convertToDTO(user))))
                    .orElse(ResponseEntity.ok(ApiResponseDTO.error("用户不存在")));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("获取用户失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponseDTO<UserDTO>> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            if (!userService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("用户不存在"));
            }
            user.setId(id);
            User updatedUser = userService.save(user);
            return ResponseEntity.ok(ApiResponseDTO.success("更新用户成功", convertToDTO(updatedUser)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("更新用户失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteUser(@PathVariable Long id) {
        try {
            if (!userService.findById(id).isPresent()) {
                return ResponseEntity.ok(ApiResponseDTO.error("用户不存在"));
            }
            userService.deleteById(id);
            return ResponseEntity.ok(ApiResponseDTO.success("删除用户成功", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponseDTO.error("删除用户失败: " + e.getMessage()));
        }
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setUserIdentity(user.getUserIdentity());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
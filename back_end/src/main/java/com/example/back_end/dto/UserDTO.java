package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.example.back_end.entity.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String userIdentity; // 用户身份：学生、教师、管理员
    private User.Role role;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String email;
    private String phone;
    
    // 不包含密码字段，确保安全
}
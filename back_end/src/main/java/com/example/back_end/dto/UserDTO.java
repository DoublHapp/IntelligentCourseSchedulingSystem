package com.example.back_end.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String userIdentity;
    
    // 不包含密码字段，确保安全
}

package com.example.back_end.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String userIdentity;

}

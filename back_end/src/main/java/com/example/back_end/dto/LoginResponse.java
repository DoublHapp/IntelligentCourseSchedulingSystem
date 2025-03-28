package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private UserDTO user;

    public static LoginResponse success(UserDTO user) {
        return new LoginResponse(true, "登录成功", user);
    }
    public static LoginResponse error(String message) {
        return new LoginResponse(false, message, null);
    }

}

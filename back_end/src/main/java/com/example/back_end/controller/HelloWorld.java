package com.example.back_end.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hello")
public class HelloWorld {
    @RequestMapping("/world")
    public String hello() {
        return "Hello, World!";
    }
    
}

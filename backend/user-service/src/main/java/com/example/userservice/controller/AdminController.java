package com.example.userservice.controller;

import com.example.userservice.entity.UserProfile;
import com.example.userservice.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService service;

    public AdminController(UserService service) {
        this.service = service;
    }

    @GetMapping("/users")
    public List<UserProfile> getAllUsers() {
        return service.getAllUsers();
    }
}

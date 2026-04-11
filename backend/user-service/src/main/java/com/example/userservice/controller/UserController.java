package com.example.userservice.controller;

import com.example.userservice.entity.UserProfile;
import com.example.userservice.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public UserProfile getCurrentUser(Authentication auth) {

        Jwt jwt = (Jwt) auth.getPrincipal();
        String userId = jwt.getSubject();

        return service.getOrCreate(userId, jwt);
    }

    @PostMapping("/me")
    public UserProfile updateProfile(
            @RequestBody UserProfile request,
            Authentication auth) {

        String userId = ((Jwt) auth.getPrincipal()).getSubject();

        request.setId(userId);

        return service.createOrUpdate(request);
    }
}

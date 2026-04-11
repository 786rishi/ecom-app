package com.example.userservice.service;

import com.example.userservice.entity.UserProfile;
import com.example.userservice.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public UserProfile getOrCreate(String userId, Jwt jwt) {

        return repository.findById(userId)
                .orElseGet(() -> {

                    UserProfile user = new UserProfile();
                    user.setId(userId);
                    user.setEmail(jwt.getClaim("email"));
                    user.setFirstName(jwt.getClaim("preferred_username"));
                    user.setCreatedAt(LocalDateTime.now());
                    user.setSubscribedForNewletter(jwt.getClaim("isSubscribedForNewletter"));

                    return repository.save(user);
                });
    }

    public UserProfile createOrUpdate(UserProfile user) {
        user.setCreatedAt(LocalDateTime.now());
        return repository.save(user);
    }

    public List<UserProfile> getAllUsers() {
        return repository.findAll();
    }
}

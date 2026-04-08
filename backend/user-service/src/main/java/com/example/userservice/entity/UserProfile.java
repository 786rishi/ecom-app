package com.example.userservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class UserProfile {

    @Id
    private String id; // Keycloak userId

    private String email;
    private String firstName;
    private String lastName;

    private String phone;
    private String address;

    private LocalDateTime createdAt;
    private boolean isSubscribedForNewletter;
}

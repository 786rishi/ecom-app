package com.example.userservice.repository;

import com.example.userservice.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserProfile, String> {
}
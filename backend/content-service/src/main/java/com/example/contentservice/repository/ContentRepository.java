package com.example.contentservice.repository;

import com.example.contentservice.entity.Content;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ContentRepository extends MongoRepository<Content, String> {

    Optional<Content> findBySlug(String slug);

    List<Content> findByTypeAndPublished(String type, Boolean published);

    List<Content> findByPublished(Boolean published);
}

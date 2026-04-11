package com.example.contentservice.service;

import com.example.contentservice.entity.Content;
import com.example.contentservice.repository.ContentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContentService {

    private final ContentRepository repository;

    public ContentService(ContentRepository repository) {
        this.repository = repository;
    }

    public Content create(Content content) {

        content.setCreatedAt(LocalDateTime.now());
        content.setUpdatedAt(LocalDateTime.now());
        content.setPublished(content.getPublished());

        return repository.save(content);
    }

    public Content publish(String id) {

        Content content = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        content.setPublished(true);
        content.setUpdatedAt(LocalDateTime.now());

        return repository.save(content);
    }

    public Content update(String id, Content request) {

        Content content = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        content.setTitle(request.getTitle());
        content.setBody(request.getBody());
        content.setMetaTitle(request.getMetaTitle());
        content.setMetaDescription(request.getMetaDescription());
        content.setUpdatedAt(LocalDateTime.now());
        //content.setPublished(request.getPublished());
        return repository.save(content);
    }

    public Content getBySlug(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }

    public List<Content> getByType(String type) {
        return repository.findByTypeAndPublished(type, true);
    }

    public List<Content> getAllPublished() {
        return repository.findByPublished(true);
    }
}

package com.example.contentservice.controller;

import com.example.contentservice.entity.Content;
import com.example.contentservice.service.ContentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/content")
public class ContentController {

    private final ContentService service;

    public ContentController(ContentService service) {
        this.service = service;
    }

    @PostMapping
    public Content create(@RequestBody Content content) {
        return service.create(content);
    }

    @PutMapping("/{id}")
    public Content update(@PathVariable String id,
                          @RequestBody Content content) {
        return service.update(id, content);
    }

    @PostMapping("/{id}/publish")
    public Content publish(@PathVariable String id) {
        return service.publish(id);
    }

    @GetMapping("/slug/{slug}")
    public Content getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    @GetMapping
    public List<Content> getByType(@RequestParam String type) {
        return service.getByType(type);
    }

    @GetMapping("/published")
    public List<Content> getAllPublished() {
        return service.getAllPublished();
    }
}

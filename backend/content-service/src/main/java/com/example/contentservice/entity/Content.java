package com.example.contentservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "content")
@Data
public class Content {

    @Id
    private String id;

    private String title;
    private String slug; // URL friendly

    private String type;
    // BLOG, PAGE, BANNER, FAQ

    private String body;

    private String author;

    private Boolean published;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // SEO
    private String metaTitle;
    private String metaDescription;

    // Media
    private List<String> imageUrls;
}

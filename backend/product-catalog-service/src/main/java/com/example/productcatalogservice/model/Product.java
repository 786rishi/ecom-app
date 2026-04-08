package com.example.productcatalogservice.model;

import lombok.Data;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "products")
@Data
public class Product {

    @Id
    private String id;

    @TextIndexed
    private String name;

    @TextIndexed
    private String description;

    private String category;
    private Double price;
    private Boolean active;

    private Boolean featured;        // keep (optional but useful)
    private LocalDateTime featureStart;
    private LocalDateTime featureEnd;

    private Integer availableQuantity;
    private Boolean inStock;

    // flexible attributes (VERY IMPORTANT)
    private Map<String, Object> attributes;

    private List<String> images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getters & setters
}
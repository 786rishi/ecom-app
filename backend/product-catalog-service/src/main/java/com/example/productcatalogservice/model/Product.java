package com.example.productcatalogservice.model;

import lombok.Data;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
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
    private Boolean active = true;

    private Boolean featured = false;        // keep (optional but useful)
    private LocalDateTime featureStart = LocalDateTime.now();
    private LocalDateTime featureEnd = LocalDateTime.now();

    private Integer availableQuantity = 0;
    private Boolean inStock = false;

    // flexible attributes (VERY IMPORTANT)
    private Map<String, Object> attributes = new HashMap<>();

    private List<String> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getters & setters
}
package com.example.inventoryservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
public class Product {

    private String id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private Boolean active = true;
    private Boolean featured = false;
    private LocalDateTime featureStart = LocalDateTime.now();
    private LocalDateTime featureEnd = LocalDateTime.now();
    private Integer availableQuantity = 0;
    private Boolean inStock = false;
    private Map<String, Object> attributes = new HashMap<>();
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
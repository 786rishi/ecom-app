package com.example.productcatalogservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
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

    /* To handle featured products */
    private Boolean featured = false;
    private LocalDateTime featureStart = LocalDateTime.now();
    private LocalDateTime featureEnd = LocalDateTime.now();

    private Integer availableQuantity = 0;
    private Boolean inStock = false;

    // flexible attributes
    private Map<String, Object> attributes = new HashMap<>();

    private String image;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
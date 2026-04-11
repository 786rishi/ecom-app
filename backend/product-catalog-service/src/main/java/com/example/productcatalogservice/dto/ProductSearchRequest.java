package com.example.productcatalogservice.dto;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String keyword;

    private Double minPrice;
    private Double maxPrice;

    private Boolean inStock;

    private String brand;
    private String color;

    private Double minRating;

    private String sortBy;   // price, rating
    private String sortOrder; // asc, desc

    private int page = 0;
    private int size = 10;
}

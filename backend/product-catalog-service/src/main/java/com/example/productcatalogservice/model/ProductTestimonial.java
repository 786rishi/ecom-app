package com.example.productcatalogservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_testimonials")
@Data
public class ProductTestimonial {

    @Id
    private String id;

    private String productId;

    private String userName;
    private String userId;

    private String comment;
    private Integer rating;

    private Boolean approved = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}

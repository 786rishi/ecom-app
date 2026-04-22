package com.example.productcatalogservice.repository;

import com.example.productcatalogservice.model.ProductTestimonial;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductTestimonialRepository
        extends MongoRepository<ProductTestimonial, String> {

    List<ProductTestimonial> findByProductIdAndApprovedTrue(String productId);
}

package com.example.inventoryservice.service;

import com.example.inventoryservice.client.ProductClient;
import com.example.inventoryservice.exception.ProductNotFoundException;
import feign.FeignException;
import org.springframework.stereotype.Service;

@Service
public class ProductValidationService {

    private final ProductClient productClient;

    public ProductValidationService(ProductClient productClient) {
        this.productClient = productClient;
    }

    public void validateProduct(String productId) {
        try {
            productClient.getProduct(productId);

        } catch (FeignException.NotFound e) {
            // 🔥 Product not found → 404
            throw new ProductNotFoundException("Product not found with id: " + productId);

        } catch (FeignException e) {
            // 🔥 Product service issue
            throw new RuntimeException("Product service unavailable");
        }
    }
}
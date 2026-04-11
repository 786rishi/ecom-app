package com.example.inventoryservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", url = "http://localhost:8084")
public interface ProductClient {

    @GetMapping("/products/{id}")
    Object getProduct(@PathVariable("id") String id);

    @PutMapping("/products/internal/inventory")
    void updateInventory(
            @RequestParam("productId") String productId,
            @RequestParam("availableQuantity") int availableQuantity);
}
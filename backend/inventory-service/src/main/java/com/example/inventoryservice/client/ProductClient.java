package com.example.inventoryservice.client;

import com.example.inventoryservice.dto.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "product-service", url = "http://localhost:8084")
public interface ProductClient {

    @GetMapping("/products/{id}")
    Object getProduct(@PathVariable("id") String id);

    @PutMapping("/products/internal/inventory")
    void updateInventory(
            @RequestParam("productId") String productId,
            @RequestParam("availableQuantity") int availableQuantity);

    @PostMapping("/products/ids")
    List<Product> getByIds(@RequestBody List<String> productIds);

}
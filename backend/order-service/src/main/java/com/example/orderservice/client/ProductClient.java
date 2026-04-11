package com.example.orderservice.client;

import com.example.orderservice.dto.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "product-service", url = "http://localhost:8084")
public interface ProductClient {

    @GetMapping("/products/{id}")
    Object getProduct(@PathVariable("id") String id);

    @PostMapping("/products/ids")
     List<Product> getByIds(@RequestBody List<String> productIds);

}
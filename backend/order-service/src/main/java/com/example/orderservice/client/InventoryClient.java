package com.example.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service", url = "http://localhost:8085")
public interface InventoryClient {

    @PostMapping("/inventory/reserve")
    void reserve(@RequestParam("productId") String productId, @RequestParam("quantity") int quantity);

    @PostMapping("/inventory/confirm")
    void confirm(@RequestParam("productId") String productId, @RequestParam("quantity") int quantity);

    @PostMapping("/inventory/release")
    void release(@RequestParam("productId") String productId, @RequestParam("quantity") int quantity);

    @PostMapping("/inventory/add")
    void add(@RequestParam("productId") String productId, @RequestParam("quantity") int quantity);

}

package com.example.productcatalogservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-service", url = "${inventory.service.url}")
public interface InventoryClient {


    @PostMapping("/inventory/add")
    public void add(
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity);

}

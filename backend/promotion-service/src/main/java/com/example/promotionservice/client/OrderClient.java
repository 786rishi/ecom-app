package com.example.promotionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;


@FeignClient(name = "order-service", url = "http://localhost:8082")
public interface OrderClient {

    @PutMapping("/cart/update/discount")
    void updateCart(@RequestParam("userId") String userId,
                           @RequestParam("discount") Double discount);

}
package com.example.promotionservice.controller;

import com.example.promotionservice.dto.CartRequest;
import com.example.promotionservice.dto.PromotionResponse;
import com.example.promotionservice.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService service;

    @PostMapping("/apply")
    public ResponseEntity<PromotionResponse> apply(@RequestBody CartRequest request) {
        return ResponseEntity.ok(service.applyPromotions(request));
    }
}
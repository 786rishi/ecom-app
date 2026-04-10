package com.example.promotionservice.controller;

import com.example.promotionservice.entity.Promotion;
import com.example.promotionservice.service.PromotionAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/promotions")
@RequiredArgsConstructor
public class PromotionAdminController {

    private final PromotionAdminService service;

    // CREATE PROMOTION
    @PostMapping
    public ResponseEntity<Promotion> create(@RequestBody Promotion request) {
        return ResponseEntity.ok(service.createPromotion(request));
    }

    // GET ALL PROMOTIONS
    @GetMapping
    public ResponseEntity<List<Promotion>> getAll() {
        return ResponseEntity.ok(service.getAllPromotions());
    }

    // UPDATE PROMOTION
    @PutMapping("/{id}")
    public ResponseEntity<Promotion> update(
            @PathVariable String id,
            @RequestBody Promotion request) {
        return ResponseEntity.ok(service.updatePromotion(id, request));
    }

    // ENABLE / DISABLE
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> toggle(
            @PathVariable("id") String id,
            @RequestParam("active") boolean active) {

        service.togglePromotion(id, active);
        return ResponseEntity.ok("Promotion status updated");
    }
}
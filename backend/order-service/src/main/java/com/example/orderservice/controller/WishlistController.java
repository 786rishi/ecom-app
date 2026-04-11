package com.example.orderservice.controller;

import com.example.orderservice.dto.WishlistResponse;
import com.example.orderservice.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService service;

    @PostMapping("/add")
    public ResponseEntity<String> add(
            @RequestParam("userId") String userId,
            @RequestParam("productId") String productId) {

        service.add(userId, productId);
        return ResponseEntity.ok("Added");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> remove(
            @RequestParam("userId") String userId,
            @RequestParam("productId") String productId) {

        service.remove(userId, productId);
        return ResponseEntity.ok("Removed");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WishlistResponse> get(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(service.getWishlist(userId));
    }
}

package com.example.orderservice.controller;

import com.example.orderservice.entity.cart.Cart;
import com.example.orderservice.entity.cart.CartItem;
import com.example.orderservice.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/cart/add")
    public Cart addToCart(@RequestParam("userId") String userId,
                          @RequestBody CartItem item) {
        return cartService.addItem(userId, item);
    }

    @PutMapping("/cart/update/quantity")
    public Cart updateCart(@RequestParam("userId") String userId,
                          @RequestParam("productId") String productId,@RequestParam("quantity") int quantity) {
        return cartService.updateCartItem(userId, productId, quantity);
    }

    @PutMapping("/cart/update/discount")
    public Cart updateCart(@RequestParam("userId") String userId,
                           @RequestParam("discount") Double discount) {
        return cartService.updateCartDiscount(userId, discount);
    }


    @GetMapping("/cart/{userId}")
    public Cart getCart(@PathVariable("userId") String userId) {
        return cartService.getCart(userId);
    }

    @DeleteMapping("/cart/clear")
    public void clearCart(@RequestParam("userId") String userId) {
        cartService.clearCart(userId);
    }

}

package com.example.orderservice.repository.cart;

import com.example.orderservice.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findFirstByUserId(String userId);
}

package com.example.orderservice.service;

import com.example.orderservice.entity.cart.Cart;
import com.example.orderservice.entity.cart.CartItem;
import com.example.orderservice.repository.cart.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class CartService {

    private final CartRepository repository;

    public CartService(CartRepository repository) {
        this.repository = repository;
    }


    @Transactional("cartTransactionManager")
    public Cart getCart(String userId) {
        return repository.findFirstByUserId(userId).orElse(new Cart());
    }



    @Transactional("cartTransactionManager")
    public Cart addItem(String userId, CartItem item) {

        Cart cart = repository.findFirstByUserId(userId)
                .orElse(new Cart());

        cart.setUserId(userId);

        item.setCart(cart);

        if(cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        cart.getItems().add(item);

        return repository.save(cart);
    }

    @Transactional("cartTransactionManager")
    public void clearCart(String userId) {
        Cart cart = repository.findFirstByUserId(userId).orElseThrow(() -> new RuntimeException("No Cart"));
        repository.deleteById(cart.getId());
        repository.flush();
    }
}

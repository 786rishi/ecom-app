package com.example.orderservice.service;

import com.example.orderservice.entity.cart.Cart;
import com.example.orderservice.entity.cart.CartItem;
import com.example.orderservice.repository.cart.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

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


        if(cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> optionalItem = cart.getItems().stream()
                .filter(_item -> _item.getProductId().equals(item.getProductId()))
                .findFirst();

        if(optionalItem.isPresent()) {
            CartItem cartItem = optionalItem.get();
            cartItem.setQuantity(item.getQuantity() + cartItem.getQuantity());

            cartItem.setCart(cart);
            return repository.save(cart);
        }


        item.setCart(cart);
        if(cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        cart.getItems().add(item);
        return repository.save(cart);
    }

    @Transactional("cartTransactionManager")
    public void clearCart(String userId) {
        Optional<Cart> cart = repository.findFirstByUserId(userId);
        if (cart.isPresent()) {
            repository.deleteById(cart.get().getId());
            repository.flush();
        }
    }

    @Transactional("cartTransactionManager")
    public Cart updateCartItem(String userId, String productId, int quantity) {

        Cart cart = repository.findFirstByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // 🔍 find item inside cart
        Optional<CartItem> optionalItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (!optionalItem.isPresent()) {
            throw new RuntimeException("Item not found in cart");
        }

        CartItem item = optionalItem.get();

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        return repository.save(cart);
    }

    @Transactional("cartTransactionManager")
    public Cart updateCartDiscount(String userId, Double discount) {

        Cart cart = repository.findFirstByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setDiscount(discount);
        return repository.save(cart);
    }
}

package com.example.orderservice.service;

import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.Product;
import com.example.orderservice.dto.WishlistResponse;
import com.example.orderservice.entity.wishlist.Wishlist;
import com.example.orderservice.repository.wishlist.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("wishlistTransactionManager")
public class WishlistService {

    private final WishlistRepository repository;
    private final ProductClient productClient;


    // ➕ Add single product
    public void add(String userId, String productId) {

        if (repository.existsByUserIdAndProductId(userId, productId)) {
            return; // already exists
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUserId(userId);
        wishlist.setProductId(productId);
        wishlist.setCreatedAt(LocalDateTime.now());

        repository.save(wishlist);
    }

    // ❌ Remove
    public void remove(String userId, String productId) {
        repository.deleteByUserIdAndProductId(userId, productId);
    }

    // 📄 Get ALL (Mongo-like response)
    public WishlistResponse getWishlist(String userId) {

        List<Wishlist> items = repository.findByUserId(userId);

        List<String> productIds = items.stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());

    List<Product> products = productClient.getByIds(productIds);

        return WishlistResponse.builder()
                .userId(userId)
                .products(products)
                .build();
    }
}

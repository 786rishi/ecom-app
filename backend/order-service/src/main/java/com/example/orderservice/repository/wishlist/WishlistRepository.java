package com.example.orderservice.repository.wishlist;

import com.example.orderservice.entity.order.Order;
import com.example.orderservice.entity.wishlist.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserId(String userId);

    void deleteByUserIdAndProductId(String userId, String productId);

    boolean existsByUserIdAndProductId(String userId, String productId);
}

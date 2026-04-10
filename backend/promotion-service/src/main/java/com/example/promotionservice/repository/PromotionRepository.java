package com.example.promotionservice.repository;

import com.example.promotionservice.entity.Promotion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends MongoRepository<Promotion, String> {

    List<Promotion> findByActiveTrue();

    Optional<Promotion> findByCouponCodeAndActiveTrue(String couponCode);
}

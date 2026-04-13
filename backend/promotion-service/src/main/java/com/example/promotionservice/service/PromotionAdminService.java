package com.example.promotionservice.service;

import com.example.promotionservice.entity.Promotion;
import com.example.promotionservice.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionAdminService {

    private final PromotionRepository repository;

    public Promotion createPromotion(Promotion request) {


        return repository.save(request);
    }

    public List<Promotion> getAllPromotions() {
        return repository.findAll();
    }

    public Promotion updatePromotion(String id, Promotion request) {

        Promotion existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setDiscountValue(request.getDiscountValue());
        existing.setMinOrderAmount(request.getMinOrderAmount());
        existing.setCouponCode(request.getCouponCode());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setActive(request.isActive());
        existing.setConditions(request.getConditions());

        return repository.save(existing);
    }

    public void togglePromotion(String id, boolean active) {

        Promotion promo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        promo.setActive(active);
        repository.save(promo);
    }
}

package com.example.promotionservice.service;

import com.example.promotionservice.dto.CartRequest;
import com.example.promotionservice.dto.PromotionResponse;
import com.example.promotionservice.entity.Promotion;
import com.example.promotionservice.enums.PromotionType;
import com.example.promotionservice.repository.PromotionRepository;
import com.example.promotionservice.ruleengine.BogoPromotionRule;
import com.example.promotionservice.ruleengine.FlatPromotionRule;
import com.example.promotionservice.ruleengine.PercentagePromotionRule;
import com.example.promotionservice.ruleengine.PromotionRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository repository;

    private final PercentagePromotionRule percentageRule;
    private final FlatPromotionRule flatRule;
    private final BogoPromotionRule bogoRule;

    public PromotionResponse applyPromotions(CartRequest cart) {

        List<Promotion> promotions = repository.findByActiveTrue();

        double totalDiscount = 0;
        List<String> applied = new ArrayList<>();

        for (Promotion promo : promotions) {

            if (promo.getCouponCode() != null &&
                    cart.getCouponCode() != null &&
                    !promo.getCouponCode().equals(cart.getCouponCode())) {
                continue;
            }

            PromotionRule rule = getRule(promo.getType());

            if (rule.isApplicable(cart, promo)) {
                double discount = rule.apply(cart, promo);
                totalDiscount += discount;
                applied.add(promo.getName());
            }
        }

        return PromotionResponse.builder()
                .originalAmount(cart.getTotalAmount())
                .discount(totalDiscount)
                .finalAmount(cart.getTotalAmount() - totalDiscount)
                .appliedPromotions(applied)
                .build();
    }

    private PromotionRule getRule(PromotionType type) {
        return switch (type) {
            case PERCENTAGE -> percentageRule;
            case FLAT -> flatRule;
            case BOGO -> bogoRule;
        };
    }
}
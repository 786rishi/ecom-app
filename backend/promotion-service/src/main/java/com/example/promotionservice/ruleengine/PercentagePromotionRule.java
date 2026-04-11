package com.example.promotionservice.ruleengine;

import com.example.promotionservice.dto.CartRequest;
import com.example.promotionservice.entity.Promotion;
import org.springframework.stereotype.Component;

@Component
public class PercentagePromotionRule implements PromotionRule {

    @Override
    public boolean isApplicable(CartRequest cart, Promotion promo) {
        return cart.getTotalAmount() >= promo.getMinOrderAmount();
    }

    @Override
    public double apply(CartRequest cart, Promotion promo) {
        return cart.getTotalAmount() * promo.getDiscountValue() / 100;
    }
}

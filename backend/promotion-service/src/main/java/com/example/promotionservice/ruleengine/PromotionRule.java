package com.example.promotionservice.ruleengine;

import com.example.promotionservice.dto.CartRequest;
import com.example.promotionservice.entity.Promotion;

public interface PromotionRule {
    boolean isApplicable(CartRequest cart, Promotion promo);
    double apply(CartRequest cart, Promotion promo);
}

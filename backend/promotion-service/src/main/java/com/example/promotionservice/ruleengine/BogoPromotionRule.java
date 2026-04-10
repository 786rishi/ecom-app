package com.example.promotionservice.ruleengine;

import com.example.promotionservice.dto.CartItem;
import com.example.promotionservice.dto.CartRequest;
import com.example.promotionservice.entity.Promotion;
import org.springframework.stereotype.Component;

@Component
public class BogoPromotionRule implements PromotionRule {

    @Override
    public boolean isApplicable(CartRequest cart, Promotion promo) {
        return true; // Simplified
    }

    @Override
    public double apply(CartRequest cart, Promotion promo) {

        int buy = (int) promo.getConditions().getOrDefault("buy", 1);
        int get = (int) promo.getConditions().getOrDefault("get", 1);

        double discount = 0;

        for (CartItem item : cart.getItems()) {
            int freeItems = (item.getQuantity() / (buy + get)) * get;
            discount += freeItems * item.getPrice();
        }

        return discount;
    }
}

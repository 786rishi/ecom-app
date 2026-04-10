package com.example.promotionservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PromotionResponse {
    private Double originalAmount;
    private Double discount;
    private Double finalAmount;
    private List<String> appliedPromotions;
}

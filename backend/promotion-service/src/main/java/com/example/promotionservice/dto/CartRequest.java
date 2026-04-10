package com.example.promotionservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartRequest {
    private String userId;
    private List<CartItem> items;
    private Double totalAmount;
    private String couponCode;
}

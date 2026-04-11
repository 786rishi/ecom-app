package com.example.promotionservice.dto;

import lombok.Data;

@Data
public class CartItem {
    private String productId;
    private int quantity;
    private double price;
}

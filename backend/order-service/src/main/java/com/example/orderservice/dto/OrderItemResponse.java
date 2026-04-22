package com.example.orderservice.dto;

import lombok.Data;

@Data
public class OrderItemResponse {
    private Long id;
    private Integer quantity;
    private Double price;

    private Product product; // 👈 enriched
}

package com.example.inventoryservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InventoryResponse {

    private Long id;
    private String productId;
    private String productName;
    private Integer availableQuantity;
    private LocalDateTime updatedAt;
}
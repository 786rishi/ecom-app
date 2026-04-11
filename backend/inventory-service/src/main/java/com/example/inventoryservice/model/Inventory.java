package com.example.inventoryservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String productId;

    private Integer totalQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;

    private LocalDateTime updatedAt;

    @Version  // 🔥 optimistic locking
    private Long version;

    // getters & setters
}
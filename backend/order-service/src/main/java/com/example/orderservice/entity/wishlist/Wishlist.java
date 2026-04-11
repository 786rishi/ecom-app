package com.example.orderservice.entity.wishlist;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlist",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"})
)
@Data
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String productId;

    private LocalDateTime createdAt;
}
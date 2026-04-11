package com.example.promotionservice.entity;

import com.example.promotionservice.enums.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "promotions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    private String id;

    private String name;

    private PromotionType type;

    private Double discountValue;

    private Double minOrderAmount;

    private String couponCode;

    private boolean active;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Flexible rule structure
    private Map<String, Object> conditions = new HashMap<>();
}
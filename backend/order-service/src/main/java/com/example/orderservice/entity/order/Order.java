package com.example.orderservice.entity.order;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private Double totalAmount;
    private Double discount;
    private Double effectiveAmount;

    private String status;
    // CREATED, PAYMENT_PENDING, PAID, CONFIRMED, FAILED

    private String paymentId;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    //@JsonIgnore
    @JsonManagedReference
    private List<OrderItem> items;
}
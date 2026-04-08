package com.example.orderservice.service;

import com.example.orderservice.entity.Payment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    public Payment processPayment(Long orderId, Double amount) {

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setCreatedAt(LocalDateTime.now());

        // 🔥 MOCK PAYMENT LOGIC
        boolean success = true; // simulate

        if (success) {
            payment.setStatus("SUCCESS");
            payment.setTransactionId(UUID.randomUUID().toString());
        } else {
            payment.setStatus("FAILED");
        }

        return payment;
    }
}

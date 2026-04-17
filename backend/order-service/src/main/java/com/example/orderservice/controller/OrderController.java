package com.example.orderservice.controller;

import com.example.orderservice.dto.CheckoutRequest;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.entity.order.Order;
import com.example.orderservice.service.OrderService;
import jakarta.mail.MessagingException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<OrderResponse> findOrderByUserId(@PathVariable("userId") String userId) {
        return service.findOrderByUserId(userId);
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestBody CheckoutRequest request) {
        return service.checkout(request.getUserId());
    }

    @PostMapping("/{id}/pay")
    public Order pay(@PathVariable("id") Long id) throws MessagingException {
        return service.processPayment(id);
    }

    @PostMapping("/{id}/confirm")
    public Order confirm(@PathVariable("id") Long id) throws MessagingException {
        return service.confirmOrder(id);
    }

    @PutMapping("/{id}/return")
    public Order returnOrder(@PathVariable("id") Long id) {
        return service.returnOrder(id);
    }

}

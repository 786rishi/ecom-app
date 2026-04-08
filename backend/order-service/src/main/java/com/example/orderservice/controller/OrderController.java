package com.example.orderservice.controller;

import com.example.orderservice.dto.CheckoutRequest;
import com.example.orderservice.entity.order.Order;
import com.example.orderservice.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/checkout")
    public Order checkout(@RequestBody CheckoutRequest request) {
        return service.checkout(request.getUserId());
    }

    @PostMapping("/{id}/pay")
    public Order pay(@PathVariable("id") Long id) {
        return service.processPayment(id);
    }

    @PostMapping("/{id}/confirm")
    public Order confirm(@PathVariable("id") Long id) {
        return service.confirmOrder(id);
    }

}

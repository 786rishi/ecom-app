package com.example.orderservice.service;

import com.example.orderservice.client.InventoryClient;
import com.example.orderservice.entity.*;
import com.example.orderservice.entity.cart.Cart;
import com.example.orderservice.entity.cart.CartItem;
import com.example.orderservice.entity.order.Order;
import com.example.orderservice.entity.order.OrderItem;
import com.example.orderservice.repository.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final CartService cartService;
    private final PaymentService paymentService;
    private final InventoryClient inventoryClient;
    private final OrderRepository repository;

    public OrderService(CartService cartService, PaymentService paymentService, InventoryClient inventoryClient,
                        OrderRepository orderRepository) {
        this.cartService = cartService;
        this.paymentService = paymentService;
        this.inventoryClient = inventoryClient;
        this.repository = orderRepository;
    }

    @Transactional("orderTransactionManager")
    public Order checkout(String userId) {

        Cart cart = cartService.getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Reserve inventory
        for (CartItem item : cart.getItems()) {
            inventoryClient.reserve(item.getProductId(), item.getQuantity());
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setStatus("PAYMENT_PENDING");
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (CartItem item : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setProductId(item.getProductId());
            oi.setQuantity(item.getQuantity());
            oi.setPrice(item.getPrice());
            oi.setOrder(order);

            total += item.getPrice() * item.getQuantity();
            orderItems.add(oi);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        return repository.save(order);
    }


    @Transactional("orderTransactionManager")
    public Order processPayment(Long orderId) {

        Order order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = paymentService.processPayment(orderId, order.getTotalAmount());

        if (!"SUCCESS".equals(payment.getStatus())) {

            // rollback inventory
            for (OrderItem item : order.getItems()) {
                inventoryClient.release(item.getProductId(), item.getQuantity());
            }

            order.setStatus("FAILED");
            return repository.save(order);
        }

        order.setPaymentId(payment.getTransactionId());
        order.setStatus("PAID");

        cartService.clearCart(order.getUserId());

        return repository.save(order);
    }

    @Transactional("orderTransactionManager")
    public Order confirmOrder(Long orderId) {

        Order order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        for (OrderItem item : order.getItems()) {
            inventoryClient.confirm(item.getProductId(), item.getQuantity());
        }

        order.setStatus("CONFIRMED");

        // clear cart
        cartService.clearCart(order.getUserId());

        return repository.save(order);
    }

    @Transactional("orderTransactionManager")
    public List<Order> findOrderByUserId(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

}

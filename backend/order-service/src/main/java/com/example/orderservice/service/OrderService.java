package com.example.orderservice.service;

import com.example.orderservice.client.InventoryClient;
import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.OrderItemResponse;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.Product;
import com.example.orderservice.entity.*;
import com.example.orderservice.entity.cart.Cart;
import com.example.orderservice.entity.cart.CartItem;
import com.example.orderservice.entity.order.Order;
import com.example.orderservice.entity.order.OrderItem;
import com.example.orderservice.repository.order.OrderRepository;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {

    private final CartService cartService;
    private final PaymentService paymentService;
    private final InventoryClient inventoryClient;
    private final OrderRepository repository;
    private final EmailService emailService;
    private final ProductClient productClient;


    @Transactional("orderTransactionManager")
    public Order checkout(String userId) {

        Cart cart = cartService.getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Reserve inventory
        for (CartItem item : cart.getItems()) {
            if(item.getProductId() != null) {
                inventoryClient.reserve(item.getProductId(), item.getQuantity());

            }
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
        order.setDiscount(cart.getDiscount());
        order.setEffectiveAmount(total - cart.getDiscount());

        return repository.save(order);
    }


    @Transactional("orderTransactionManager")
    public Order processPayment(Long orderId) throws MessagingException {

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
        //order.setStatus("PAID");

        for (OrderItem item : order.getItems()) {
            inventoryClient.confirm(item.getProductId(), item.getQuantity());
        }

        order.setStatus("CONFIRMED");

        cartService.clearCart(order.getUserId());
       // emailService.sendOrderConfirmationEmail("786rishisaini@gmail.com", order);

        return repository.save(order);
    }

    @Transactional("orderTransactionManager")
    public Order confirmOrder(Long orderId) throws MessagingException {

        Order order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        for (OrderItem item : order.getItems()) {
            inventoryClient.confirm(item.getProductId(), item.getQuantity());
        }

        order.setStatus("CONFIRMED");

        // clear cart
        cartService.clearCart(order.getUserId());

        Order _order = repository.save(order);

        emailService.sendOrderConfirmationEmail("786rishisaini@gmail.com", _order);

        return _order;
    }

    @Transactional("orderTransactionManager")
    public Order returnOrder(Long orderId) {

        Order order = repository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        for (OrderItem item : order.getItems()) {
            inventoryClient.add(item.getProductId(), item.getQuantity());
        }

        order.setStatus("RETURNED");

        return repository.save(order);
    }

    @Transactional("orderTransactionManager")
    public List<OrderResponse> findOrderByUserId(String userId) {
        return convertToDTOList(repository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    public List<OrderResponse> convertToDTOList(List<Order> orders) {

        // 🔥 Step 1: Collect ALL productIds from ALL orders
        List<String> productIds = orders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(OrderItem::getProductId)
                .distinct() // avoid duplicates
                .collect(Collectors.toList());

        // 🔥 Step 2: Single API call
        List<Product> products = productClient.getByIds(productIds);

        // 🔥 Step 3: Convert to Map for fast lookup
        Map<String, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        // 🔥 Step 4: Map Orders → DTO
        return orders.stream().map(order -> {

            OrderResponse response = new OrderResponse();
            response.setId(order.getId());
            response.setUserId(order.getUserId());
            response.setTotalAmount(order.getEffectiveAmount());
            response.setDiscount(order.getDiscount());
            response.setStatus(order.getStatus());
            response.setCreatedAt(order.getCreatedAt());

            List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {

                OrderItemResponse itemDTO = new OrderItemResponse();
                itemDTO.setId(item.getId());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());

                // 🔥 Attach full product
                itemDTO.setProduct(productMap.get(item.getProductId()));

                return itemDTO;

            }).collect(Collectors.toList());

            response.setItems(itemResponses);

            return response;

        }).collect(Collectors.toList());
    }
}

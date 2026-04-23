package com.example.orderservice.service;

import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.OrderItemResponse;
import com.example.orderservice.dto.OrderResponse;
import com.example.orderservice.dto.Product;
import com.example.orderservice.entity.order.Order;
import com.example.orderservice.entity.order.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final ProductClient productClient;

    @Async
    public void sendOrderConfirmationEmail(String to, Order order) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        Context context = new Context();

        List<String> productIds = order.getItems().stream()
                .map(OrderItem::getProductId)
                .distinct() // avoid duplicates
                .collect(Collectors.toList());

        // 🔥 Step 2: Single API call
        List<Product> products = productClient.getByIds(productIds);

        // 🔥 Step 3: Convert to Map for fast lookup
        Map<String, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        // 🔥 Step 4: Map Orders → DTO
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

        context.setVariable("orderId", order.getId());
        context.setVariable("amount", order.getEffectiveAmount());
        context.setVariable("items", response.getItems());

        String html = templateEngine.process("order-confirmation", context);

        helper.setTo(to);
        helper.setSubject("Order Confirmation");
        helper.setText(html, true);

        System.out.println("Email sending..");
        mailSender.send(message);
    }
}

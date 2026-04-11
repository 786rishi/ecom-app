package com.example.orderservice.service;

import com.example.orderservice.entity.order.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Async
    public void sendOrderConfirmationEmail(String to, Order order) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        Context context = new Context();
        context.setVariable("orderId", order.getId());
        context.setVariable("amount", order.getTotalAmount());
        context.setVariable("items", order.getItems());

        String html = templateEngine.process("order-confirmation", context);

        helper.setTo(to);
        helper.setSubject("Order Confirmation");
        helper.setText(html, true);

        System.out.println("Email sending..");
        mailSender.send(message);
    }
}

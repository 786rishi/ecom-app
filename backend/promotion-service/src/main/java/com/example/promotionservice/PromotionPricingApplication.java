
package com.example.promotionservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
public class PromotionPricingApplication {
    public static void main(String[] args) {
        SpringApplication.run(PromotionPricingApplication.class, args);
    }

    @Value("${spring.application.name}")
    private String appName;

    @GetMapping("/hello")
    public String hello() {
        return "Hello from " + appName;
    }

}

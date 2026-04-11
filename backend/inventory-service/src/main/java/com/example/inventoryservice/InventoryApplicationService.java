
package com.example.inventoryservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@EnableFeignClients
public class InventoryApplicationService {
    public static void main(String[] args) {
        SpringApplication.run(InventoryApplicationService.class, args);
    }

    @Value("${spring.application.name}")
    private String appName;

    @GetMapping("/hello")
    public String hello() {
        return "Hello from " + appName;
    }

}

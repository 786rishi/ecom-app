
package com.example.contentservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
public class ContentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContentServiceApplication.class, args);
    }

    @Value("${spring.application.name}")
    private String appName;

    @GetMapping("/hello")
    public String hello() {
        return "Hello from " + appName;
    }

}

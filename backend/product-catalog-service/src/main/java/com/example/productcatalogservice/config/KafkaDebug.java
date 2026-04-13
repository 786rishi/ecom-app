package com.example.productcatalogservice.config;

import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class KafkaDebug {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrap;

    @PostConstruct
    public void print() {
        System.out.println("🔥 Kafka bootstrap servers: " + bootstrap);
    }
}
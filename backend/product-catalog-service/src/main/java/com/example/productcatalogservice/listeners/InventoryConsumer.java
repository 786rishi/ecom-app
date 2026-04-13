package com.example.productcatalogservice.listeners;

import com.example.productcatalogservice.service.ProductService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@AllArgsConstructor
public class InventoryConsumer {

    private final ObjectMapper objectMapper;
    private final ProductService service;

    @KafkaListener(
            topics = "inventorydb.inventorydb.inventory",
            groupId = "inventory-group"
    )
    public void consume(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);

            JsonNode payload = root.get("payload");
            if (payload == null) return;

            String op = payload.get("op").asText();

            // 🔥 Only process UPDATE events
            if ("u".equals(op)) {
                JsonNode after = payload.get("after");

                if (after != null) {
                    Long id = after.get("id").asLong();
                    int availableQty = after.get("available_quantity").asInt();
                    String productId = after.get("product_id").asText();

                    System.out.println("UPDATE EVENT:");
                    System.out.println("ID: " + id);
                    System.out.println("Product: " + productId);
                    System.out.println("Available Qty: " + availableQty);

                    // 👉 call service
                    processInventoryUpdate(id, productId, availableQty);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void processInventoryUpdate(Long id, String productId, int qty) throws IOException {
        // business logic here
        System.out.println("Processing inventory update...");
        service.updateInventory(productId, qty);
    }
}

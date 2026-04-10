package com.example.inventoryservice.service;

import com.example.inventoryservice.client.ProductClient;
import com.example.inventoryservice.model.Inventory;
import com.example.inventoryservice.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository repository;
    private final RedisLockService lockService;
    private final ProductValidationService productValidationService;
    private final ProductClient productClient;


    public InventoryService(InventoryRepository repository, RedisLockService redisLockService,
                            ProductValidationService productValidationService, ProductClient productClient) {
        this.repository = repository;
        this.lockService = redisLockService;
        this.productValidationService = productValidationService;
        this.productClient = productClient;
    }

    @Transactional
    public Inventory addStock(String productId, int quantity) {

        productValidationService.validateProduct(productId);

        Inventory inventory = repository.findByProductId(productId)
                .orElse(new Inventory());

        inventory.setProductId(productId);

        int total = (inventory.getTotalQuantity() == null ? 0 : inventory.getTotalQuantity()) + quantity;

        inventory.setTotalQuantity(total);
        inventory.setReservedQuantity(inventory.getReservedQuantity() == null ? 0 : inventory.getReservedQuantity());
        inventory.setAvailableQuantity(total - inventory.getReservedQuantity());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = repository.save(inventory);
        // 🔥 SYNC TO PRODUCT SERVICE
        productClient.updateInventory(productId, saved.getAvailableQuantity());
        return saved;
    }

    @Transactional
    public Inventory reserve(String productId, int quantity) {

        String lockKey = "lock:inventory:" + productId;

        String lockValue = lockService.acquireLock(lockKey, 5);

        if (lockValue == null) {
            throw new RuntimeException("Could not acquire lock, try again");
        }

        try {

            Inventory inventory = repository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Not found"));

            if (inventory.getAvailableQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }

            inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
            inventory.setAvailableQuantity(
                    inventory.getTotalQuantity() - inventory.getReservedQuantity()
            );


            Inventory saved = repository.save(inventory);
            // 🔥 SYNC TO PRODUCT SERVICE
            productClient.updateInventory(productId, saved.getAvailableQuantity());
            return saved;

        } finally {
            lockService.releaseLock(lockKey, lockValue);
        }
    }

    @Transactional
    public Inventory confirm(String productId, int quantity) {

        Inventory inventory = repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setTotalQuantity(inventory.getTotalQuantity() - quantity);
        inventory.setAvailableQuantity(inventory.getTotalQuantity() - inventory.getReservedQuantity());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = repository.save(inventory);
        // 🔥 SYNC TO PRODUCT SERVICE
        productClient.updateInventory(productId, saved.getAvailableQuantity());
        return saved;    }

    @Transactional
    public Inventory release(String productId, int quantity) {

        Inventory inventory = repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
        inventory.setAvailableQuantity(inventory.getTotalQuantity() - inventory.getReservedQuantity());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory saved = repository.save(inventory);
        // 🔥 SYNC TO PRODUCT SERVICE
        productClient.updateInventory(productId, saved.getAvailableQuantity());
        return saved;    }

    public Inventory get(String productId) {
        return repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public List<Inventory> getAll() {
        return repository.findAll();
    }

}
package com.example.inventoryservice.controller;

import com.example.inventoryservice.model.Inventory;
import com.example.inventoryservice.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping()
    public List<Inventory> getAll() {
        return service.getAll();
    }

    @PostMapping("/add")
    public Inventory add(
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity) {
        return service.addStock(productId, quantity);
    }

    @GetMapping("/{productId}")
    public Inventory get(@PathVariable("productId") String productId) {
        return service.get(productId);
    }

    @PostMapping("/reserve")
    public Inventory reserve(
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity) {
        return service.reserve(productId, quantity);
    }

    @PostMapping("/confirm")
    public Inventory confirm(
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity) {
        return service.confirm(productId, quantity);
    }

    @PostMapping("/release")
    public Inventory release(
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity) {
        return service.release(productId, quantity);
    }
}
package com.example.productcatalogservice.controller;

import com.example.productcatalogservice.dto.ProductSearchRequest;
import com.example.productcatalogservice.model.Product;
import com.example.productcatalogservice.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public Page<Product> getAll(Pageable pageable) {
        return service.getAll(pageable);
    }


    @GetMapping("/search")
    public Page<Product> searchGet(
            @RequestParam("q") String q,
            Pageable pageable) throws IOException {

        return service.search(q, pageable);
    }

    @PostMapping("/search")
    public Page<Product> search(
            @RequestBody ProductSearchRequest request) throws IOException {

        return service.searchProducts(request);
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable("id") String id) {
        return service.getById(id);
    }

    @PostMapping("/ids")
    public List<Product> getByIds(@RequestBody List<String> productIds) {
        return service.getByIds(productIds);
    }

    @GetMapping("/category/{category}")
    public List<Product> getByCategory(@PathVariable String category) {
        return service.getByCategory(category);
    }

    @PostMapping
    public Product create(@RequestBody Product product) throws IOException {
        return service.create(product);
    }

    @PostMapping("/bulk")
    public List<Product> loadProducts(@RequestBody List<Product> product) throws IOException {
        return service.loadProducts(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable String id, @RequestBody Product product) {
        return service.update(id, product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/feature")
    public Product featureProduct(
            @PathVariable("id") String id,
            @RequestParam("start") String start,
            @RequestParam("end") String end) {

        return service.markAsFeatured(id, start, end);
    }

    @PutMapping("/internal/inventory")
    public void updateInventory(
            @RequestParam("productId") String productId,
            @RequestParam("availableQuantity") int availableQuantity) throws IOException {

        service.updateInventory(productId, availableQuantity);
    }
}

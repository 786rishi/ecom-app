package com.example.productcatalogservice.repository;

import com.example.productcatalogservice.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategoryAndActiveTrue(String category);

    //List<Product> findByNameContainingIgnoreCase(String name);

  //  Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("{ $text: { $search: ?0 } }")
    Page<Product> searchByText(String keyword, Pageable pageable);

    List<Product> findByCategoryAndIdNot(String category, String id);

    Page<Product> findByActiveTrue(Pageable pageable);
}

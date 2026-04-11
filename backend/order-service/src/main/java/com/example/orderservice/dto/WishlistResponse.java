package com.example.orderservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WishlistResponse {

    private String userId;
    private List<Product> products;
}

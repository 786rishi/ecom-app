package com.example.orderservice.dto;

import lombok.Data;

@Data
public class DownstreamError {
    private String error;
    private String message;
    private int status;
    private String timestamp;
}
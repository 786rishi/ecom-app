package com.example.orderservice.controller;

import com.example.orderservice.dto.DownstreamError;
import com.example.orderservice.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeignException(FeignException ex) {

        String cleanMessage = "Downstream service error";

        try {
            String body = ex.contentUTF8(); // ✅ actual JSON response

            ObjectMapper mapper = new ObjectMapper();
            DownstreamError err = mapper.readValue(body, DownstreamError.class);

            cleanMessage = err.getMessage(); // 👈 exact message you want

        } catch (Exception e) {
            // fallback if parsing fails
            cleanMessage = ex.getMessage();
        }

        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(LocalDateTime.now());
        error.setStatus(ex.status());
        error.setError("Downstream error");
        error.setMessage(cleanMessage);

        return ResponseEntity.status(ex.status()).body(error);
    }
}

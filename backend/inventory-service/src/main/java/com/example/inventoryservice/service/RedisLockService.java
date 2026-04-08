package com.example.inventoryservice.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class RedisLockService {

    private final StringRedisTemplate redisTemplate;

    public RedisLockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String acquireLock(String key, long timeoutSeconds) {

        String value = UUID.randomUUID().toString();

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, value, timeoutSeconds, TimeUnit.SECONDS);

        return Boolean.TRUE.equals(success) ? value : null;
    }

    public void releaseLock(String key, String value) {

        String currentValue = redisTemplate.opsForValue().get(key);

        if (value.equals(currentValue)) {
            redisTemplate.delete(key);
        }
    }
}
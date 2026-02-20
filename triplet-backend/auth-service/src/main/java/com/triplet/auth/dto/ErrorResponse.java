package com.triplet.auth.dto;

public record ErrorResponse(
        String message,
        int status,
        long timestamp
) {}
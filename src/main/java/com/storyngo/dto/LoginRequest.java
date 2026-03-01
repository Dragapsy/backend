package com.storyngo.dto;

public record LoginRequest(
    String email,
    String password
) {
}


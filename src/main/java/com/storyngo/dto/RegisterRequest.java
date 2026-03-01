package com.storyngo.dto;

public record RegisterRequest(
    String pseudo,
    String email,
    String password
) {
}


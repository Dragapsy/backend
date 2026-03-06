package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Reponse d'authentification")
public record AuthResponse(
    @Schema(description = "JWT bearer token", example = "eyJhbGciOiJIUzI1NiJ9...")
    String token
) {
}


package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees de connexion")
public record LoginRequest(
    @Schema(description = "Email utilisateur", example = "user@storyngo.dev")
    @NotBlank(message = "email is required")
    @Email(message = "email format is invalid")
    @Size(max = 120, message = "email must not exceed 120 characters")
    String email,

    @Schema(description = "Mot de passe", example = "password123")
    @NotBlank(message = "password is required")
    @Size(min = 8, max = 72, message = "password must contain between 8 and 72 characters")
    String password
) {
}

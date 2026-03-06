package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees d'inscription")
public record RegisterRequest(
    @Schema(description = "Pseudo utilisateur", example = "Aymane")
    @NotBlank(message = "pseudo is required")
    @Size(min = 3, max = 30, message = "pseudo must contain between 3 and 30 characters")
    String pseudo,

    @Schema(description = "Email utilisateur", example = "aymane@storyngo.dev")
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

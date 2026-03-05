package com.storyngo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "pseudo is required")
    @Size(min = 3, max = 30, message = "pseudo must contain between 3 and 30 characters")
    String pseudo,

    @NotBlank(message = "email is required")
    @Email(message = "email format is invalid")
    @Size(max = 120, message = "email must not exceed 120 characters")
    String email,

    @NotBlank(message = "password is required")
    @Size(min = 8, max = 72, message = "password must contain between 8 and 72 characters")
    String password
) {
}

package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Demande de ban definitif")
public record PermanentBanRequest(
    @Schema(description = "Motif du ban definitif", example = "Harcèlement grave")
    @NotBlank(message = "reason is required")
    @Size(max = 255, message = "reason must not exceed 255 characters")
    String reason
) {
}

package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Demande de ban temporaire")
public record TemporaryBanRequest(
    @Schema(description = "Duree du ban en jours", example = "7")
    @Min(value = 1, message = "durationDays must be at least 1")
    @Max(value = 365, message = "durationDays must not exceed 365")
    int durationDays,

    @Schema(description = "Motif du ban", example = "Spam repetitif")
    @NotBlank(message = "reason is required")
    @Size(max = 255, message = "reason must not exceed 255 characters")
    String reason
) {
}

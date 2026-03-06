package com.storyngo.dto;

import com.storyngo.models.ReportType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Creation d'un signalement")
public record ReportCreateRequest(
    @Schema(description = "Type de cible", example = "COMMENT")
    @NotNull(message = "type is required")
    ReportType type,

    @Schema(description = "ID de la cible", example = "42")
    @NotNull(message = "targetId is required")
    Long targetId,

    @Schema(description = "Motif du signalement", example = "Spam repetitif")
    @NotBlank(message = "reason is required")
    @Size(max = 255, message = "reason must not exceed 255 characters")
    String reason
) {
}

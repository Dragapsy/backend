package com.storyngo.dto;

import com.storyngo.models.ReportStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Mise a jour du statut d'un signalement")
public record UpdateReportStatusRequest(
    @Schema(description = "Nouveau statut", example = "IN_REVIEW")
    @NotNull(message = "status is required")
    ReportStatus status,

    @Schema(description = "Note optionnelle de moderation", example = "Verification en cours")
    @Size(max = 255, message = "resolutionNote must not exceed 255 characters")
    String resolutionNote
) {
}

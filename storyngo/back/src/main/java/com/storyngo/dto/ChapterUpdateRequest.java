package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees de mise a jour d'un chapitre")
public record ChapterUpdateRequest(
    @Schema(description = "Nouveau contenu du chapitre", example = "Version retravaillee du chapitre...")
    @NotBlank(message = "content is required")
    @Size(max = 10000, message = "content must not exceed 10000 characters")
    String content,

    @Schema(description = "Chapitre anonyme", example = "false")
    boolean isAnonymous
) {
}
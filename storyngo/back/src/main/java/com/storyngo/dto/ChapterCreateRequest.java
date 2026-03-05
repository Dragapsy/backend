package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees de creation d'un chapitre")
public record ChapterCreateRequest(
    @Schema(description = "Contenu du chapitre", example = "La suite de l'aventure...")
    @NotBlank(message = "content is required")
    @Size(max = 10000, message = "content must not exceed 10000 characters")
    String content,

    @Schema(description = "Chapitre anonyme", example = "false")
    boolean isAnonymous
) {
}

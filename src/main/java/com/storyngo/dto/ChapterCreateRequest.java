package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Donnees de creation d'un chapitre")
public record ChapterCreateRequest(
    @Schema(description = "Contenu du chapitre", example = "La suite de l'aventure...")
    String content,
    @Schema(description = "Chapitre anonyme", example = "false")
    boolean isAnonymous
) {
}


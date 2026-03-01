package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Donnees de creation d'une story avec son premier chapitre")
public record StoryCreateRequest(
    @Schema(description = "Titre de la story", example = "Le Royaume Oublie")
    String title,
    @Schema(description = "Resume de la story", example = "Un monde fantasy en peril.")
    String summary,
    @Schema(description = "Contenu du chapitre 1", example = "Le voyage commence...")
    String content,
    @Schema(description = "Chapitre anonyme", example = "false")
    boolean isAnonymous
) {
}


package com.storyngo.dto;

import com.storyngo.models.StoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Representation resumee d'une story")
public record StoryDTO(
    @Schema(description = "Identifiant de la story", example = "42")
    Long id,
    @Schema(description = "Titre", example = "Le Royaume Oublie")
    String title,
    @Schema(description = "Resume", example = "Un royaume ancient se reveille...")
    String summary,
    @Schema(description = "Pseudo de l'auteur", example = "Auteur")
    String authorName,
    @Schema(description = "Nombre de chapitres", example = "3")
    int chapterCount,
    @Schema(description = "Statut workflow")
    StoryStatus status
) {
}


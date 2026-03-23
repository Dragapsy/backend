package com.storyngo.dto;

import com.storyngo.models.StoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

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
    @Schema(description = "Date de creation de la story")
    LocalDateTime createdAt,
    @Schema(description = "Role de l'auteur", example = "REVIEWER")
    String authorRole,
    @Schema(description = "Photo de profil de l'auteur", example = "https://cdn.storyngo.dev/profiles/auteur.png")
    String authorProfileImageUrl,
    @Schema(description = "Nombre de chapitres", example = "3")
    int chapterCount,
    @Schema(description = "Statut workflow")
    StoryStatus status,
    @Schema(description = "Nombre total de likes", example = "17")
    int likeCount,
    @Schema(description = "Indique si l'utilisateur connecté a liké cette story", example = "true")
    boolean likedByMe
) {
}


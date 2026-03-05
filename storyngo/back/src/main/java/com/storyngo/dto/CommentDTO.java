package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Representation d'un commentaire")
public record CommentDTO(
    @Schema(description = "Identifiant du commentaire", example = "100")
    Long id,
    @Schema(description = "Contenu du commentaire", example = "Super chapitre !")
    String content,
    @Schema(description = "Pseudo de l'auteur", example = "Lecteur")
    String authorName,
    @Schema(description = "Date de creation", example = "2026-03-01T12:00:00")
    LocalDateTime createdAt
) {
}


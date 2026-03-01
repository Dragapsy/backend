package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Donnees de creation d'un commentaire")
public record CommentCreateRequest(
    @Schema(description = "Contenu du commentaire", example = "Super chapitre !")
    String content
) {
}


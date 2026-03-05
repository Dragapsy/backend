package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees de creation d'un commentaire")
public record CommentCreateRequest(
    @Schema(description = "Contenu du commentaire", example = "Super chapitre !")
    @NotBlank(message = "content is required")
    @Size(max = 1000, message = "content must not exceed 1000 characters")
    String content
) {
}

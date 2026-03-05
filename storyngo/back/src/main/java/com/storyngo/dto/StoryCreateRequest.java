package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Donnees de creation d'une story avec son premier chapitre")
public record StoryCreateRequest(
    @Schema(description = "Titre de la story", example = "Le Royaume Oublie")
    @NotBlank(message = "title is required")
    @Size(min = 3, max = 120, message = "title must contain between 3 and 120 characters")
    String title,

    @Schema(description = "Resume de la story", example = "Un monde fantasy en peril.")
    @NotBlank(message = "summary is required")
    @Size(max = 2000, message = "summary must not exceed 2000 characters")
    String summary,

    @Schema(description = "Contenu du chapitre 1", example = "Le voyage commence...")
    @NotBlank(message = "content is required")
    @Size(max = 2000, message = "content must not exceed 2000 characters")
    String content,

    @Schema(description = "Chapitre anonyme", example = "false")
    boolean isAnonymous
) {
}

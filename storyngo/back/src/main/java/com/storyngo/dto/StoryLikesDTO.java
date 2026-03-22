package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Informations de likes d'une story")
public record StoryLikesDTO(
    @Schema(description = "Nombre total de likes", example = "17")
    long likeCount,
    @Schema(description = "Indique si l'utilisateur courant a like la story", example = "true")
    boolean likedByMe
) {
}

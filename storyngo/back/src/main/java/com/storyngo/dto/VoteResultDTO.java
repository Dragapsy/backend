package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultat d'un vote de chapitre")
public record VoteResultDTO(
    @Schema(description = "Indique si le chapitre est debloque apres ce vote", example = "false")
    boolean unlocked
) {
}


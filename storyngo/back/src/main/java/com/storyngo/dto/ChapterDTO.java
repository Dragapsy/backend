package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Representation d'un chapitre")
public record ChapterDTO(
    @Schema(description = "Identifiant du chapitre", example = "101")
    Long id,
    @Schema(description = "Contenu", example = "Le vent portait des murmures anciens.")
    String content,
    @Schema(description = "Position dans la story", example = "1")
    Integer orderIndex,
    @Schema(description = "Nom de l'auteur (ou Anonyme)", example = "Anonyme")
    String authorName,
    @Schema(description = "Nombre de votes recus", example = "12")
    long voteCount,
    @Schema(description = "Seuil de votes requis", example = "20")
    Integer threshold,
    @Schema(description = "Limite de caracteres", example = "2000")
    Integer charLimit,
    @Schema(description = "Indique si chapitre debloque", example = "false")
    boolean isUnlocked
) {
}


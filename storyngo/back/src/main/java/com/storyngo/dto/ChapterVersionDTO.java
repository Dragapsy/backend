package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Snapshot de version d'un chapitre")
public record ChapterVersionDTO(
    @Schema(description = "Identifiant de la version", example = "501")
    Long id,
    @Schema(description = "Identifiant du chapitre", example = "101")
    Long chapterId,
    @Schema(description = "Numero de version", example = "3")
    Integer versionNumber,
    @Schema(description = "Contenu snapshot", example = "Version precedente du chapitre")
    String content,
    @Schema(description = "Date de creation de la version", example = "2026-03-05T12:00:00")
    LocalDateTime createdAt
) {
}
package com.storyngo.dto;

import com.storyngo.models.StoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Score qualite metier d'une story avec details")
public record StoryQualityScoreDTO(
    @Schema(description = "Identifiant story", example = "42")
    Long storyId,
    @Schema(description = "Statut workflow actuel")
    StoryStatus status,
    @Schema(description = "Score final sur 100", example = "79")
    int totalScore,
    @Schema(description = "Score completude (0-40)", example = "30")
    int completenessScore,
    @Schema(description = "Score statut (0-25)", example = "25")
    int statusScore,
    @Schema(description = "Score engagement (0-35)", example = "24")
    int engagementScore,
    @Schema(description = "Nombre de chapitres", example = "3")
    int chapterCount,
    @Schema(description = "Nombre total de votes", example = "6")
    long voteCount,
    @Schema(description = "Nombre total de commentaires", example = "4")
    long commentCount
) {
}
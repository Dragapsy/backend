package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Detail complet d'une story")
public record StoryDetailsDTO(
    @Schema(description = "Informations de la story")
    StoryDTO story,
    @Schema(description = "Liste ordonnee des chapitres")
    List<ChapterDTO> chapters,
    @Schema(description = "Indique si l'auteur peut ajouter un nouveau chapitre (dernier chapitre debloque)", example = "true")
    boolean canAddChapter
) {
}

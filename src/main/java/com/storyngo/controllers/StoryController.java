package com.storyngo.controllers;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.CommentCreateRequest;
import com.storyngo.dto.CommentDTO;
import com.storyngo.dto.ErrorResponse;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.dto.VoteResultDTO;
import com.storyngo.models.User;
import com.storyngo.services.CommentService;
import com.storyngo.services.StoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Stories", description = "Endpoints de lecture et votes")
public class StoryController {

    private final StoryService storyService;
    private final CommentService commentService;

    public StoryController(StoryService storyService, CommentService commentService) {
        this.storyService = storyService;
        this.commentService = commentService;
    }

    @GetMapping("/stories")
    @Operation(summary = "Recuperer les stories (Derniers Drops)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des stories", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "400", description = "Requete invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<StoryDTO> getStories() {
        return storyService.getStories();
    }

    @GetMapping("/stories/trending")
    @Operation(summary = "Recuperer les stories en feu")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des stories tendance", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "400", description = "Requete invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<StoryDTO> getTrendingStories() {
        return storyService.getTrendingStories();
    }

    @GetMapping("/stories/upcoming")
    @Operation(summary = "Recuperer les chapitres a un doigt de la suite")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des chapitres proches du seuil", content = @Content(schema = @Schema(implementation = ChapterDTO.class))),
        @ApiResponse(responseCode = "400", description = "Requete invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<ChapterDTO> getUpcomingChapters() {
        return storyService.getUpcomingChapters();
    }

    @PostMapping("/chapters/{id}/vote")
    @Operation(summary = "Voter pour un chapitre")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vote enregistre", content = @Content(schema = @Schema(implementation = VoteResultDTO.class))),
        @ApiResponse(responseCode = "400", description = "Vote invalide ou deja existant", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public VoteResultDTO voteForChapter(@AuthenticationPrincipal Object principal, @PathVariable Long id) {
        Long userId = extractUserId(principal);
        boolean unlocked = storyService.voteForChapter(userId, id);
        return new VoteResultDTO(unlocked);
    }

    @GetMapping("/stories/{id}")
    @Operation(summary = "Recuperer le detail d'une story")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detail de la story", content = @Content(schema = @Schema(implementation = StoryDetailsDTO.class))),
        @ApiResponse(responseCode = "400", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDetailsDTO getStoryDetails(@PathVariable Long id) {
        return storyService.getStoryDetails(id);
    }

    @PostMapping("/stories")
    @Operation(summary = "Creer une story et son premier chapitre")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Story creee", content = @Content(schema = @Schema(implementation = StoryDetailsDTO.class))),
        @ApiResponse(responseCode = "400", description = "Donnees invalides", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDetailsDTO createStory(
        @AuthenticationPrincipal Object principal,
        @RequestBody StoryCreateRequest request
    ) {
        User user = requireUser(principal);
        return storyService.createStory(user, request);
    }

    @PostMapping("/stories/{id}/chapters")
    @Operation(summary = "Ajouter un nouveau chapitre a une story")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chapitre cree", content = @Content(schema = @Schema(implementation = ChapterDTO.class))),
        @ApiResponse(responseCode = "400", description = "Chapitre invalide ou story verrouillee", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ChapterDTO addChapter(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @RequestBody ChapterCreateRequest request
    ) {
        User user = requireUser(principal);
        return storyService.addChapter(user, id, request);
    }

    @GetMapping("/chapters/{id}/comments")
    @Operation(summary = "Lister les commentaires d'un chapitre")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des commentaires", content = @Content(schema = @Schema(implementation = CommentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Chapitre introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<CommentDTO> getComments(@PathVariable Long id) {
        return commentService.getComments(id);
    }

    @PostMapping("/chapters/{id}/comments")
    @Operation(summary = "Ajouter un commentaire")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Commentaire cree", content = @Content(schema = @Schema(implementation = CommentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Commentaire invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public CommentDTO addComment(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @RequestBody CommentCreateRequest request
    ) {
        User user = requireUser(principal);
        return commentService.addComment(user, id, request);
    }

    private Long extractUserId(Object principal) {
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Authenticated user id is not available.");
    }

    private User requireUser(Object principal) {
        if (principal instanceof User user) {
            return user;
        }
        throw new IllegalStateException("Authenticated user is required.");
    }
}

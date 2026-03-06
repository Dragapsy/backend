package com.storyngo.controllers;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.ChapterUpdateRequest;
import com.storyngo.dto.ChapterVersionDTO;
import com.storyngo.dto.CommentCreateRequest;
import com.storyngo.dto.CommentDTO;
import com.storyngo.dto.ErrorResponse;
import com.storyngo.dto.ReportCreateRequest;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.dto.StoryQualityScoreDTO;
import com.storyngo.dto.VoteResultDTO;
import com.storyngo.dto.AdminReportDTO;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.models.User;
import com.storyngo.services.CommentService;
import com.storyngo.services.ReportService;
import com.storyngo.services.StoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Stories", description = "Endpoints de lecture et votes")
public class StoryController {

    private final StoryService storyService;
    private final CommentService commentService;
    private final ReportService reportService;

    public StoryController(StoryService storyService, CommentService commentService, ReportService reportService) {
        this.storyService = storyService;
        this.commentService = commentService;
        this.reportService = reportService;
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
        @ApiResponse(responseCode = "409", description = "Vote deja existant", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Ressource introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
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
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDetailsDTO getStoryDetails(@PathVariable Long id) {
        return storyService.getStoryDetails(id);
    }

    @GetMapping("/stories/{id}/quality-score")
    @Operation(summary = "Recuperer le score qualite metier d'une story")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Score qualite", content = @Content(schema = @Schema(implementation = StoryQualityScoreDTO.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryQualityScoreDTO getStoryQualityScore(@PathVariable Long id) {
        return storyService.getStoryQualityScore(id);
    }

    @PostMapping("/stories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Creer une story et son premier chapitre")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Story creee", content = @Content(schema = @Schema(implementation = StoryDetailsDTO.class))),
        @ApiResponse(responseCode = "400", description = "Donnees invalides", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDetailsDTO createStory(
        @AuthenticationPrincipal Object principal,
        @Valid @RequestBody StoryCreateRequest request
    ) {
        User user = requireUser(principal);
        return storyService.createStory(user, request);
    }

    @PostMapping("/stories/{id}/chapters")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter un nouveau chapitre a une story")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Chapitre cree", content = @Content(schema = @Schema(implementation = ChapterDTO.class))),
        @ApiResponse(responseCode = "400", description = "Chapitre invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Conflit metier", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ChapterDTO addChapter(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @Valid @RequestBody ChapterCreateRequest request
    ) {
        User user = requireUser(principal);
        return storyService.addChapter(user, id, request);
    }

    @PatchMapping("/chapters/{id}")
    @Operation(summary = "Modifier un chapitre")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chapitre modifie", content = @Content(schema = @Schema(implementation = ChapterDTO.class))),
        @ApiResponse(responseCode = "400", description = "Chapitre invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Chapitre introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Conflit metier", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ChapterDTO updateChapter(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @Valid @RequestBody ChapterUpdateRequest request
    ) {
        User user = requireUser(principal);
        return storyService.updateChapter(user, id, request);
    }

    @PostMapping("/stories/{id}/submit-review")
    @Operation(summary = "Soumettre une story en revision")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Story soumise en revision", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Transition invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDTO submitStoryForReview(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id
    ) {
        User user = requireUser(principal);
        return storyService.submitStoryForReview(user, id);
    }

    @PostMapping("/stories/{id}/approve-review")
    @Operation(summary = "Approuver une story en revision")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Story approuvee", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Transition invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDTO approveStoryReview(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id
    ) {
        User user = requireUser(principal);
        return storyService.approveStoryReview(user, id);
    }

    @PostMapping("/stories/{id}/reject-review")
    @Operation(summary = "Rejeter une story en revision")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Story rejetee", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Transition invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDTO rejectStoryReview(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id
    ) {
        User user = requireUser(principal);
        return storyService.rejectStoryReview(user, id);
    }

    @PostMapping("/stories/{id}/archive")
    @Operation(summary = "Archiver une story publiee")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Story archivee", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Story introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Transition invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public StoryDTO archiveStory(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id
    ) {
        User user = requireUser(principal);
        return storyService.archiveStory(user, id);
    }

    @GetMapping("/chapters/{id}/versions")
    @Operation(summary = "Lister l'historique des versions d'un chapitre")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des versions", content = @Content(schema = @Schema(implementation = ChapterVersionDTO.class))),
        @ApiResponse(responseCode = "404", description = "Chapitre introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<ChapterVersionDTO> getChapterVersions(@PathVariable Long id) {
        return storyService.getChapterVersions(id);
    }

    @PostMapping("/chapters/{id}/versions/{versionId}/restore")
    @Operation(summary = "Restaurer une version d'un chapitre")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Version restauree", content = @Content(schema = @Schema(implementation = ChapterDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Chapitre ou version introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Conflit metier", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ChapterDTO restoreChapterVersion(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @PathVariable Long versionId
    ) {
        User user = requireUser(principal);
        return storyService.restoreChapterVersion(user, id, versionId);
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
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter un commentaire")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Commentaire cree", content = @Content(schema = @Schema(implementation = CommentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Commentaire invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Chapitre introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public CommentDTO addComment(
        @AuthenticationPrincipal Object principal,
        @PathVariable Long id,
        @Valid @RequestBody CommentCreateRequest request
    ) {
        User user = requireUser(principal);
        return commentService.addComment(user, id, request);
    }

    @PostMapping("/reports")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Creer un signalement sur chapitre/commentaire")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Signalement cree", content = @Content(schema = @Schema(implementation = AdminReportDTO.class))),
        @ApiResponse(responseCode = "400", description = "Signalement invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Cible introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AdminReportDTO createReport(
        @AuthenticationPrincipal Object principal,
        @Valid @RequestBody ReportCreateRequest request
    ) {
        User user = requireUser(principal);
        return reportService.createReport(user, request);
    }

    private Long extractUserId(Object principal) {
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new UnauthorizedException("Authenticated user id is not available.");
    }

    private User requireUser(Object principal) {
        if (principal instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("Authenticated user is required.");
    }
}

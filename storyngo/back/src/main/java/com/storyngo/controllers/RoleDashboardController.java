package com.storyngo.controllers;

import com.storyngo.dto.AdminUserOverviewDTO;
import com.storyngo.dto.AdminAuditLogDTO;
import com.storyngo.dto.AdminReportDTO;
import com.storyngo.dto.CurrentUserProfileDTO;
import com.storyngo.dto.ErrorResponse;
import com.storyngo.dto.LeaderboardEntryDTO;
import com.storyngo.dto.LeaderboardPeriod;
import com.storyngo.dto.PermanentBanRequest;
import com.storyngo.dto.PublicUserProfileDTO;
import com.storyngo.dto.ReviewerDashboardDTO;
import com.storyngo.dto.SocialFollowingDTO;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.TemporaryBanRequest;
import com.storyngo.dto.UpdateUserProfileRequest;
import com.storyngo.dto.UpdateReportStatusRequest;
import com.storyngo.dto.UserXpEventDTO;
import com.storyngo.dto.WeeklyLeaderboardEntryDTO;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.models.User;
import com.storyngo.services.RoleDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api")
@Tag(name = "Role Dashboards", description = "Endpoints role-based pour profils et dashboards")
public class RoleDashboardController {

    private final RoleDashboardService roleDashboardService;

    public RoleDashboardController(RoleDashboardService roleDashboardService) {
        this.roleDashboardService = roleDashboardService;
    }

    @GetMapping("/users/me")
    @Operation(summary = "Recuperer le profil du user connecte")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profil utilisateur", content = @Content(schema = @Schema(implementation = CurrentUserProfileDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public CurrentUserProfileDTO getCurrentUserProfile(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getCurrentUserProfile(requireUser(principal));
    }

    @PatchMapping("/users/me")
    @Operation(summary = "Modifier le profil du user connecte")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profil mis a jour", content = @Content(schema = @Schema(implementation = CurrentUserProfileDTO.class))),
        @ApiResponse(responseCode = "400", description = "Payload invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Conflit pseudo", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public CurrentUserProfileDTO updateCurrentUserProfile(
        @AuthenticationPrincipal Object principal,
        @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return roleDashboardService.updateCurrentUserProfile(requireUser(principal), request);
    }

    @GetMapping("/reviewer/dashboard")
    @Operation(summary = "Recuperer le dashboard reviewer")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dashboard reviewer", content = @Content(schema = @Schema(implementation = ReviewerDashboardDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ReviewerDashboardDTO getReviewerDashboard(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getReviewerDashboard(requireUser(principal));
    }

    @GetMapping("/admin/users")
    @Operation(summary = "Recuperer la liste admin des utilisateurs (safe)")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vue admin utilisateurs", content = @Content(schema = @Schema(implementation = AdminUserOverviewDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<AdminUserOverviewDTO> getAdminUsers(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getAdminUsersOverview(requireUser(principal));
    }

    @GetMapping("/gamification/leaderboard/weekly")
    @Operation(summary = "Recuperer le classement XP hebdomadaire")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Classement hebdomadaire", content = @Content(schema = @Schema(implementation = WeeklyLeaderboardEntryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<WeeklyLeaderboardEntryDTO> getWeeklyLeaderboard(
        @AuthenticationPrincipal Object principal,
        @RequestParam(defaultValue = "10") int limit
    ) {
        requireUser(principal);
        return roleDashboardService.getWeeklyLeaderboard(limit);
    }

    @GetMapping("/gamification/leaderboard")
    @Operation(summary = "Recuperer le classement XP avec filtre periode")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Classement XP", content = @Content(schema = @Schema(implementation = LeaderboardEntryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<LeaderboardEntryDTO> getLeaderboard(
        @AuthenticationPrincipal Object principal,
        @RequestParam(defaultValue = "WEEK") LeaderboardPeriod period,
        @RequestParam(defaultValue = "50") int limit
    ) {
        requireUser(principal);
        return roleDashboardService.getLeaderboard(period, limit);
    }

    @GetMapping("/gamification/xp-history")
    @Operation(summary = "Recuperer l'historique detaille des gains XP")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Historique XP", content = @Content(schema = @Schema(implementation = UserXpEventDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<UserXpEventDTO> getXpHistory(
        @AuthenticationPrincipal Object principal,
        @RequestParam(defaultValue = "30") int limit
    ) {
        return roleDashboardService.getXpHistory(requireUser(principal), limit);
    }

    @PostMapping("/social/follow/{id}")
    @Operation(summary = "Suivre un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Utilisateur suivi"),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Deja suivi", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void followUser(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id
    ) {
        roleDashboardService.followUser(requireUser(principal), id);
    }

    @DeleteMapping("/social/follow/{id}")
    @Operation(summary = "Ne plus suivre un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Utilisateur unfollow"),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollowUser(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id
    ) {
        roleDashboardService.unfollowUser(requireUser(principal), id);
    }

    @GetMapping("/social/following")
    @Operation(summary = "Recuperer la liste des utilisateurs suivis")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Utilisateurs suivis", content = @Content(schema = @Schema(implementation = SocialFollowingDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<SocialFollowingDTO> getFollowing(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getFollowing(requireUser(principal));
    }

    @GetMapping("/social/feed")
    @Operation(summary = "Recuperer le feed personnalise")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Feed personnalise", content = @Content(schema = @Schema(implementation = StoryDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<StoryDTO> getPersonalizedFeed(
        @AuthenticationPrincipal Object principal,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return roleDashboardService.getPersonalizedFeed(requireUser(principal), limit);
    }

    @GetMapping("/users/{id}/public")
    @Operation(summary = "Recuperer le profil public d'un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profil public", content = @Content(schema = @Schema(implementation = PublicUserProfileDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public PublicUserProfileDTO getPublicUserProfile(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id
    ) {
        requireUser(principal);
        return roleDashboardService.getPublicUserProfile(id);
    }

    @PostMapping("/admin/users/{id}/ban-temporary")
    @Operation(summary = "Ban temporairement un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Utilisateur banni temporairement", content = @Content(schema = @Schema(implementation = AdminUserOverviewDTO.class))),
        @ApiResponse(responseCode = "400", description = "Payload invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AdminUserOverviewDTO banUserTemporarily(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id,
        @Valid @RequestBody TemporaryBanRequest request
    ) {
        return roleDashboardService.banUserTemporarily(requireUser(principal), id, request);
    }

    @PostMapping("/admin/users/{id}/ban-permanent")
    @Operation(summary = "Ban definitivement un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Utilisateur banni definitivement", content = @Content(schema = @Schema(implementation = AdminUserOverviewDTO.class))),
        @ApiResponse(responseCode = "400", description = "Payload invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AdminUserOverviewDTO banUserPermanently(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id,
        @Valid @RequestBody PermanentBanRequest request
    ) {
        return roleDashboardService.banUserPermanently(requireUser(principal), id, request);
    }

    @PostMapping("/admin/users/{id}/unban")
    @Operation(summary = "Lever le ban d'un utilisateur")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Utilisateur debanni", content = @Content(schema = @Schema(implementation = AdminUserOverviewDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Utilisateur introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AdminUserOverviewDTO unbanUser(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id
    ) {
        return roleDashboardService.unbanUser(requireUser(principal), id);
    }

    @GetMapping("/admin/reports/open")
    @Operation(summary = "Recuperer la file priorisee des signalements ouverts")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Signalements ouverts", content = @Content(schema = @Schema(implementation = AdminReportDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<AdminReportDTO> getOpenReports(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getOpenReports(requireUser(principal));
    }

    @GetMapping("/admin/reports")
    @Operation(summary = "Recuperer tous les signalements")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tous les signalements", content = @Content(schema = @Schema(implementation = AdminReportDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<AdminReportDTO> getAllReports(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getAllReports(requireUser(principal));
    }

    @PatchMapping("/admin/reports/{id}")
    @Operation(summary = "Mettre a jour le statut d'un signalement")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Signalement mis a jour", content = @Content(schema = @Schema(implementation = AdminReportDTO.class))),
        @ApiResponse(responseCode = "400", description = "Payload invalide", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Signalement introuvable", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AdminReportDTO updateReportStatus(
        @AuthenticationPrincipal Object principal,
        @PathVariable long id,
        @Valid @RequestBody UpdateReportStatusRequest request
    ) {
        return roleDashboardService.updateReportStatus(requireUser(principal), id, request);
    }

    @GetMapping("/admin/audit-logs")
    @Operation(summary = "Recuperer les logs d'audit admin")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logs audit", content = @Content(schema = @Schema(implementation = AdminAuditLogDTO.class))),
        @ApiResponse(responseCode = "401", description = "Non authentifie", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acces interdit", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<AdminAuditLogDTO> getAuditLogs(@AuthenticationPrincipal Object principal) {
        return roleDashboardService.getRecentAuditLogs(requireUser(principal));
    }

    private User requireUser(Object principal) {
        if (principal instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("Authenticated user is required.");
    }
}

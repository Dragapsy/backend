package com.storyngo.services;

import com.storyngo.dto.AdminUserOverviewDTO;
import com.storyngo.dto.AdminAuditLogDTO;
import com.storyngo.dto.AdminReportDTO;
import com.storyngo.dto.CurrentUserProfileDTO;
import com.storyngo.dto.LeaderboardEntryDTO;
import com.storyngo.dto.LeaderboardPeriod;
import com.storyngo.dto.PermanentBanRequest;
import com.storyngo.dto.PublicUserProfileDTO;
import com.storyngo.dto.ReviewerDashboardDTO;
import com.storyngo.dto.SocialFollowingDTO;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.TemporaryBanRequest;
import com.storyngo.dto.UpdateReportStatusRequest;
import com.storyngo.dto.UpdateUserProfileRequest;
import com.storyngo.dto.UserXpEventDTO;
import com.storyngo.dto.WeeklyLeaderboardEntryDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.models.UserRole;
import java.time.LocalDateTime;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.CommentRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleDashboardService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;
    private final GamificationService gamificationService;
    private final AdminAuditService adminAuditService;
    private final ReportService reportService;
    private final SocialService socialService;

    public RoleDashboardService(
        StoryRepository storyRepository,
        ChapterRepository chapterRepository,
        CommentRepository commentRepository,
        UserRepository userRepository,
        StoryMapper storyMapper,
        GamificationService gamificationService,
        AdminAuditService adminAuditService,
        ReportService reportService,
        SocialService socialService
    ) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.storyMapper = storyMapper;
        this.gamificationService = gamificationService;
        this.adminAuditService = adminAuditService;
        this.reportService = reportService;
        this.socialService = socialService;
    }

    @Transactional
    public CurrentUserProfileDTO getCurrentUserProfile(User user) {
        User authenticated = requireAuthenticated(user);
        UserStats stats = buildUserStats(authenticated);
        GamificationService.ProgressSnapshot gamification = gamificationService.getSnapshot(authenticated);

        return new CurrentUserProfileDTO(
            authenticated.getId(),
            authenticated.getPseudo(),
            authenticated.getEmail(),
            authenticated.getRole().name(),
            authenticated.getBio(),
            authenticated.getProfileImageUrl(),
            gamification.xp(),
            gamification.level(),
            gamification.levelTitle(),
            gamification.badges(),
            authenticated.getCreatedAt(),
            stats.storyCount(),
            stats.chapterCount(),
            stats.commentCount()
        );
    }

    @Transactional
    public CurrentUserProfileDTO updateCurrentUserProfile(User user, UpdateUserProfileRequest request) {
        User authenticated = requireAuthenticated(user);

        if (request.pseudo() != null) {
            String nextPseudo = request.pseudo().trim();
            if (!nextPseudo.equals(authenticated.getPseudo()) && userRepository.existsByPseudo(nextPseudo)) {
                throw new ConflictException("Pseudo already in use.");
            }
            authenticated.setPseudo(nextPseudo);
        }

        if (request.bio() != null) {
            authenticated.setBio(request.bio().trim());
        }

        if (request.profileImageUrl() != null) {
            authenticated.setProfileImageUrl(request.profileImageUrl().trim());
        }

        userRepository.save(Objects.requireNonNull(authenticated));
        return getCurrentUserProfile(authenticated);
    }

    @Transactional(readOnly = true)
    public ReviewerDashboardDTO getReviewerDashboard(User user) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.REVIEWER);

        List<StoryDTO> pending = storyRepository.findByStatusOrderByCreatedAtDesc(StoryStatus.IN_REVIEW)
            .stream()
            .map(storyMapper::toDto)
            .toList();

        List<StoryDTO> validated = storyRepository.findByStatusOrderByCreatedAtDesc(StoryStatus.PUBLISHED)
            .stream()
            .map(storyMapper::toDto)
            .toList();

        return new ReviewerDashboardDTO(pending, validated);
    }

    @Transactional
    public List<AdminUserOverviewDTO> getAdminUsersOverview(User user) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.ADMIN);

        return userRepository.findAll()
            .stream()
            .map(this::toAdminUserOverview)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<WeeklyLeaderboardEntryDTO> getWeeklyLeaderboard(int limit) {
        return gamificationService.getWeeklyLeaderboard(limit);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDTO> getLeaderboard(LeaderboardPeriod period, int limit) {
        return gamificationService.getLeaderboard(period, limit);
    }

    @Transactional(readOnly = true)
    public List<UserXpEventDTO> getXpHistory(User user, int limit) {
        User authenticated = requireAuthenticated(user);
        return gamificationService.getXpHistory(authenticated, limit);
    }

    @Transactional
    public void followUser(User user, long targetUserId) {
        User authenticated = requireAuthenticated(user);
        socialService.followUser(authenticated, targetUserId);
    }

    @Transactional
    public void unfollowUser(User user, long targetUserId) {
        User authenticated = requireAuthenticated(user);
        socialService.unfollowUser(authenticated, targetUserId);
    }

    @Transactional(readOnly = true)
    public List<SocialFollowingDTO> getFollowing(User user) {
        User authenticated = requireAuthenticated(user);
        return socialService.getFollowing(authenticated);
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getPersonalizedFeed(User user, int limit) {
        User authenticated = requireAuthenticated(user);
        return socialService.getPersonalizedFeed(authenticated, limit);
    }

    @Transactional(readOnly = true)
    public List<AdminReportDTO> getOpenReports(User user) {
        return reportService.getOpenReports(user);
    }

    @Transactional(readOnly = true)
    public List<AdminReportDTO> getAllReports(User user) {
        return reportService.getAllReports(user);
    }

    @Transactional
    public AdminReportDTO updateReportStatus(User user, long reportId, UpdateReportStatusRequest request) {
        return reportService.updateReportStatus(user, reportId, request);
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogDTO> getRecentAuditLogs(User user) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.ADMIN);
        return adminAuditService.getRecentLogs();
    }

    @Transactional(readOnly = true)
    public PublicUserProfileDTO getPublicUserProfile(long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserStats stats = buildUserStats(user);
        GamificationService.ProgressSnapshot gamification = gamificationService.getSnapshot(user);

        return new PublicUserProfileDTO(
            user.getId(),
            user.getPseudo(),
            user.getRole().name(),
            user.getBio(),
            user.getProfileImageUrl(),
            gamification.xp(),
            gamification.level(),
            gamification.levelTitle(),
            gamification.badges(),
            stats.storyCount(),
            stats.chapterCount(),
            stats.commentCount()
        );
    }

    @Transactional
    public AdminUserOverviewDTO banUserTemporarily(User user, long targetUserId, TemporaryBanRequest request) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.ADMIN);

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found."));

        target.setBannedPermanently(false);
        target.setBannedUntil(LocalDateTime.now().plusDays(request.durationDays()));
        target.setBanReason(request.reason().trim());

        adminAuditService.log(
            authenticated,
            "USER_BAN_TEMPORARY",
            "USER",
            target.getId(),
            "durationDays=" + request.durationDays() + ", reason=" + request.reason().trim()
        );

        return toAdminUserOverview(userRepository.save(target));
    }

    @Transactional
    public AdminUserOverviewDTO banUserPermanently(User user, long targetUserId, PermanentBanRequest request) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.ADMIN);

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found."));

        target.setBannedPermanently(true);
        target.setBannedUntil(null);
        target.setBanReason(request.reason().trim());

        adminAuditService.log(
            authenticated,
            "USER_BAN_PERMANENT",
            "USER",
            target.getId(),
            "reason=" + request.reason().trim()
        );

        return toAdminUserOverview(userRepository.save(target));
    }

    @Transactional
    public AdminUserOverviewDTO unbanUser(User user, long targetUserId) {
        User authenticated = requireAuthenticated(user);
        ensureRole(authenticated, UserRole.ADMIN);

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found."));

        target.setBannedPermanently(false);
        target.setBannedUntil(null);
        target.setBanReason(null);

        adminAuditService.log(
            authenticated,
            "USER_UNBAN",
            "USER",
            target.getId(),
            "ban lifted"
        );

        return toAdminUserOverview(userRepository.save(target));
    }

    private User requireAuthenticated(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        return user;
    }

    private void ensureRole(User user, UserRole requiredRole) {
        if (user.getRole() != requiredRole && user.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("This action requires role " + requiredRole + ".");
        }
    }

    private AdminUserOverviewDTO toAdminUserOverview(User user) {
        UserStats stats = buildUserStats(user);
        GamificationService.ProgressSnapshot gamification = gamificationService.getSnapshot(user);

        return new AdminUserOverviewDTO(
            user.getId(),
            user.getPseudo(),
            user.getEmail(),
            user.getRole().name(),
            resolveAccountStatus(user),
            user.getBannedUntil(),
            user.getBanReason(),
            gamification.xp(),
            gamification.level(),
            gamification.levelTitle(),
            gamification.badges(),
            user.getCreatedAt(),
            stats.storyCount(),
            stats.chapterCount(),
            stats.commentCount()
        );
    }

    private String resolveAccountStatus(User user) {
        if (user.isBannedPermanently()) {
            return "BANNED_PERMANENT";
        }

        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(LocalDateTime.now())) {
            return "BANNED_TEMPORARY";
        }

        return "ACTIVE";
    }

    private UserStats buildUserStats(User user) {
        long storyCount = storyRepository.countByAuthorId(user.getId());
        long chapterCount = chapterRepository.countByStoryAuthorId(user.getId());
        long commentCount = commentRepository.countByUserId(user.getId());
        return new UserStats(storyCount, chapterCount, commentCount);
    }

    private record UserStats(
        long storyCount,
        long chapterCount,
        long commentCount
    ) {
    }
}

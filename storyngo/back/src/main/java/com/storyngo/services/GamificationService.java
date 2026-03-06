package com.storyngo.services;

import com.storyngo.dto.LeaderboardEntryDTO;
import com.storyngo.dto.LeaderboardPeriod;
import com.storyngo.dto.UserXpEventDTO;
import com.storyngo.dto.WeeklyLeaderboardEntryDTO;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.models.UserProgress;
import com.storyngo.models.UserRole;
import com.storyngo.models.UserXpEvent;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.CommentRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserProgressRepository;
import com.storyngo.repositories.UserXpEventRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GamificationService {

    private final UserProgressRepository userProgressRepository;
    private final UserXpEventRepository userXpEventRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final CommentRepository commentRepository;

    public GamificationService(
        UserProgressRepository userProgressRepository,
        UserXpEventRepository userXpEventRepository,
        StoryRepository storyRepository,
        ChapterRepository chapterRepository,
        CommentRepository commentRepository
    ) {
        this.userProgressRepository = userProgressRepository;
        this.userXpEventRepository = userXpEventRepository;
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public ProgressSnapshot awardXp(User user, String action, int deltaXp, String referenceType, Long referenceId) {
        UserProgress progress = ensureProgress(user);

        UserXpEvent event = UserXpEvent.builder()
            .user(user)
            .action(action)
            .deltaXp(deltaXp)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .createdAt(LocalDateTime.now())
            .build();
        userXpEventRepository.save(Objects.requireNonNull(event));

        progress.setXp(Math.max(0, progress.getXp() + deltaXp));
        int level = computeLevel(progress.getXp());
        progress.setLevel(level);
        progress.setLevelTitle(resolveLevelTitle(level));
        progress.setUpdatedAt(LocalDateTime.now());

        UserProgress saved = userProgressRepository.save(progress);
        return toSnapshot(saved, user);
    }

    @Transactional
    public ProgressSnapshot getSnapshot(User user) {
        UserProgress progress = ensureProgress(user);
        return toSnapshot(progress, user);
    }

    @Transactional(readOnly = true)
    public List<WeeklyLeaderboardEntryDTO> getWeeklyLeaderboard(int limit) {
        return getLeaderboard(LeaderboardPeriod.WEEK, limit)
            .stream()
            .map(entry -> new WeeklyLeaderboardEntryDTO(
                entry.userId(),
                entry.pseudo(),
                entry.periodXp(),
                entry.level(),
                entry.levelTitle()
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDTO> getLeaderboard(LeaderboardPeriod period, int limit) {
        int boundedLimit = Math.max(1, Math.min(limit, 50));
        LocalDateTime since = resolvePeriodStart(period);

        return userXpEventRepository.getLeaderboardRows(since)
            .stream()
            .limit(boundedLimit)
            .map(row -> {
                Long userId = (Long) row[0];
                String pseudo = (String) row[1];
                String role = String.valueOf(row[2]);
                int periodXp = ((Number) row[3]).intValue();
                int level = computeLevelFromCurrentTotal(userId);
                return new LeaderboardEntryDTO(userId, pseudo, role, periodXp, level, resolveLevelTitle(level));
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UserXpEventDTO> getXpHistory(User user, int limit) {
        int boundedLimit = Math.max(1, Math.min(limit, 100));
        return userXpEventRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .limit(boundedLimit)
            .map(event -> new UserXpEventDTO(
                event.getId(),
                event.getAction(),
                event.getDeltaXp(),
                event.getReferenceType(),
                event.getReferenceId(),
                event.getCreatedAt()
            ))
            .toList();
    }

    private LocalDateTime resolvePeriodStart(LeaderboardPeriod period) {
        LocalDate today = LocalDate.now();
        return switch (period) {
            case MONTH -> today.withDayOfMonth(1).atStartOfDay();
            case WEEK -> today.with(DayOfWeek.MONDAY).atStartOfDay();
        };
    }

    @Transactional
    public UserProgress ensureProgress(User user) {
        return userProgressRepository.findByUserId(user.getId())
            .orElseGet(() -> {
                int initialXp = bootstrapXpFromExistingData(user.getId());
                int level = computeLevel(initialXp);
                UserProgress created = UserProgress.builder()
                    .user(user)
                    .xp(initialXp)
                    .level(level)
                    .levelTitle(resolveLevelTitle(level))
                    .updatedAt(LocalDateTime.now())
                    .build();
                return userProgressRepository.save(Objects.requireNonNull(created));
            });
    }

    private ProgressSnapshot toSnapshot(UserProgress progress, User user) {
        long storyCount = storyRepository.countByAuthorId(user.getId());
        long chapterCount = chapterRepository.countByStoryAuthorId(user.getId());
        long commentCount = commentRepository.countByUserId(user.getId());
        long publishedStoryCount = storyRepository.countByAuthorIdAndStatus(user.getId(), StoryStatus.PUBLISHED);
        long accountAgeDays = user.getCreatedAt() == null
            ? 0
            : Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), LocalDate.now()));

        List<String> badges = computeBadges(user.getRole(), storyCount, chapterCount, commentCount, publishedStoryCount, accountAgeDays);

        return new ProgressSnapshot(progress.getXp(), progress.getLevel(), progress.getLevelTitle(), badges);
    }

    private List<String> computeBadges(
        UserRole role,
        long storyCount,
        long chapterCount,
        long commentCount,
        long publishedStoryCount,
        long accountAgeDays
    ) {
        List<String> badges = new ArrayList<>();
        if (publishedStoryCount >= 1) {
            badges.add("Ecrivain Emergent");
        }
        if (chapterCount >= 10) {
            badges.add("Plume Reguliere");
        }
        if (chapterCount >= 100) {
            badges.add("Plume Legendaire");
        }
        if (commentCount >= 100) {
            badges.add("Voix de la Communaute");
        }
        if (accountAgeDays >= 30) {
            badges.add("Explorateur");
        }
        if (accountAgeDays >= 90 && storyCount >= 5 && commentCount >= 20) {
            badges.add("Pilier StorynGo");
        }
        if (role == UserRole.REVIEWER) {
            badges.add("Oeil Critique");
        }
        if (role == UserRole.ADMIN) {
            badges.add("Gardien du Forum");
        }
        return badges;
    }

    private int bootstrapXpFromExistingData(Long userId) {
        long storyCount = storyRepository.countByAuthorId(userId);
        long chapterCount = chapterRepository.countByStoryAuthorId(userId);
        long commentCount = commentRepository.countByUserId(userId);
        long publishedCount = storyRepository.countByAuthorIdAndStatus(userId, StoryStatus.PUBLISHED);

        long computed = storyCount * 120L + chapterCount * 35L + commentCount * 10L + publishedCount * 80L;
        return (int) Math.min(Integer.MAX_VALUE, computed);
    }

    private int computeLevelFromCurrentTotal(Long userId) {
        UserProgress progress = userProgressRepository.findByUserId(userId).orElse(null);
        if (progress != null) {
            return progress.getLevel();
        }
        int xp = userXpEventRepository.sumXpByUserId(userId);
        return computeLevel(xp);
    }

    private int computeLevel(int xp) {
        return (int) Math.floor(Math.sqrt(Math.max(0, xp) / 100.0)) + 1;
    }

    private String resolveLevelTitle(int level) {
        return switch (level) {
            case 1, 2 -> "Novice";
            case 3, 4 -> "Conteur";
            case 5, 6 -> "Auteur";
            case 7, 8 -> "Maitre Conteur";
            default -> "Legende StorynGo";
        };
    }

    public record ProgressSnapshot(int xp, int level, String levelTitle, List<String> badges) {
    }
}

package com.storyngo.services;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.ChapterUpdateRequest;
import com.storyngo.dto.ChapterVersionDTO;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.dto.StoryLikesDTO;
import com.storyngo.dto.StoryQualityScoreDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.ChapterMapper;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.ChapterVersion;
import com.storyngo.models.Story;
import com.storyngo.models.StoryLike;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.models.Vote;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.ChapterVersionRepository;
import com.storyngo.repositories.CommentRepository;
import com.storyngo.repositories.StoryLikeRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.storyngo.services.StoryPermissionService.StoryAction.ADD_CHAPTER;
import static com.storyngo.services.StoryPermissionService.StoryAction.APPROVE_REVIEW;
import static com.storyngo.services.StoryPermissionService.StoryAction.ARCHIVE;
import static com.storyngo.services.StoryPermissionService.StoryAction.EDIT_CHAPTER;
import static com.storyngo.services.StoryPermissionService.StoryAction.REJECT_REVIEW;
import static com.storyngo.services.StoryPermissionService.StoryAction.RESTORE_CHAPTER_VERSION;
import static com.storyngo.services.StoryPermissionService.StoryAction.SUBMIT_FOR_REVIEW;

@Service
public class StoryService {

    private static final int FIRST_CHAPTER_VOTE_THRESHOLD = 5;
    private static final int VOTE_THRESHOLD_DECREMENT = 5;
    private static final int MIN_VOTE_THRESHOLD = 5;
    private static final int FIRST_CHAPTER_CHAR_LIMIT = 2000;
    private static final int CHAR_LIMIT_INCREMENT = 1000;
    private static final int COMPLETENESS_MAX = 40;
    private static final int STATUS_MAX = 25;
    private static final int ENGAGEMENT_MAX = 35;

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterVersionRepository chapterVersionRepository;
    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;
    private final ChapterMapper chapterMapper;
    private final ModerationService moderationService;
    private final StoryPermissionService storyPermissionService;
    private final GamificationService gamificationService;
    private final StoryLikeRepository storyLikeRepository;

    public StoryService(
            StoryRepository storyRepository,
            ChapterRepository chapterRepository,
            ChapterVersionRepository chapterVersionRepository,
            VoteRepository voteRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            StoryLikeRepository storyLikeRepository,
            StoryMapper storyMapper,
            ChapterMapper chapterMapper,
            ModerationService moderationService,
            StoryPermissionService storyPermissionService,
            GamificationService gamificationService) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.chapterVersionRepository = chapterVersionRepository;
        this.voteRepository = voteRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.storyLikeRepository = storyLikeRepository;
        this.storyMapper = storyMapper;
        this.chapterMapper = chapterMapper;
        this.moderationService = moderationService;
        this.storyPermissionService = storyPermissionService;
        this.gamificationService = gamificationService;
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getStories() {
        return storyRepository.findByStatusOrderByCreatedAtDesc(StoryStatus.PUBLISHED)
                .stream()
                .map(this::toStoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public StoryDetailsDTO getStoryDetails(Long id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        List<Chapter> orderedChapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(id);
        validateChapterOrderIntegrity(orderedChapters);

        List<ChapterDTO> chapters = orderedChapters
                .stream()
                .map(chapter -> {
                    long voteCount = voteRepository.countByChapterId(chapter.getId());
                    boolean isUnlocked = voteCount >= chapter.getVoteThreshold();
                    return chapterMapper.toDto(chapter, voteCount, isUnlocked);
                })
                .toList();

        return new StoryDetailsDTO(toStoryDto(story), chapters);
    }

    @Transactional
    public boolean voteForChapter(Long userId, Long chapterId) {
        if (voteRepository.existsByUserIdAndChapterId(userId, chapterId)) {
            throw new ConflictException("Vote already exists for this user and chapter.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found."));

        Vote vote = Vote.builder()
                .user(user)
                .chapter(chapter)
                .build();

        voteRepository.save(vote);
        gamificationService.awardXp(user, "VOTE_CHAPTER", 3, "CHAPTER", chapterId);

        long voteCount = voteRepository.countByChapterId(chapterId);
        return voteCount >= chapter.getVoteThreshold();
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getTrendingStories() {
        return storyRepository.findTrendingStoriesByStatus(StoryStatus.PUBLISHED)
                .stream()
                .map(this::toStoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChapterDTO> getUpcomingChapters() {
        return chapterRepository.findChaptersNearVoteThreshold()
                .stream()
                .map(chapter -> {
                    long voteCount = voteRepository.countByChapterId(chapter.getId());
                    boolean isUnlocked = voteCount >= chapter.getVoteThreshold();
                    return chapterMapper.toDto(chapter, voteCount, isUnlocked);
                })
                .toList();
    }

    @Transactional
    public StoryDetailsDTO createStory(User author, StoryCreateRequest request) {
        if (author == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        moderationService.validateContent(request.title());
        moderationService.validateContent(request.summary());
        moderationService.validateContent(request.content());

        Story story = Story.builder()
                .title(request.title())
                .summary(request.summary())
                .author(author)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        Story savedStory = storyRepository.save(story);

        Chapter chapter = Chapter.builder()
                .story(savedStory)
                .content(request.content())
                .orderIndex(1)
                .isAnonymous(request.isAnonymous())
                .voteThreshold(FIRST_CHAPTER_VOTE_THRESHOLD)
                .charLimit(FIRST_CHAPTER_CHAR_LIMIT)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        enforceCharLimit(chapter.getContent(), chapter.getCharLimit());
        Chapter savedChapter = chapterRepository.save(chapter);
        createVersionSnapshot(savedChapter);

        StoryDTO storyDto = toStoryDto(savedStory);
        ChapterDTO chapterDto = chapterMapper.toDto(savedChapter, 0L, false);

        gamificationService.awardXp(author, "CREATE_STORY", 80, "STORY", savedStory.getId());
        gamificationService.awardXp(author, "CREATE_CHAPTER", 35, "CHAPTER", savedChapter.getId());
        return new StoryDetailsDTO(storyDto, java.util.List.of(chapterDto));
    }

    @Transactional
    public ChapterDTO addChapter(User author, Long storyId, ChapterCreateRequest request) {
        if (author == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        moderationService.validateContent(request.content());

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        storyPermissionService.assertCan(author, story, ADD_CHAPTER);

        List<Chapter> orderedChapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(storyId);
        if (orderedChapters.isEmpty()) {
            throw new ConflictException("Story has no chapters.");
        }
        validateChapterOrderIntegrity(orderedChapters);

        boolean hasLockedChapter = orderedChapters.stream()
                .anyMatch(chapter -> voteRepository.countByChapterId(chapter.getId()) < chapter.getVoteThreshold());
        if (hasLockedChapter) {
            throw new ConflictException("All previous chapters must be unlocked.");
        }

        Chapter lastChapter = orderedChapters.get(orderedChapters.size() - 1);

        int nextOrder = lastChapter.getOrderIndex() + 1;
        int nextThreshold = Math.max(MIN_VOTE_THRESHOLD, lastChapter.getVoteThreshold() - VOTE_THRESHOLD_DECREMENT);
        int nextCharLimit = lastChapter.getCharLimit() + CHAR_LIMIT_INCREMENT;

        enforceCharLimit(request.content(), nextCharLimit);

        Chapter chapter = Chapter.builder()
                .story(story)
                .content(request.content())
                .orderIndex(nextOrder)
                .isAnonymous(request.isAnonymous())
                .voteThreshold(nextThreshold)
                .charLimit(nextCharLimit)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        Chapter saved = chapterRepository.save(chapter);
        createVersionSnapshot(saved);
        gamificationService.awardXp(author, "ADD_CHAPTER", 35, "CHAPTER", saved.getId());
        return chapterMapper.toDto(saved, 0L, false);
    }

    @Transactional
    public ChapterDTO updateChapter(User user, Long chapterId, ChapterUpdateRequest request) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        moderationService.validateContent(request.content());

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found."));
        Story story = chapter.getStory();

        storyPermissionService.assertCan(user, story, EDIT_CHAPTER);

        List<Chapter> orderedChapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(story.getId());
        validateChapterOrderIntegrity(orderedChapters);

        enforceCharLimit(request.content(), chapter.getCharLimit());
        chapter.setContent(request.content());
        chapter.setIsAnonymous(request.isAnonymous());

        Chapter savedChapter = chapterRepository.save(chapter);
        createVersionSnapshot(savedChapter);

        long voteCount = voteRepository.countByChapterId(savedChapter.getId());
        boolean isUnlocked = voteCount >= savedChapter.getVoteThreshold();
        return chapterMapper.toDto(savedChapter, voteCount, isUnlocked);
    }

    @Transactional(readOnly = true)
    public List<ChapterVersionDTO> getChapterVersions(Long chapterId) {
        chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found."));

        return chapterVersionRepository.findByChapterIdOrderByVersionNumberDesc(chapterId)
                .stream()
                .map(version -> new ChapterVersionDTO(
                        version.getId(),
                        version.getChapter().getId(),
                        version.getVersionNumber(),
                        version.getContent(),
                        version.getCreatedAt()))
                .toList();
    }

    @Transactional
    public ChapterDTO restoreChapterVersion(User user, Long chapterId, Long versionId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found."));
        Story story = chapter.getStory();

        storyPermissionService.assertCan(user, story, RESTORE_CHAPTER_VERSION);

        ChapterVersion version = chapterVersionRepository.findByIdAndChapterId(versionId, chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter version not found."));

        chapter.setContent(version.getContent());
        Chapter savedChapter = chapterRepository.save(chapter);
        createVersionSnapshot(savedChapter);

        long voteCount = voteRepository.countByChapterId(savedChapter.getId());
        boolean isUnlocked = voteCount >= savedChapter.getVoteThreshold();
        return chapterMapper.toDto(savedChapter, voteCount, isUnlocked);
    }

    @Transactional
    public StoryDTO submitStoryForReview(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        storyPermissionService.assertCan(user, story, SUBMIT_FOR_REVIEW);

        story.setStatus(StoryStatus.IN_REVIEW);
        Story saved = storyRepository.save(story);
        gamificationService.awardXp(user, "SUBMIT_REVIEW", 12, "STORY", saved.getId());
        return toStoryDto(saved);
    }

    @Transactional
    public StoryDTO approveStoryReview(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        storyPermissionService.assertCan(user, story, APPROVE_REVIEW);

        story.setStatus(StoryStatus.PUBLISHED);
        Story saved = storyRepository.save(story);
        gamificationService.awardXp(user, "APPROVE_REVIEW", 25, "STORY", saved.getId());
        return toStoryDto(saved);
    }

    @Transactional
    public StoryDTO rejectStoryReview(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        storyPermissionService.assertCan(user, story, REJECT_REVIEW);

        story.setStatus(StoryStatus.DRAFT);
        Story saved = storyRepository.save(story);
        gamificationService.awardXp(user, "REJECT_REVIEW", 8, "STORY", saved.getId());
        return toStoryDto(saved);
    }

    @Transactional
    public StoryDTO archiveStory(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        storyPermissionService.assertCan(user, story, ARCHIVE);

        story.setStatus(StoryStatus.ARCHIVED);
        Story saved = storyRepository.save(story);
        gamificationService.awardXp(user, "ARCHIVE_STORY", 5, "STORY", saved.getId());
        return toStoryDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getStoriesByAuthor(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        return storyRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toStoryDto)
                .toList();
    }

    @Transactional
    public void likeStory(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        if (storyLikeRepository.existsByUserIdAndStoryId(user.getId(), storyId)) {
            throw new ConflictException("You have already liked this story.");
        }

        StoryLike like = StoryLike.builder()
                .user(user)
                .story(story)
                .build();

        storyLikeRepository.save(like);
        gamificationService.awardXp(user, "LIKE_STORY", 2, "STORY", storyId);
    }

    @Transactional
    public void unlikeStory(User user, Long storyId) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        StoryLike existingLike = storyLikeRepository.findByUserIdAndStoryId(user.getId(), storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Like not found."));

        storyLikeRepository.delete(existingLike);
    }

    @Transactional(readOnly = true)
    public long getStoryLikeCount(Long storyId) {
        return storyLikeRepository.countByStoryId(storyId);
    }

    @Transactional(readOnly = true)
    public boolean hasUserLikedStory(Long userId, Long storyId) {
        return storyLikeRepository.existsByUserIdAndStoryId(userId, storyId);
    }

    @Transactional(readOnly = true)
    public StoryLikesDTO getStoryLikes(Long storyId, User user) {
        storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        long likeCount = storyLikeRepository.countByStoryId(storyId);
        boolean likedByMe = user != null && storyLikeRepository.existsByUserIdAndStoryId(user.getId(), storyId);
        return new StoryLikesDTO(likeCount, likedByMe);
    }

    @Transactional(readOnly = true)
    public StoryQualityScoreDTO getStoryQualityScore(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        int chapterCount = chapterRepository.findByStoryIdOrderByOrderIndexAsc(storyId).size();
        long voteCount = voteRepository.countByStoryId(storyId);
        long commentCount = commentRepository.countByStoryId(storyId);

        int completenessScore = Math.min(COMPLETENESS_MAX, chapterCount * 10);
        int statusScore = switch (story.getStatus()) {
            case DRAFT -> 5;
            case IN_REVIEW -> 15;
            case PUBLISHED -> STATUS_MAX;
            case ARCHIVED -> 20;
            default -> 0;
        };
        int engagementRaw = (int) (voteCount * 2 + commentCount * 3);
        int engagementScore = Math.min(ENGAGEMENT_MAX, engagementRaw);
        int totalScore = Math.min(100, completenessScore + statusScore + engagementScore);

        return new StoryQualityScoreDTO(
                story.getId(),
                story.getStatus(),
                totalScore,
                completenessScore,
                statusScore,
                engagementScore,
                chapterCount,
                voteCount,
                commentCount);
    }

    private void enforceCharLimit(String content, int charLimit) {
        if (content != null && content.length() > charLimit) {
            throw new IllegalArgumentException("Content exceeds the character limit.");
        }
    }

    private void createVersionSnapshot(Chapter chapter) {
        int nextVersion = (int) chapterVersionRepository.countByChapterId(chapter.getId()) + 1;
        ChapterVersion snapshot = ChapterVersion.builder()
                .chapter(chapter)
                .versionNumber(nextVersion)
                .content(chapter.getContent())
                .createdAt(java.time.LocalDateTime.now())
                .build();
        chapterVersionRepository.save(snapshot);
    }

    private void validateChapterOrderIntegrity(List<Chapter> orderedChapters) {
        for (int i = 0; i < orderedChapters.size(); i++) {
            int expected = i + 1;
            Integer actual = orderedChapters.get(i).getOrderIndex();
            if (actual == null || actual != expected) {
                throw new ConflictException(
                        "Chapter order is inconsistent. Expected chapter order index " + expected + ".");
            }
        }
    }

    private StoryDTO toStoryDto(Story story) {
        StoryDTO dto = storyMapper.toDto(story);
        int likeCount = Math.toIntExact(storyLikeRepository.countByStoryId(story.getId()));

        return new StoryDTO(
                dto.id(),
                dto.title(),
                dto.summary(),
                dto.authorName(),
                dto.createdAt(),
                dto.authorRole(),
                dto.authorProfileImageUrl(),
                dto.chapterCount(),
                dto.status(),
                likeCount,
                dto.likedByMe());
    }
}

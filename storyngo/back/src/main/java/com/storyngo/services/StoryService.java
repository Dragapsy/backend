package com.storyngo.services;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.ChapterMapper;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.Story;
import com.storyngo.models.User;
import com.storyngo.models.Vote;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoryService {

    private static final int FIRST_CHAPTER_VOTE_THRESHOLD = 20;
    private static final int VOTE_THRESHOLD_DECREMENT = 5;
    private static final int MIN_VOTE_THRESHOLD = 5;
    private static final int FIRST_CHAPTER_CHAR_LIMIT = 2000;
    private static final int CHAR_LIMIT_INCREMENT = 1000;

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;
    private final ChapterMapper chapterMapper;
    private final ModerationService moderationService;

    public StoryService(
        StoryRepository storyRepository,
        ChapterRepository chapterRepository,
        VoteRepository voteRepository,
        UserRepository userRepository,
        StoryMapper storyMapper,
        ChapterMapper chapterMapper,
        ModerationService moderationService
    ) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.storyMapper = storyMapper;
        this.chapterMapper = chapterMapper;
        this.moderationService = moderationService;
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getStories() {
        return storyRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(storyMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public StoryDetailsDTO getStoryDetails(Long id) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Story not found."));

        List<ChapterDTO> chapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(id)
            .stream()
            .map(chapter -> {
                long voteCount = voteRepository.countByChapterId(chapter.getId());
                boolean isUnlocked = voteCount >= chapter.getVoteThreshold();
                return chapterMapper.toDto(chapter, voteCount, isUnlocked);
            })
            .toList();

        return new StoryDetailsDTO(storyMapper.toDto(story), chapters);
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

        long voteCount = voteRepository.countByChapterId(chapterId);
        return voteCount >= chapter.getVoteThreshold();
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getTrendingStories() {
        return storyRepository.findTrendingStories()
            .stream()
            .map(storyMapper::toDto)
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

        StoryDTO storyDto = storyMapper.toDto(savedStory);
        ChapterDTO chapterDto = chapterMapper.toDto(savedChapter, 0L, false);
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

        if (story.getAuthor() == null || !story.getAuthor().getId().equals(author.getId())) {
            throw new ForbiddenOperationException("Only the story author can add a chapter.");
        }

        Chapter lastChapter = chapterRepository.findByStoryIdOrderByOrderIndexAsc(storyId)
            .stream()
            .reduce((first, second) -> second)
            .orElseThrow(() -> new ConflictException("Story has no chapters."));

        long lastVotes = voteRepository.countByChapterId(lastChapter.getId());
        if (lastVotes < lastChapter.getVoteThreshold()) {
            throw new ConflictException("Previous chapter is not unlocked.");
        }

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
        return chapterMapper.toDto(saved, 0L, false);
    }

    private void enforceCharLimit(String content, int charLimit) {
        if (content != null && content.length() > charLimit) {
            throw new IllegalArgumentException("Content exceeds the character limit.");
        }
    }
}

package com.storyngo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.ChapterUpdateRequest;
import com.storyngo.dto.ChapterVersionDTO;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryQualityScoreDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.ChapterMapper;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.ChapterVersion;
import com.storyngo.models.Story;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.ChapterVersionRepository;
import com.storyngo.repositories.CommentRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.storyngo.services.GamificationService;

@ExtendWith(MockitoExtension.class)
class StoryServiceTests {

    @Mock
    private StoryRepository storyRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private ChapterVersionRepository chapterVersionRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StoryMapper storyMapper;

    @Mock
    private ChapterMapper chapterMapper;

    @Mock
    private GamificationService gamificationService;

    private StoryService storyService;

    @BeforeEach
    void setUp() {
        storyService = new StoryService(
            storyRepository,
            chapterRepository,
            chapterVersionRepository,
            voteRepository,
            commentRepository,
            userRepository,
            storyMapper,
            chapterMapper,
            new ModerationService(),
            new StoryPermissionService(),
            gamificationService
        );
    }

    @Test
    void voteForChapter_rejectsDuplicateVote() {
        when(voteRepository.existsByUserIdAndChapterId(10L, 20L)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> storyService.voteForChapter(10L, 20L));

        assertEquals("Vote already exists for this user and chapter.", ex.getMessage());
        verify(voteRepository, never()).save(any());
    }

    @Test
    void voteForChapter_returnsTrueWhenThresholdReached() {
        User user = User.builder().id(1L).build();
        Chapter chapter = Chapter.builder().id(2L).voteThreshold(5).build();

        when(voteRepository.existsByUserIdAndChapterId(1L, 2L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(chapterRepository.findById(2L)).thenReturn(Optional.of(chapter));
        when(voteRepository.countByChapterId(2L)).thenReturn(5L);

        boolean unlocked = storyService.voteForChapter(1L, 2L);

        assertTrue(unlocked);
        verify(voteRepository).save(any());
    }

    @Test
    void createStory_requiresAuthenticatedUser() {
        StoryCreateRequest request = new StoryCreateRequest("Titre", "Resume", "Contenu", false);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> storyService.createStory(null, request));

        assertEquals("Authenticated user is required.", ex.getMessage());
    }

    @Test
    void addChapter_rejectsContentOverLimit() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).build();
        Chapter last = Chapter.builder()
            .id(200L)
            .orderIndex(1)
            .voteThreshold(20)
            .charLimit(2000)
            .build();

        String tooLongContent = "x".repeat(3001);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(100L)).thenReturn(List.of(last));
        when(voteRepository.countByChapterId(200L)).thenReturn(20L);

        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> storyService.addChapter(author, 100L, new ChapterCreateRequest(tooLongContent, true))
        );

        assertEquals("Content exceeds the character limit.", ex.getMessage());
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void addChapter_rejectsWhenAnyPreviousChapterIsLocked() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).build();

        Chapter chapter1 = Chapter.builder()
            .id(201L)
            .orderIndex(1)
            .voteThreshold(20)
            .charLimit(2000)
            .build();

        Chapter chapter2 = Chapter.builder()
            .id(202L)
            .orderIndex(2)
            .voteThreshold(15)
            .charLimit(3000)
            .build();

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(100L)).thenReturn(List.of(chapter1, chapter2));
        when(voteRepository.countByChapterId(201L)).thenReturn(19L);

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.addChapter(author, 100L, new ChapterCreateRequest("suite", false))
        );

        assertEquals("All previous chapters must be unlocked.", ex.getMessage());
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void addChapter_usesMinThresholdAndIncrementsLimit() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).build();
        Chapter last = Chapter.builder()
            .id(200L)
            .orderIndex(1)
            .voteThreshold(5)
            .charLimit(4000)
            .build();

        Chapter saved = Chapter.builder()
            .id(201L)
            .orderIndex(2)
            .voteThreshold(5)
            .charLimit(5000)
            .content("suite")
            .build();
        ChapterDTO mapped = new ChapterDTO(201L, "suite", 2, null, 0L, 5, 5000, false);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(100L)).thenReturn(List.of(last));
        when(voteRepository.countByChapterId(200L)).thenReturn(5L);
        when(chapterVersionRepository.countByChapterId(201L)).thenReturn(0L);
        when(chapterRepository.save(any(Chapter.class))).thenReturn(saved);
        when(chapterMapper.toDto(saved, 0L, false)).thenReturn(mapped);

        ChapterDTO result = storyService.addChapter(author, 100L, new ChapterCreateRequest("suite", false));

        ArgumentCaptor<Chapter> captor = ArgumentCaptor.forClass(Chapter.class);
        verify(chapterRepository).save(captor.capture());
        Chapter created = captor.getValue();

        assertEquals(2, created.getOrderIndex());
        assertEquals(5, created.getVoteThreshold());
        assertEquals(5000, created.getCharLimit());
        assertEquals(2, result.orderIndex());
        assertEquals(5, result.threshold());
        assertEquals(5000, result.charLimit());
    }

    @Test
    void submitStoryForReview_updatesStatusToInReview() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).status(StoryStatus.DRAFT).build();
        StoryDTO mapped = new StoryDTO(100L, "Titre", "Resume", "Auteur", null, null, 0, StoryStatus.IN_REVIEW);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storyMapper.toDto(any(Story.class))).thenReturn(mapped);

        StoryDTO result = storyService.submitStoryForReview(author, 100L);

        assertEquals(StoryStatus.IN_REVIEW, story.getStatus());
        assertEquals(StoryStatus.IN_REVIEW, result.status());
    }

    @Test
    void submitStoryForReview_rejectsWhenUserIsNotAuthor() {
        User author = User.builder().id(1L).build();
        User intruder = User.builder().id(2L).build();
        Story story = Story.builder().id(100L).author(author).status(StoryStatus.DRAFT).build();

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));

        ForbiddenOperationException ex = assertThrows(
            ForbiddenOperationException.class,
            () -> storyService.submitStoryForReview(intruder, 100L)
        );

        assertEquals("Only the story author can submit for review.", ex.getMessage());
    }

    @Test
    void addChapter_rejectsWhenStoryIsNotDraft() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).status(StoryStatus.IN_REVIEW).build();

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.addChapter(author, 100L, new ChapterCreateRequest("suite", false))
        );

        assertEquals("Chapters can only be added while story is in DRAFT status.", ex.getMessage());
    }

    @Test
    void approveStoryReview_setsStatusToPublished() {
        User reviewer = User.builder().id(9L).role(com.storyngo.models.UserRole.REVIEWER).build();
        Story story = Story.builder().id(100L).status(StoryStatus.IN_REVIEW).author(User.builder().id(1L).build()).build();
        StoryDTO mapped = new StoryDTO(100L, "Titre", "Resume", "Auteur", null, null, 0, StoryStatus.PUBLISHED);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storyMapper.toDto(any(Story.class))).thenReturn(mapped);

        StoryDTO result = storyService.approveStoryReview(reviewer, 100L);

        assertEquals(StoryStatus.PUBLISHED, story.getStatus());
        assertEquals(StoryStatus.PUBLISHED, result.status());
    }

    @Test
    void rejectStoryReview_setsStatusToDraft() {
        User reviewer = User.builder().id(9L).role(com.storyngo.models.UserRole.REVIEWER).build();
        Story story = Story.builder().id(100L).status(StoryStatus.IN_REVIEW).author(User.builder().id(1L).build()).build();
        StoryDTO mapped = new StoryDTO(100L, "Titre", "Resume", "Auteur", null, null, 0, StoryStatus.DRAFT);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storyMapper.toDto(any(Story.class))).thenReturn(mapped);

        StoryDTO result = storyService.rejectStoryReview(reviewer, 100L);

        assertEquals(StoryStatus.DRAFT, story.getStatus());
        assertEquals(StoryStatus.DRAFT, result.status());
    }

    @Test
    void archiveStory_setsStatusToArchived() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).status(StoryStatus.PUBLISHED).author(author).build();
        StoryDTO mapped = new StoryDTO(100L, "Titre", "Resume", "Auteur", null, null, 0, StoryStatus.ARCHIVED);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storyMapper.toDto(any(Story.class))).thenReturn(mapped);

        StoryDTO result = storyService.archiveStory(author, 100L);

        assertEquals(StoryStatus.ARCHIVED, story.getStatus());
        assertEquals(StoryStatus.ARCHIVED, result.status());
    }

    @Test
    void getChapterVersions_returnsHistoryDescending() {
        Chapter chapter = Chapter.builder().id(40L).build();
        ChapterVersion v2 = ChapterVersion.builder()
            .id(2L)
            .chapter(chapter)
            .versionNumber(2)
            .content("version 2")
            .createdAt(java.time.LocalDateTime.now())
            .build();
        ChapterVersion v1 = ChapterVersion.builder()
            .id(1L)
            .chapter(chapter)
            .versionNumber(1)
            .content("version 1")
            .createdAt(java.time.LocalDateTime.now().minusMinutes(1))
            .build();

        when(chapterRepository.findById(40L)).thenReturn(Optional.of(chapter));
        when(chapterVersionRepository.findByChapterIdOrderByVersionNumberDesc(40L)).thenReturn(List.of(v2, v1));

        List<ChapterVersionDTO> result = storyService.getChapterVersions(40L);

        assertEquals(2, result.size());
        assertEquals(2, result.getFirst().versionNumber());
        assertEquals("version 2", result.getFirst().content());
    }

    @Test
    void restoreChapterVersion_restoresContentAndCreatesNewVersionSnapshot() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(11L).author(author).status(StoryStatus.DRAFT).build();
        Chapter chapter = Chapter.builder()
            .id(40L)
            .story(story)
            .content("current")
            .voteThreshold(10)
            .build();
        ChapterVersion targetVersion = ChapterVersion.builder()
            .id(3L)
            .chapter(chapter)
            .versionNumber(1)
            .content("old content")
            .createdAt(java.time.LocalDateTime.now().minusDays(1))
            .build();
        ChapterDTO mapped = new ChapterDTO(40L, "old content", 1, "Auteur", 4L, 10, 2000, false);

        when(chapterRepository.findById(40L)).thenReturn(Optional.of(chapter));
        when(chapterVersionRepository.findByIdAndChapterId(3L, 40L)).thenReturn(Optional.of(targetVersion));
        when(chapterRepository.save(any(Chapter.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chapterVersionRepository.countByChapterId(40L)).thenReturn(2L);
        when(voteRepository.countByChapterId(40L)).thenReturn(4L);
        when(chapterMapper.toDto(any(Chapter.class), any(Long.class), any(Boolean.class))).thenReturn(mapped);

        ChapterDTO result = storyService.restoreChapterVersion(author, 40L, 3L);

        assertEquals("old content", chapter.getContent());
        assertEquals("old content", result.content());
        verify(chapterVersionRepository).save(any(ChapterVersion.class));
    }

    @Test
    void addChapter_rejectsWhenChapterOrderIsInconsistent() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(100L).author(author).status(StoryStatus.DRAFT).build();
        Chapter chapter1 = Chapter.builder().id(10L).orderIndex(1).voteThreshold(5).charLimit(2000).build();
        Chapter chapter2 = Chapter.builder().id(11L).orderIndex(3).voteThreshold(5).charLimit(3000).build();

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(100L)).thenReturn(List.of(chapter1, chapter2));

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.addChapter(author, 100L, new ChapterCreateRequest("suite", false))
        );

        assertEquals("Chapter order is inconsistent. Expected chapter order index 2.", ex.getMessage());
    }

    @Test
    void updateChapter_updatesContentAndCreatesSnapshot() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(10L).author(author).status(StoryStatus.DRAFT).build();
        Chapter chapter = Chapter.builder()
            .id(40L)
            .story(story)
            .content("old")
            .orderIndex(1)
            .charLimit(2000)
            .voteThreshold(20)
            .build();
        ChapterDTO mapped = new ChapterDTO(40L, "new", 1, "Auteur", 0L, 20, 2000, false);

        when(chapterRepository.findById(40L)).thenReturn(Optional.of(chapter));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(10L)).thenReturn(List.of(chapter));
        when(chapterRepository.save(any(Chapter.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chapterVersionRepository.countByChapterId(40L)).thenReturn(1L);
        when(voteRepository.countByChapterId(40L)).thenReturn(0L);
        when(chapterMapper.toDto(any(Chapter.class), any(Long.class), any(Boolean.class))).thenReturn(mapped);

        ChapterDTO result = storyService.updateChapter(author, 40L, new ChapterUpdateRequest("new", true));

        assertEquals("new", chapter.getContent());
        assertEquals("new", result.content());
        verify(chapterVersionRepository).save(any(ChapterVersion.class));
    }

    @Test
    void updateChapter_rejectsWhenStoryIsNotDraft() {
        User author = User.builder().id(1L).build();
        Story story = Story.builder().id(10L).author(author).status(StoryStatus.IN_REVIEW).build();
        Chapter chapter = Chapter.builder().id(40L).story(story).content("old").orderIndex(1).charLimit(2000).voteThreshold(20).build();

        when(chapterRepository.findById(40L)).thenReturn(Optional.of(chapter));

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.updateChapter(author, 40L, new ChapterUpdateRequest("new", false))
        );

        assertEquals("Chapters can only be edited while story is in DRAFT status.", ex.getMessage());
    }

    @Test
    void getStoryQualityScore_calculatesExpectedComponents() {
        Story story = Story.builder().id(70L).status(StoryStatus.PUBLISHED).build();
        Chapter c1 = Chapter.builder().id(1L).orderIndex(1).build();
        Chapter c2 = Chapter.builder().id(2L).orderIndex(2).build();
        Chapter c3 = Chapter.builder().id(3L).orderIndex(3).build();

        when(storyRepository.findById(70L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(70L)).thenReturn(List.of(c1, c2, c3));
        when(voteRepository.countByStoryId(70L)).thenReturn(6L);
        when(commentRepository.countByStoryId(70L)).thenReturn(4L);

        StoryQualityScoreDTO result = storyService.getStoryQualityScore(70L);

        assertEquals(3, result.chapterCount());
        assertEquals(30, result.completenessScore());
        assertEquals(25, result.statusScore());
        assertEquals(24, result.engagementScore());
        assertEquals(79, result.totalScore());
    }

    @Test
    void getStoryQualityScore_capsEngagementAndTotalAtBounds() {
        Story story = Story.builder().id(80L).status(StoryStatus.PUBLISHED).build();
        List<Chapter> chapters = java.util.stream.IntStream.rangeClosed(1, 8)
            .mapToObj(i -> Chapter.builder().id((long) i).orderIndex(i).build())
            .toList();

        when(storyRepository.findById(80L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(80L)).thenReturn(chapters);
        when(voteRepository.countByStoryId(80L)).thenReturn(100L);
        when(commentRepository.countByStoryId(80L)).thenReturn(100L);

        StoryQualityScoreDTO result = storyService.getStoryQualityScore(80L);

        assertEquals(40, result.completenessScore());
        assertEquals(35, result.engagementScore());
        assertEquals(100, result.totalScore());
    }
}

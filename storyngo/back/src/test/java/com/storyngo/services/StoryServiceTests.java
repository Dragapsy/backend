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
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.ChapterMapper;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.Story;
import com.storyngo.models.User;
import com.storyngo.repositories.ChapterRepository;
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

@ExtendWith(MockitoExtension.class)
class StoryServiceTests {

    @Mock
    private StoryRepository storyRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StoryMapper storyMapper;

    @Mock
    private ChapterMapper chapterMapper;

    private StoryService storyService;

    @BeforeEach
    void setUp() {
        storyService = new StoryService(
            storyRepository,
            chapterRepository,
            voteRepository,
            userRepository,
            storyMapper,
            chapterMapper,
            new ModerationService()
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
            .orderIndex(3)
            .voteThreshold(5)
            .charLimit(4000)
            .build();

        Chapter saved = Chapter.builder()
            .id(201L)
            .orderIndex(4)
            .voteThreshold(5)
            .charLimit(5000)
            .content("suite")
            .build();
        ChapterDTO mapped = new ChapterDTO(201L, "suite", 4, null, 0L, 5, 5000, false);

        when(storyRepository.findById(100L)).thenReturn(Optional.of(story));
        when(chapterRepository.findByStoryIdOrderByOrderIndexAsc(100L)).thenReturn(List.of(last));
        when(voteRepository.countByChapterId(200L)).thenReturn(5L);
        when(chapterRepository.save(any(Chapter.class))).thenReturn(saved);
        when(chapterMapper.toDto(saved, 0L, false)).thenReturn(mapped);

        ChapterDTO result = storyService.addChapter(author, 100L, new ChapterCreateRequest("suite", false));

        ArgumentCaptor<Chapter> captor = ArgumentCaptor.forClass(Chapter.class);
        verify(chapterRepository).save(captor.capture());
        Chapter created = captor.getValue();

        assertEquals(4, created.getOrderIndex());
        assertEquals(5, created.getVoteThreshold());
        assertEquals(5000, created.getCharLimit());
        assertEquals(4, result.orderIndex());
        assertEquals(5, result.threshold());
        assertEquals(5000, result.charLimit());
    }
}

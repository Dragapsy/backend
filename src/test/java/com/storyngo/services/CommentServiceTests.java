package com.storyngo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.storyngo.dto.CommentCreateRequest;
import com.storyngo.dto.CommentDTO;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.models.Chapter;
import com.storyngo.models.Comment;
import com.storyngo.models.User;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.CommentRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CommentServiceTests {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ChapterRepository chapterRepository;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, chapterRepository, new ModerationService());
    }

    @Test
    void addComment_requiresAuthenticatedUser() {
        UnauthorizedException ex = assertThrows(
            UnauthorizedException.class,
            () -> commentService.addComment(null, 10L, new CommentCreateRequest("Salut"))
        );

        assertEquals("Authenticated user is required.", ex.getMessage());
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void addComment_rejectsWhenChapterNotFound() {
        User user = User.builder().id(1L).pseudo("lecteur").build();
        when(chapterRepository.findById(20L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
            ResourceNotFoundException.class,
            () -> commentService.addComment(user, 20L, new CommentCreateRequest("message"))
        );

        assertEquals("Chapter not found.", ex.getMessage());
    }

    @Test
    void addComment_rejectsForbiddenContent() {
        User user = User.builder().id(1L).pseudo("lecteur").build();

        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> commentService.addComment(user, 20L, new CommentCreateRequest("mot interdit"))
        );

        assertEquals("Content contains a forbidden term.", ex.getMessage());
    }

    @Test
    void addComment_mapsSavedCommentToDto() {
        User user = User.builder().id(1L).pseudo("lecteur").build();
        Chapter chapter = Chapter.builder().id(20L).build();
        LocalDateTime now = LocalDateTime.now();
        Comment saved = Comment.builder()
            .id(99L)
            .user(user)
            .chapter(chapter)
            .content("Bien joue")
            .createdAt(now)
            .build();

        when(chapterRepository.findById(20L)).thenReturn(Optional.of(chapter));
        when(commentRepository.save(any(Comment.class))).thenReturn(saved);

        CommentDTO result = commentService.addComment(user, 20L, new CommentCreateRequest("Bien joue"));

        assertEquals(99L, result.id());
        assertEquals("Bien joue", result.content());
        assertEquals("lecteur", result.authorName());
        assertEquals(now, result.createdAt());
    }
}

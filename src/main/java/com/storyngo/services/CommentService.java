package com.storyngo.services;

import com.storyngo.dto.CommentCreateRequest;
import com.storyngo.dto.CommentDTO;
import com.storyngo.models.Chapter;
import com.storyngo.models.Comment;
import com.storyngo.models.User;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.CommentRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ChapterRepository chapterRepository;
    private final ModerationService moderationService;

    public CommentService(
        CommentRepository commentRepository,
        ChapterRepository chapterRepository,
        ModerationService moderationService
    ) {
        this.commentRepository = commentRepository;
        this.chapterRepository = chapterRepository;
        this.moderationService = moderationService;
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getComments(Long chapterId) {
        return commentRepository.findByChapterIdOrderByCreatedAtAsc(chapterId)
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public CommentDTO addComment(User user, Long chapterId, CommentCreateRequest request) {
        if (user == null) {
            throw new IllegalStateException("Authenticated user is required.");
        }
        moderationService.validate(request.content());

        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new IllegalArgumentException("Chapter not found."));

        Comment comment = Comment.builder()
            .chapter(chapter)
            .user(user)
            .content(request.content())
            .createdAt(LocalDateTime.now())
            .build();

        Comment saved = commentRepository.save(comment);
        return toDto(saved);
    }

    private CommentDTO toDto(Comment comment) {
        return new CommentDTO(
            comment.getId(),
            comment.getContent(),
            comment.getUser() != null ? comment.getUser().getPseudo() : null,
            comment.getCreatedAt()
        );
    }
}


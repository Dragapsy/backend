package com.storyngo.repositories;

import com.storyngo.models.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByChapterIdOrderByCreatedAtAsc(Long chapterId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.chapter.story.id = :storyId")
    long countByStoryId(Long storyId);
}


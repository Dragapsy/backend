package com.storyngo.repositories;

import com.storyngo.models.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByChapterIdOrderByCreatedAtAsc(Long chapterId);
}


package com.storyngo.repositories;

import com.storyngo.models.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    long countByChapterId(Long chapterId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.chapter.story.id = :storyId")
    long countByStoryId(Long storyId);

    boolean existsByUserIdAndChapterId(Long userId, Long chapterId);
}


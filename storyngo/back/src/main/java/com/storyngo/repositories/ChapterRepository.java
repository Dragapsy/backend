package com.storyngo.repositories;

import com.storyngo.models.Chapter;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByStoryIdOrderByOrderIndexAsc(Long storyId);

    long countByStoryAuthorId(Long authorId);

    @Query(
        "SELECT c FROM Chapter c " +
        "LEFT JOIN Vote v ON v.chapter = c " +
        "GROUP BY c " +
        "HAVING COUNT(v) >= (c.voteThreshold * 0.8) AND COUNT(v) < c.voteThreshold"
    )
    List<Chapter> findChaptersNearVoteThreshold();
}


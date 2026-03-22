package com.storyngo.repositories;

import com.storyngo.models.Story;
import com.storyngo.models.StoryStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByCreatedAtDesc();

    List<Story> findByStatusOrderByCreatedAtDesc(StoryStatus status);

    List<Story> findByAuthorIdInOrderByCreatedAtDesc(List<Long> authorIds);

    List<Story> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<Story> findByAuthorIdAndStatusOrderByCreatedAtDesc(Long authorId, StoryStatus status);

    List<Story> findByAuthorIdInAndStatusOrderByCreatedAtDesc(List<Long> authorIds, StoryStatus status);

    long countByAuthorId(Long authorId);

    long countByAuthorIdAndStatus(Long authorId, StoryStatus status);

    @Query(
        "SELECT s FROM Story s " +
        "LEFT JOIN s.chapters c " +
        "LEFT JOIN Vote v ON v.chapter = c " +
        "WHERE s.status = :status " +
        "GROUP BY s " +
        "ORDER BY COUNT(v) DESC"
    )
    List<Story> findTrendingStoriesByStatus(StoryStatus status);
}

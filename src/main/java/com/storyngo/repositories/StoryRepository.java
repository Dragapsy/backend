package com.storyngo.repositories;

import com.storyngo.models.Story;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByCreatedAtDesc();

    @Query(
        "SELECT s FROM Story s " +
        "LEFT JOIN s.chapters c " +
        "LEFT JOIN Vote v ON v.chapter = c " +
        "GROUP BY s " +
        "ORDER BY COUNT(v) DESC"
    )
    List<Story> findTrendingStories();
}

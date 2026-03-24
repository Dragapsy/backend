package com.storyngo.repositories;

import com.storyngo.models.StoryBookmark;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryBookmarkRepository extends JpaRepository<StoryBookmark, Long> {

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);

    Optional<StoryBookmark> findByUserIdAndStoryId(Long userId, Long storyId);

    List<StoryBookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
}

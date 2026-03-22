package com.storyngo.repositories;

import com.storyngo.models.StoryLike;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryLikeRepository extends JpaRepository<StoryLike, Long> {

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);

    long countByStoryId(Long storyId);

    Optional<StoryLike> findByUserIdAndStoryId(Long userId, Long storyId);
}
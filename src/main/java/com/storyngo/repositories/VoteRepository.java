package com.storyngo.repositories;

import com.storyngo.models.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    long countByChapterId(Long chapterId);

    boolean existsByUserIdAndChapterId(Long userId, Long chapterId);
}


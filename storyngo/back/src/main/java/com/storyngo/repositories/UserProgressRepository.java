package com.storyngo.repositories;

import com.storyngo.models.UserProgress;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findByUserId(Long userId);
}

package com.storyngo.repositories;

import com.storyngo.models.Story;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, Long> {

    List<Story> findAllByOrderByCreatedAtDesc();
}


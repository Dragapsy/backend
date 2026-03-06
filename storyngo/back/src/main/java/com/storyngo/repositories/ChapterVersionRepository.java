package com.storyngo.repositories;

import com.storyngo.models.ChapterVersion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChapterVersionRepository extends JpaRepository<ChapterVersion, Long> {

    List<ChapterVersion> findByChapterIdOrderByVersionNumberDesc(Long chapterId);

    long countByChapterId(Long chapterId);

    Optional<ChapterVersion> findByIdAndChapterId(Long id, Long chapterId);
}
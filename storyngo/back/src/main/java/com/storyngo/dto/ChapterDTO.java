package com.storyngo.dto;

public record ChapterDTO(
    Long id,
    String content,
    Integer orderIndex,
    String authorName,
    long voteCount,
    Integer threshold,
    Integer charLimit,
    boolean isUnlocked
) {
}


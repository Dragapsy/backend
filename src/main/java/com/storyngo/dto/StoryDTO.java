package com.storyngo.dto;

public record StoryDTO(
    Long id,
    String title,
    String summary,
    String authorName,
    int chapterCount
) {
}


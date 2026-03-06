package com.storyngo.dto;

import java.util.List;

public record PublicUserProfileDTO(
    Long id,
    String pseudo,
    String role,
    String bio,
    String profileImageUrl,
    int xp,
    int level,
    String levelTitle,
    List<String> badges,
    long storyCount,
    long chapterCount,
    long commentCount
) {
}

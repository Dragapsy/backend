package com.storyngo.dto;

public record LeaderboardEntryDTO(
    Long userId,
    String pseudo,
    String role,
    int periodXp,
    int level,
    String levelTitle
) {
}

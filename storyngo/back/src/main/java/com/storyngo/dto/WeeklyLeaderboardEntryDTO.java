package com.storyngo.dto;

public record WeeklyLeaderboardEntryDTO(
    Long userId,
    String pseudo,
    int weeklyXp,
    int level,
    String levelTitle
) {
}

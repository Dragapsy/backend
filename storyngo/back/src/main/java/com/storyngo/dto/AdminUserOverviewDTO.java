package com.storyngo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminUserOverviewDTO(
    Long id,
    String pseudo,
    String email,
    String role,
    String accountStatus,
    LocalDateTime banUntil,
    String banReason,
    int xp,
    int level,
    String levelTitle,
    List<String> badges,
    LocalDateTime createdAt,
    long storyCount,
    long chapterCount,
    long commentCount
) {
}

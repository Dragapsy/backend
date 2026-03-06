package com.storyngo.dto;

import java.time.LocalDateTime;

public record UserXpEventDTO(
    Long id,
    String action,
    int deltaXp,
    String referenceType,
    Long referenceId,
    LocalDateTime createdAt
) {
}

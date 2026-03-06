package com.storyngo.dto;

import java.time.LocalDateTime;

public record AdminAuditLogDTO(
    Long id,
    String adminPseudo,
    String action,
    String targetType,
    Long targetId,
    String details,
    LocalDateTime createdAt
) {
}

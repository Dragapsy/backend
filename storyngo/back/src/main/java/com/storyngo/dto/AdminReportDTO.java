package com.storyngo.dto;

import java.time.LocalDateTime;

public record AdminReportDTO(
    Long id,
    String reporterPseudo,
    Long targetId,
    String type,
    String reason,
    String status,
    String priority,
    LocalDateTime createdAt,
    LocalDateTime resolvedAt,
    String resolvedByPseudo,
    String resolutionNote
) {
}

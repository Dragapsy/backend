package com.storyngo.dto;

import java.util.List;

public record ReviewerDashboardDTO(
    List<StoryDTO> pendingStories,
    List<StoryDTO> validatedStories,
    List<AdminReportDTO> flaggedReports
) {
}

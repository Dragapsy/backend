package com.storyngo.dto;

import java.util.List;

public record StoryDetailsDTO(
    StoryDTO story,
    List<ChapterDTO> chapters
) {
}


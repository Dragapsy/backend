package com.storyngo.controllers;

import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.VoteResultDTO;
import com.storyngo.models.User;
import com.storyngo.services.StoryService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping("/stories")
    public List<StoryDTO> getStories() {
        return storyService.getStories();
    }

    @GetMapping("/stories/trending")
    public List<StoryDTO> getTrendingStories() {
        return storyService.getTrendingStories();
    }

    @GetMapping("/stories/upcoming")
    public List<ChapterDTO> getUpcomingChapters() {
        return storyService.getUpcomingChapters();
    }

    @PostMapping("/chapters/{id}/vote")
    public VoteResultDTO voteForChapter(@AuthenticationPrincipal Object principal, @PathVariable Long id) {
        Long userId = extractUserId(principal);
        boolean unlocked = storyService.voteForChapter(userId, id);
        return new VoteResultDTO(unlocked);
    }

    private Long extractUserId(Object principal) {
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Authenticated user id is not available.");
    }
}

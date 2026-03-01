package com.storyngo.services;

import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.StoryDTO;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.mappers.ChapterMapper;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.Story;
import com.storyngo.models.User;
import com.storyngo.models.Vote;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;
    private final ChapterMapper chapterMapper;

    public StoryService(
        StoryRepository storyRepository,
        ChapterRepository chapterRepository,
        VoteRepository voteRepository,
        UserRepository userRepository,
        StoryMapper storyMapper,
        ChapterMapper chapterMapper
    ) {
        this.storyRepository = storyRepository;
        this.chapterRepository = chapterRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.storyMapper = storyMapper;
        this.chapterMapper = chapterMapper;
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getStories() {
        return storyRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(storyMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public StoryDetailsDTO getStoryDetails(Long id) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Story not found."));

        List<ChapterDTO> chapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(id)
            .stream()
            .map(chapter -> {
                long voteCount = voteRepository.countByChapterId(chapter.getId());
                boolean isUnlocked = voteCount >= chapter.getVoteThreshold();
                return chapterMapper.toDto(chapter, voteCount, isUnlocked);
            })
            .toList();

        return new StoryDetailsDTO(storyMapper.toDto(story), chapters);
    }

    @Transactional
    public boolean voteForChapter(Long userId, Long chapterId) {
        if (voteRepository.existsByUserIdAndChapterId(userId, chapterId)) {
            throw new IllegalStateException("Vote already exists for this user and chapter.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new IllegalArgumentException("Chapter not found."));

        Vote vote = Vote.builder()
            .user(user)
            .chapter(chapter)
            .build();

        voteRepository.save(vote);

        long voteCount = voteRepository.countByChapterId(chapterId);
        return voteCount >= chapter.getVoteThreshold();
    }
}


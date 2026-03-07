package com.storyngo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.storyngo.dto.ChapterCreateRequest;
import com.storyngo.dto.ChapterDTO;
import com.storyngo.dto.StoryCreateRequest;
import com.storyngo.dto.StoryDetailsDTO;
import com.storyngo.dto.StoryQualityScoreDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.models.Chapter;
import com.storyngo.models.Story;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.models.UserRole;
import com.storyngo.models.Vote;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=never"
})
@ActiveProfiles("test")
@Transactional
class StoryServiceIntegrationTests {

    @Autowired
    private StoryService storyService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Test
    void createStory_savesStoryAndFirstChapter() {
        User author = userRepository.save(User.builder()
            .pseudo("AuteurB1")
            .email("auteur.b1@storyngo.dev")
            .password("password")
            .createdAt(LocalDateTime.now())
            .build());

        StoryCreateRequest request = new StoryCreateRequest(
            "Titre B1",
            "Resume B1",
            "Contenu chapitre initial",
            false
        );

        StoryDetailsDTO result = storyService.createStory(author, request);

        assertEquals("Titre B1", result.story().title());

        List<Story> stories = storyRepository.findAll();
        assertEquals(1, stories.size());

        List<Chapter> chapters = chapterRepository.findByStoryIdOrderByOrderIndexAsc(stories.getFirst().getId());
        assertEquals(1, chapters.size());
        assertEquals(1, chapters.getFirst().getOrderIndex());
        assertEquals(5, chapters.getFirst().getVoteThreshold());
        assertEquals(2000, chapters.getFirst().getCharLimit());
    }

    @Test
    void addChapter_rejectsWhenPreviousChapterThresholdNotReached() {
        User author = userRepository.save(User.builder()
            .pseudo("AuteurB2A")
            .email("auteur.b2a@storyngo.dev")
            .password("password")
            .createdAt(LocalDateTime.now())
            .build());

        Story story = storyRepository.save(Story.builder()
            .title("Story B2A")
            .summary("Resume")
            .author(author)
            .createdAt(LocalDateTime.now())
            .build());

        Chapter previous = chapterRepository.save(Chapter.builder()
            .story(story)
            .content("Chapitre 1")
            .orderIndex(1)
            .isAnonymous(false)
            .voteThreshold(5)
            .charLimit(2000)
            .createdAt(LocalDateTime.now())
            .build());

        User voter = userRepository.save(User.builder()
            .pseudo("VoterB2A")
            .email("voter.b2a@storyngo.dev")
            .password("password")
            .createdAt(LocalDateTime.now())
            .build());

        voteRepository.save(Vote.builder().user(voter).chapter(previous).build());

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.addChapter(author, story.getId(), new ChapterCreateRequest("Suite", false))
        );

        assertEquals("All previous chapters must be unlocked.", ex.getMessage());
    }

    @Test
    void addChapter_incrementsOrder_lowersThreshold_and_increasesCharLimit() {
        User author = userRepository.save(User.builder()
            .pseudo("AuteurB2B")
            .email("auteur.b2b@storyngo.dev")
            .password("password")
            .createdAt(LocalDateTime.now())
            .build());

        Story story = storyRepository.save(Story.builder()
            .title("Story B2B")
            .summary("Resume")
            .author(author)
            .createdAt(LocalDateTime.now())
            .build());

        Chapter previous = chapterRepository.save(Chapter.builder()
            .story(story)
            .content("Chapitre 1")
            .orderIndex(1)
            .isAnonymous(false)
            .voteThreshold(10)
            .charLimit(3000)
            .createdAt(LocalDateTime.now())
            .build());

        for (int i = 0; i < 10; i++) {
            User voter = userRepository.save(User.builder()
                .pseudo("VoterB2B" + i)
                .email("voter.b2b." + i + "@storyngo.dev")
                .password("password")
                .createdAt(LocalDateTime.now())
                .build());
            voteRepository.save(Vote.builder().user(voter).chapter(previous).build());
        }

        ChapterDTO created = storyService.addChapter(author, story.getId(), new ChapterCreateRequest("Nouveau chapitre", true));

        assertEquals(2, created.orderIndex());
        assertEquals(5, created.threshold());
        assertEquals(4000, created.charLimit());
        assertFalse(created.isUnlocked());
    }

    @Test
    void workflow_fullCycle_submitApproveArchive_andScore() {
        User author = userRepository.save(User.builder()
            .pseudo("AuteurWF")
            .email("auteur.wf@storyngo.dev")
            .password("password")
            .role(UserRole.USER)
            .createdAt(LocalDateTime.now())
            .build());

        User reviewer = userRepository.save(User.builder()
            .pseudo("ReviewerWF")
            .email("reviewer.wf@storyngo.dev")
            .password("password")
            .role(UserRole.REVIEWER)
            .createdAt(LocalDateTime.now())
            .build());

        StoryDetailsDTO created = storyService.createStory(
            author,
            new StoryCreateRequest("Story WF", "Resume WF", "Contenu initial", false)
        );
        Long storyId = created.story().id();

        assertEquals(StoryStatus.DRAFT, storyRepository.findById(storyId).orElseThrow().getStatus());

        storyService.submitStoryForReview(author, storyId);
        assertEquals(StoryStatus.IN_REVIEW, storyRepository.findById(storyId).orElseThrow().getStatus());

        storyService.approveStoryReview(reviewer, storyId);
        assertEquals(StoryStatus.PUBLISHED, storyRepository.findById(storyId).orElseThrow().getStatus());

        storyService.archiveStory(author, storyId);
        assertEquals(StoryStatus.ARCHIVED, storyRepository.findById(storyId).orElseThrow().getStatus());

        StoryQualityScoreDTO score = storyService.getStoryQualityScore(storyId);
        assertEquals(storyId, score.storyId());
        assertEquals(StoryStatus.ARCHIVED, score.status());
        assertFalse(score.totalScore() < 0);
    }

    @Test
    void workflow_rejectsChapterUpdateOutsideDraft() {
        User author = userRepository.save(User.builder()
            .pseudo("AuteurGuard")
            .email("auteur.guard@storyngo.dev")
            .password("password")
            .role(UserRole.USER)
            .createdAt(LocalDateTime.now())
            .build());

        Story story = storyRepository.save(Story.builder()
            .title("Story Guard")
            .summary("Resume")
            .author(author)
            .status(StoryStatus.IN_REVIEW)
            .createdAt(LocalDateTime.now())
            .build());

        Chapter chapter = chapterRepository.save(Chapter.builder()
            .story(story)
            .content("Old")
            .orderIndex(1)
            .isAnonymous(false)
            .voteThreshold(20)
            .charLimit(2000)
            .createdAt(LocalDateTime.now())
            .build());

        ConflictException ex = assertThrows(
            ConflictException.class,
            () -> storyService.updateChapter(author, chapter.getId(), new com.storyngo.dto.ChapterUpdateRequest("New", false))
        );

        assertEquals("Chapters can only be edited while story is in DRAFT status.", ex.getMessage());
    }
}

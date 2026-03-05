package com.storyngo.controllers;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyngo.models.Chapter;
import com.storyngo.models.Story;
import com.storyngo.models.User;
import com.storyngo.security.JwtUtils;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import com.storyngo.repositories.VoteRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StoryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void createStory_returns401_whenUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/stories")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StoryPayload("Titre", "Resume", "Contenu valide", false))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createStory_returns400_whenPayloadInvalid() throws Exception {
        User user = createUser("author-v400", "author-v400@test.dev");

        mockMvc.perform(post("/api/stories")
                .header("Authorization", bearer(user))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StoryPayload("", "", "", false))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void vote_returns409_whenVoteAlreadyExists() throws Exception {
        User author = createUser("author-v409", "author-v409@test.dev");
        User voter = createUser("voter-v409", "voter-v409@test.dev");
        Story story = storyRepository.save(Story.builder()
            .title("Story")
            .summary("Resume")
            .author(author)
            .createdAt(LocalDateTime.now())
            .build());
        Chapter chapter = chapterRepository.save(Chapter.builder()
            .story(story)
            .content("Chapitre 1")
            .orderIndex(1)
            .isAnonymous(false)
            .voteThreshold(20)
            .charLimit(2000)
            .createdAt(LocalDateTime.now())
            .build());

        mockMvc.perform(post("/api/chapters/" + chapter.getId() + "/vote")
                .header("Authorization", bearer(voter)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/chapters/" + chapter.getId() + "/vote")
                .header("Authorization", bearer(voter)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Vote already exists for this user and chapter."));
    }

    @Test
    void getStoryDetails_returns404_whenStoryNotFound() throws Exception {
        mockMvc.perform(get("/api/stories/999999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("Story not found."));
    }

    @Test
    void addChapter_returns403_whenUserIsNotAuthor() throws Exception {
        User author = createUser("author-v403", "author-v403@test.dev");
        User intruder = createUser("intruder-v403", "intruder-v403@test.dev");
        Story story = storyRepository.save(Story.builder()
            .title("Story")
            .summary("Resume")
            .author(author)
            .createdAt(LocalDateTime.now())
            .build());
        chapterRepository.save(Chapter.builder()
            .story(story)
            .content("Chapitre 1")
            .orderIndex(1)
            .isAnonymous(false)
            .voteThreshold(20)
            .charLimit(2000)
            .createdAt(LocalDateTime.now())
            .build());

        mockMvc.perform(post("/api/stories/" + story.getId() + "/chapters")
                .header("Authorization", bearer(intruder))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ChapterPayload("Suite du texte", false))))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("Only the story author can add a chapter."));
    }

    @Test
    void createStory_returns201_whenAuthorizedAndValid() throws Exception {
        User user = createUser("author-v201", "author-v201@test.dev");

        mockMvc.perform(post("/api/stories")
                .header("Authorization", bearer(user))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new StoryPayload("Titre", "Resume", "Contenu valide", false))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.story.title").value("Titre"));
    }

    private User createUser(String pseudo, String email) {
        return userRepository.save(User.builder()
            .pseudo(pseudo)
            .email(email)
            .password(passwordEncoder.encode("password123"))
            .createdAt(LocalDateTime.now())
            .build());
    }

    private String bearer(User user) {
        return "Bearer " + jwtUtils.generateToken(user);
    }

    private record StoryPayload(String title, String summary, String content, boolean isAnonymous) {
    }

    private record ChapterPayload(String content, boolean isAnonymous) {
    }
}

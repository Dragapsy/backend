package com.storyngo.controllers;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storyngo.models.User;
import com.storyngo.repositories.UserRepository;
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
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void register_returns201_whenPayloadIsValid() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterPayload("Pseudo", "mail@test.dev", "password123"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void register_returns400_whenPayloadIsInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterPayload("", "bad-mail", "123"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void register_returns409_onDuplicateEmail() throws Exception {
        userRepository.save(User.builder()
            .pseudo("existing")
            .email("mail@test.dev")
            .password(passwordEncoder.encode("password123"))
            .createdAt(LocalDateTime.now())
            .build());

        mockMvc.perform(post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterPayload("Pseudo", "mail@test.dev", "password123"))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Email already in use."));
    }

    @Test
    void login_returns401_onInvalidCredentials() throws Exception {
        userRepository.save(User.builder()
            .pseudo("existing")
            .email("mail@test.dev")
            .password(passwordEncoder.encode("password123"))
            .createdAt(LocalDateTime.now())
            .build());

        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginPayload("mail@test.dev", "wrong-password"))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid credentials."));
    }

    private record RegisterPayload(String pseudo, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }
}

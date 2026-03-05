package com.storyngo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.storyngo.dto.AuthResponse;
import com.storyngo.dto.LoginRequest;
import com.storyngo.dto.RegisterRequest;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.UserMapper;
import com.storyngo.models.User;
import com.storyngo.repositories.UserRepository;
import com.storyngo.security.JwtUtils;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        JwtUtils jwtUtils = new JwtUtils("change-this-secret-to-32-bytes-minimum", 3_600_000L);
        authService = new AuthService(userRepository, userMapper, passwordEncoder, jwtUtils);
    }

    @Test
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Pseudo", "mail@test.dev", "secret");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(request));

        assertEquals("Email already in use.", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_hashesPassword_andReturnsAuthResponse() {
        RegisterRequest request = new RegisterRequest("Pseudo", "mail@test.dev", "plain-password");
        User mapped = User.builder().pseudo(request.pseudo()).email(request.email()).password("plain-password").build();
        User saved = User.builder().id(1L).pseudo(request.pseudo()).email(request.email()).password("hashed").build();

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByPseudo(request.pseudo())).thenReturn(false);
        when(userMapper.toUser(request)).thenReturn(mapped);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed");
        when(userRepository.save(mapped)).thenReturn(saved);
        when(userMapper.toAuthResponse(any(User.class), any(String.class))).thenAnswer(invocation -> new AuthResponse(invocation.getArgument(1)));

        AuthResponse result = authService.register(request);

        assertNotNull(result.token());
        assertEquals("hashed", mapped.getPassword());
        assertNotNull(mapped.getCreatedAt());
    }

    @Test
    void login_rejectsWhenPasswordDoesNotMatch() {
        LoginRequest request = new LoginRequest("mail@test.dev", "bad-password");
        User existing = User.builder().email(request.email()).password("stored-hash").build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches(request.password(), existing.getPassword())).thenReturn(false);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.login(request));

        assertEquals("Invalid credentials.", ex.getMessage());
        verify(userMapper, never()).toAuthResponse(any(User.class), any(String.class));
    }
}

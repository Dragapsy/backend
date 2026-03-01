package com.storyngo.services;

import com.storyngo.dto.AuthResponse;
import com.storyngo.dto.LoginRequest;
import com.storyngo.dto.RegisterRequest;
import com.storyngo.mappers.UserMapper;
import com.storyngo.models.User;
import com.storyngo.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        if (userRepository.existsByPseudo(request.pseudo())) {
            throw new IllegalArgumentException("Pseudo already in use.");
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return userMapper.toAuthResponse(saved, generateToken());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials.");
        }

        return userMapper.toAuthResponse(user, generateToken());
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}


package com.storyngo.services;

import com.storyngo.dto.AuthResponse;
import com.storyngo.dto.LoginRequest;
import com.storyngo.dto.RegisterRequest;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.mappers.UserMapper;
import com.storyngo.models.User;
import com.storyngo.repositories.UserRepository;
import com.storyngo.security.JwtUtils;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use.");
        }
        if (userRepository.existsByPseudo(request.pseudo())) {
            throw new ConflictException("Pseudo already in use.");
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return userMapper.toAuthResponse(saved, jwtUtils.generateToken(saved));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials.");
        }

        return userMapper.toAuthResponse(user, jwtUtils.generateToken(user));
    }
}

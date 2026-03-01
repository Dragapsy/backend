package com.storyngo.security;

import com.storyngo.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtils(
        @Value("${security.jwt.secret:change-this-secret-to-32-bytes-minimum}") String secret,
        @Value("${security.jwt.expiration-ms:3600000}") long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
            .setSubject(String.valueOf(user.getId()))
            .setIssuedAt(now)
            .setExpiration(expiry)
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}


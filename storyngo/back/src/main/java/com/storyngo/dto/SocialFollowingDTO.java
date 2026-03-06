package com.storyngo.dto;

public record SocialFollowingDTO(
    Long userId,
    String pseudo,
    String role,
    String profileImageUrl,
    String bio
) {
}

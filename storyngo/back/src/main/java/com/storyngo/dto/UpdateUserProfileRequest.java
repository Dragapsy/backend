package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "Mise a jour du profil utilisateur")
public record UpdateUserProfileRequest(
    @Schema(description = "Pseudo public", example = "AymaneWriter")
    @Size(min = 3, max = 30, message = "pseudo must contain between 3 and 30 characters")
    String pseudo,

    @Schema(description = "Bio utilisateur", example = "Auteur de fantasy collaborative")
    @Size(max = 1000, message = "bio must not exceed 1000 characters")
    String bio,

    @Schema(description = "URL de photo de profil", example = "https://cdn.storyngo.dev/profiles/aymane.png")
    @Size(max = 500, message = "profileImageUrl must not exceed 500 characters")
    String profileImageUrl
) {
}

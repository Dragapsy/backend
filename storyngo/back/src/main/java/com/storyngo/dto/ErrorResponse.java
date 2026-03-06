package com.storyngo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload d'erreur standard")
public record ErrorResponse(
    @Schema(description = "Message d'erreur metier ou technique", example = "Story not found.")
    String error
) {
}


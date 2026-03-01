package com.storyngo.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class ModerationServiceTests {

    private final ModerationService moderationService = new ModerationService();

    @Test
    void validate_allowsCleanContent() {
        assertDoesNotThrow(() -> moderationService.validate("texte normal"));
    }

    @Test
    void validate_rejectsForbiddenWord() {
        assertThrows(IllegalArgumentException.class, () -> moderationService.validate("mot interdit"));
    }
}


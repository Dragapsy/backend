package com.storyngo.services;

import org.springframework.stereotype.Service;

@Service
public class ModerationService {

    public void validateContent(String content) {
        if (content == null) {
            return;
        }
        if (content.toLowerCase().contains("interdit")) {
            throw new IllegalArgumentException("Content contains a forbidden term.");
        }
    }

    // Backward-compatible alias for existing callers/tests.
    public void validate(String content) {
        validateContent(content);
    }
}


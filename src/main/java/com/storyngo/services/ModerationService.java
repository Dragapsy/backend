package com.storyngo.services;

import org.springframework.stereotype.Service;

@Service
public class ModerationService {

    public void validate(String content) {
        if (content == null) {
            return;
        }
        if (content.toLowerCase().contains("interdit")) {
            throw new IllegalArgumentException("Content contains a forbidden term.");
        }
    }
}


package com.storyngo.models;

public enum StoryStatus {
    DRAFT,
    IN_REVIEW,
    PUBLISHED,
    ARCHIVED;

    public boolean canTransitionTo(StoryStatus target) {
        return switch (this) {
            case DRAFT -> target == IN_REVIEW;
            case IN_REVIEW -> target == PUBLISHED || target == DRAFT;
            case PUBLISHED -> target == ARCHIVED;
            case ARCHIVED -> false;
        };
    }
}
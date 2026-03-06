package com.storyngo.services;

import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.models.Story;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.models.UserRole;
import org.springframework.stereotype.Service;

@Service
public class StoryPermissionService {

    public enum StoryAction {
        ADD_CHAPTER,
        EDIT_CHAPTER,
        SUBMIT_FOR_REVIEW,
        APPROVE_REVIEW,
        REJECT_REVIEW,
        ARCHIVE,
        RESTORE_CHAPTER_VERSION
    }

    public void assertCan(User user, Story story, StoryAction action) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        UserRole role = user.getRole() == null ? UserRole.USER : user.getRole();
        StoryStatus status = story.getStatus() == null ? StoryStatus.DRAFT : story.getStatus();
        boolean isAuthor = story.getAuthor() != null && story.getAuthor().getId().equals(user.getId());

        if (role == UserRole.ADMIN) {
            return;
        }

        switch (action) {
            case ADD_CHAPTER -> assertCanAddChapter(role, isAuthor, status);
            case EDIT_CHAPTER -> assertCanEditChapter(isAuthor, status);
            case SUBMIT_FOR_REVIEW -> assertCanSubmitForReview(isAuthor, status);
            case APPROVE_REVIEW -> assertCanReview(role, status, "approve");
            case REJECT_REVIEW -> assertCanReview(role, status, "reject");
            case ARCHIVE -> assertCanArchive(isAuthor, status);
            case RESTORE_CHAPTER_VERSION -> assertCanRestoreChapterVersion(isAuthor, status);
            default -> throw new ForbiddenOperationException("Action is not allowed.");
        }
    }

    private void assertCanAddChapter(UserRole role, boolean isAuthor, StoryStatus status) {
        if (status != StoryStatus.DRAFT) {
            throw new ConflictException("Chapters can only be added while story is in DRAFT status.");
        }
        if (!isAuthor) {
            throw new ForbiddenOperationException("Only the story author can add a chapter.");
        }
        if (role != UserRole.USER && role != UserRole.REVIEWER) {
            throw new ForbiddenOperationException("Only author roles can add a chapter.");
        }
    }

    private void assertCanSubmitForReview(boolean isAuthor, StoryStatus status) {
        if (status != StoryStatus.DRAFT) {
            throw new ConflictException("Story cannot be submitted for review from status " + status + ".");
        }
        if (!isAuthor) {
            throw new ForbiddenOperationException("Only the story author can submit for review.");
        }
    }

    private void assertCanEditChapter(boolean isAuthor, StoryStatus status) {
        if (status != StoryStatus.DRAFT) {
            throw new ConflictException("Chapters can only be edited while story is in DRAFT status.");
        }
        if (!isAuthor) {
            throw new ForbiddenOperationException("Only the story author can edit a chapter.");
        }
    }

    private void assertCanReview(UserRole role, StoryStatus status, String actionVerb) {
        if (status != StoryStatus.IN_REVIEW) {
            throw new ConflictException("Story cannot be " + actionVerb + "ed from status " + status + ".");
        }
        if (role != UserRole.REVIEWER) {
            throw new ForbiddenOperationException("Only reviewers can " + actionVerb + " stories.");
        }
    }

    private void assertCanArchive(boolean isAuthor, StoryStatus status) {
        if (status != StoryStatus.PUBLISHED) {
            throw new ConflictException("Story cannot be archived from status " + status + ".");
        }
        if (!isAuthor) {
            throw new ForbiddenOperationException("Only the story author can archive this story.");
        }
    }

    private void assertCanRestoreChapterVersion(boolean isAuthor, StoryStatus status) {
        if (status != StoryStatus.DRAFT) {
            throw new ConflictException("Chapter versions can only be restored while story is in DRAFT status.");
        }
        if (!isAuthor) {
            throw new ForbiddenOperationException("Only the story author can restore chapter versions.");
        }
    }
}

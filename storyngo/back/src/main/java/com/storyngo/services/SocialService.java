package com.storyngo.services;

import com.storyngo.dto.SocialFollowingDTO;
import com.storyngo.dto.StoryDTO;
import com.storyngo.exceptions.ConflictException;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.mappers.StoryMapper;
import com.storyngo.models.FollowRelation;
import com.storyngo.models.StoryStatus;
import com.storyngo.models.User;
import com.storyngo.repositories.FollowRelationRepository;
import com.storyngo.repositories.StoryRepository;
import com.storyngo.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocialService {

    private final FollowRelationRepository followRelationRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final StoryMapper storyMapper;

    public SocialService(
        FollowRelationRepository followRelationRepository,
        UserRepository userRepository,
        StoryRepository storyRepository,
        StoryMapper storyMapper
    ) {
        this.followRelationRepository = followRelationRepository;
        this.userRepository = userRepository;
        this.storyRepository = storyRepository;
        this.storyMapper = storyMapper;
    }

    @Transactional
    @SuppressWarnings("null")
    public void followUser(User follower, long targetUserId) {
        if (follower.getId() != null && follower.getId() == targetUserId) {
            throw new ForbiddenOperationException("You cannot follow yourself.");
        }

        User target = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found."));

        if (followRelationRepository.existsByFollowerIdAndFollowingId(follower.getId(), target.getId())) {
            throw new ConflictException("Already following this user.");
        }

        followRelationRepository.save(Objects.requireNonNull(FollowRelation.builder()
            .follower(follower)
            .following(target)
            .createdAt(LocalDateTime.now())
            .build()));
    }

    @Transactional
    public void unfollowUser(User follower, long targetUserId) {
        followRelationRepository.deleteByFollowerIdAndFollowingId(follower.getId(), targetUserId);
    }

    @Transactional(readOnly = true)
    public List<SocialFollowingDTO> getFollowing(User follower) {
        return followRelationRepository.findByFollowerIdOrderByCreatedAtDesc(follower.getId())
            .stream()
            .map(relation -> {
                User followed = relation.getFollowing();
                return new SocialFollowingDTO(
                    followed.getId(),
                    followed.getPseudo(),
                    followed.getRole().name(),
                    followed.getProfileImageUrl(),
                    followed.getBio()
                );
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StoryDTO> getPersonalizedFeed(User follower, int limit) {
        int boundedLimit = Math.max(1, Math.min(limit, 50));
        List<Long> followingIds = followRelationRepository.findFollowingIdsByFollowerId(follower.getId());
        if (followingIds.isEmpty()) {
            return List.of();
        }

        return storyRepository.findByAuthorIdInAndStatusOrderByCreatedAtDesc(followingIds, StoryStatus.PUBLISHED)
            .stream()
            .limit(boundedLimit)
            .map(storyMapper::toDto)
            .toList();
    }
}

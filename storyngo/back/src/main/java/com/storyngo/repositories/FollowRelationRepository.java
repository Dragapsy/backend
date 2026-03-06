package com.storyngo.repositories;

import com.storyngo.models.FollowRelation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FollowRelationRepository extends JpaRepository<FollowRelation, Long> {

    Optional<FollowRelation> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    List<FollowRelation> findByFollowerIdOrderByCreatedAtDesc(Long followerId);

    List<FollowRelation> findByFollowingIdOrderByCreatedAtDesc(Long followingId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    @Query("SELECT f.following.id FROM FollowRelation f WHERE f.follower.id = :followerId ORDER BY f.createdAt DESC")
    List<Long> findFollowingIdsByFollowerId(Long followerId);
}

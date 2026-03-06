package com.storyngo.repositories;

import com.storyngo.models.UserXpEvent;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserXpEventRepository extends JpaRepository<UserXpEvent, Long> {

    List<UserXpEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(e.deltaXp), 0) FROM UserXpEvent e WHERE e.user.id = :userId")
    int sumXpByUserId(Long userId);

    @Query(
        "SELECT e.user.id, e.user.pseudo, e.user.role, COALESCE(SUM(e.deltaXp), 0) " +
        "FROM UserXpEvent e " +
        "WHERE e.createdAt >= :since " +
        "GROUP BY e.user.id, e.user.pseudo, e.user.role " +
        "ORDER BY COALESCE(SUM(e.deltaXp), 0) DESC"
    )
    List<Object[]> getLeaderboardRows(LocalDateTime since);
}

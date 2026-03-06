package com.storyngo.services;

import com.storyngo.dto.AdminAuditLogDTO;
import com.storyngo.models.AdminAuditLog;
import com.storyngo.models.User;
import com.storyngo.repositories.AdminAuditLogRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuditService {

    private final AdminAuditLogRepository adminAuditLogRepository;

    public AdminAuditService(AdminAuditLogRepository adminAuditLogRepository) {
        this.adminAuditLogRepository = adminAuditLogRepository;
    }

    @Transactional
    public void log(User adminUser, String action, String targetType, Long targetId, String details) {
        AdminAuditLog log = AdminAuditLog.builder()
            .adminUser(adminUser)
            .action(action)
            .targetType(targetType)
            .targetId(targetId)
            .details(details)
            .createdAt(LocalDateTime.now())
            .build();
        adminAuditLogRepository.save(Objects.requireNonNull(log));
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogDTO> getRecentLogs() {
        return adminAuditLogRepository.findTop100ByOrderByCreatedAtDesc()
            .stream()
            .map(log -> new AdminAuditLogDTO(
                log.getId(),
                log.getAdminUser() != null ? log.getAdminUser().getPseudo() : null,
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getDetails(),
                log.getCreatedAt()
            ))
            .toList();
    }
}

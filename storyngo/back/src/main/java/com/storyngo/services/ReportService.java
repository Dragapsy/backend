package com.storyngo.services;

import com.storyngo.dto.AdminReportDTO;
import com.storyngo.dto.ReportCreateRequest;
import com.storyngo.dto.UpdateReportStatusRequest;
import com.storyngo.exceptions.ForbiddenOperationException;
import com.storyngo.exceptions.ResourceNotFoundException;
import com.storyngo.exceptions.UnauthorizedException;
import com.storyngo.models.Report;
import com.storyngo.models.ReportPriority;
import com.storyngo.models.ReportStatus;
import com.storyngo.models.User;
import com.storyngo.models.UserRole;
import com.storyngo.repositories.ChapterRepository;
import com.storyngo.repositories.CommentRepository;
import com.storyngo.repositories.ReportRepository;
import com.storyngo.repositories.StoryRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ChapterRepository chapterRepository;
    private final CommentRepository commentRepository;
    private final StoryRepository storyRepository;
    private final AdminAuditService adminAuditService;

    public ReportService(
        ReportRepository reportRepository,
        ChapterRepository chapterRepository,
        CommentRepository commentRepository,
        StoryRepository storyRepository,
        AdminAuditService adminAuditService
    ) {
        this.reportRepository = reportRepository;
        this.chapterRepository = chapterRepository;
        this.commentRepository = commentRepository;
        this.storyRepository = storyRepository;
        this.adminAuditService = adminAuditService;
    }

    @Transactional
    public AdminReportDTO createReport(User reporter, ReportCreateRequest request) {
        if (reporter == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }

        validateTargetExists(request.type().name(), request.targetId() == null ? -1L : request.targetId());

        Report report = Report.builder()
            .reporter(reporter)
            .targetId(request.targetId())
            .type(request.type())
            .reason(request.reason().trim())
            .priority(resolvePriority(request.reason()))
            .status(ReportStatus.OPEN)
            .createdAt(LocalDateTime.now())
            .build();

        Report saved = reportRepository.save(Objects.requireNonNull(report));
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AdminReportDTO> getOpenReports(User user) {
        ensureAdminOrReviewer(user);
        return reportRepository.findByStatusOrderByPriorityDescCreatedAtAsc(ReportStatus.OPEN)
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminReportDTO> getAllReports(User user) {
        ensureAdmin(user);
        return reportRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public AdminReportDTO updateReportStatus(User adminUser, long reportId, UpdateReportStatusRequest request) {
        ensureAdmin(adminUser);

        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found."));

        report.setStatus(request.status());
        report.setResolutionNote(request.resolutionNote() != null ? request.resolutionNote().trim() : null);

        if (request.status() == ReportStatus.RESOLVED || request.status() == ReportStatus.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
            report.setResolvedBy(adminUser);
        } else {
            report.setResolvedAt(null);
            report.setResolvedBy(null);
        }

        Report saved = reportRepository.save(report);
        adminAuditService.log(
            adminUser,
            "REPORT_STATUS_UPDATE",
            "REPORT",
            saved.getId(),
            "Status=" + saved.getStatus() + (saved.getResolutionNote() != null ? ", note=" + saved.getResolutionNote() : "")
        );
        return toDto(saved);
    }

    private void validateTargetExists(String type, long targetId) {
        switch (type) {
            case "STORY" -> storyRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Story target not found."));
            case "CHAPTER" -> chapterRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter target not found."));
            case "COMMENT" -> commentRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment target not found."));
            default -> throw new IllegalArgumentException("Unsupported report target type.");
        }
    }

    private void ensureAdmin(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        if (user.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Admin role is required.");
        }
    }

    private void ensureAdminOrReviewer(User user) {
        if (user == null) {
            throw new UnauthorizedException("Authenticated user is required.");
        }
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.REVIEWER) {
            throw new ForbiddenOperationException("Admin or Reviewer role is required.");
        }
    }

    private ReportPriority resolvePriority(String reason) {
        String normalized = reason == null ? "" : reason.toLowerCase();
        if (normalized.contains("harce") || normalized.contains("menace") || normalized.contains("violence")) {
            return ReportPriority.CRITICAL;
        }
        if (normalized.contains("hate") || normalized.contains("haine") || normalized.contains("spam")) {
            return ReportPriority.HIGH;
        }
        if (normalized.contains("insulte") || normalized.contains("toxic")) {
            return ReportPriority.MEDIUM;
        }
        return ReportPriority.LOW;
    }

    private AdminReportDTO toDto(Report report) {
        return new AdminReportDTO(
            report.getId(),
            report.getReporter() != null ? report.getReporter().getPseudo() : null,
            report.getTargetId(),
            report.getType().name(),
            report.getReason(),
            report.getStatus().name(),
            report.getPriority().name(),
            report.getCreatedAt(),
            report.getResolvedAt(),
            report.getResolvedBy() != null ? report.getResolvedBy().getPseudo() : null,
            report.getResolutionNote()
        );
    }
}

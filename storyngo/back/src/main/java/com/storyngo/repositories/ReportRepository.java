package com.storyngo.repositories;

import com.storyngo.models.Report;
import com.storyngo.models.ReportStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatusOrderByPriorityDescCreatedAtAsc(ReportStatus status);

    List<Report> findAllByOrderByCreatedAtDesc();
}

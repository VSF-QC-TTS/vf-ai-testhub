package vn.vinfast.aitesthub.run.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "runs",
    indexes = {
      @Index(name = "idx_runs_project_id", columnList = "project_id"),
      @Index(name = "idx_runs_dataset_id", columnList = "dataset_id"),
      @Index(name = "idx_runs_target_id", columnList = "target_id"),
      @Index(name = "idx_runs_triggered_by", columnList = "triggered_by"),
      @Index(name = "idx_runs_status", columnList = "status"),
      @Index(name = "idx_runs_project_status", columnList = "project_id, status"),
      @Index(name = "idx_runs_created_at", columnList = "created_at"),
      @Index(name = "idx_runs_dataset_created", columnList = "dataset_id, created_at")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Run {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "dataset_id", nullable = false)
  private Dataset dataset;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "target_id", nullable = false)
  private Target target;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "run_status")
  @Builder.Default
  private RunStatus status = RunStatus.PENDING;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "run_mode", nullable = false, columnDefinition = "run_mode")
  @Builder.Default
  private RunMode runMode = RunMode.FULL_DATASET;

  @Column(name = "include_llm_judge", nullable = false)
  @Builder.Default
  private boolean includeLlmJudge = true;

  @Column(name = "include_tool_expectations", nullable = false)
  @Builder.Default
  private boolean includeToolExpectations = true;

  @Column(name = "max_concurrency", nullable = false)
  @Builder.Default
  private Integer maxConcurrency = 3;

  @Column(name = "timeout_ms", nullable = false)
  @Builder.Default
  private Integer timeoutMs = 30000;

  @Column(name = "retry_count", nullable = false)
  @Builder.Default
  private Integer retryCount = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "triggered_by")
  private User triggeredBy;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "previous_run_id")
  private Run previousRun;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "selected_case_ids", columnDefinition = "jsonb")
  @Builder.Default
  private List<UUID> selectedCaseIds = new ArrayList<>();

  @Column(name = "selected_section", length = 500)
  private String selectedSection;

  @Column(name = "started_at")
  private OffsetDateTime startedAt;

  @Column(name = "finished_at")
  private OffsetDateTime finishedAt;

  @Column(name = "total_test_cases", nullable = false)
  @Builder.Default
  private Integer totalTestCases = 0;

  @Column(name = "completed_test_cases", nullable = false)
  @Builder.Default
  private Integer completedTestCases = 0;

  @Column(name = "passed_count", nullable = false)
  @Builder.Default
  private Integer passedCount = 0;

  @Column(name = "failed_count", nullable = false)
  @Builder.Default
  private Integer failedCount = 0;

  @Column(name = "error_count", nullable = false)
  @Builder.Default
  private Integer errorCount = 0;

  @Column(name = "skipped_count", nullable = false)
  @Builder.Default
  private Integer skippedCount = 0;

  @Column(name = "llm_rubric_count", nullable = false)
  @Builder.Default
  private Integer llmRubricCount = 0;

  @Column(name = "estimated_llm_calls", nullable = false)
  @Builder.Default
  private Integer estimatedLlmCalls = 0;

  @Column(name = "failure_reason", columnDefinition = "TEXT")
  private String failureReason;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> summary = new HashMap<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "config_snapshot", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> configSnapshot = new HashMap<>();

  @Column(name = "artifact_path", length = 1000)
  private String artifactPath;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name = "updated_at", nullable = false)
  @Builder.Default
  private OffsetDateTime updatedAt = OffsetDateTime.now();

  @PrePersist
  void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    createdAt = now;
    updatedAt = now;
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    applyDefaults();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
    applyDefaults();
  }

  private void applyDefaults() {
    if (status == null) {
      status = RunStatus.PENDING;
    }
    if (runMode == null) {
      runMode = RunMode.FULL_DATASET;
    }
    if (maxConcurrency == null) {
      maxConcurrency = 3;
    }
    if (timeoutMs == null) {
      timeoutMs = 30000;
    }
    if (retryCount == null) {
      retryCount = 0;
    }
    if (selectedCaseIds == null) {
      selectedCaseIds = new ArrayList<>();
    }
    if (summary == null) {
      summary = new HashMap<>();
    }
    if (configSnapshot == null) {
      configSnapshot = new HashMap<>();
    }
  }
}

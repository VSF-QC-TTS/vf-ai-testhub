package vn.vinfast.aitesthub.experiment.entity;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.experiment.enums.ExperimentStatus;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Entity
@Table(
    name = "experiments",
    indexes = {
      @Index(name = "idx_experiments_project_id", columnList = "project_id"),
      @Index(name = "idx_experiments_dataset_id", columnList = "dataset_id"),
      @Index(name = "idx_experiments_status", columnList = "status"),
      @Index(name = "idx_experiments_created_at", columnList = "created_at")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experiment {

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

  @Column(nullable = false, length = 255)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "run_mode", nullable = false, columnDefinition = "run_mode")
  @Builder.Default
  private RunMode runMode = RunMode.FULL_DATASET;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "selected_case_ids", columnDefinition = "jsonb")
  @Builder.Default
  private List<UUID> selectedCaseIds = new ArrayList<>();

  @Column(name = "selected_section", length = 500)
  private String selectedSection;

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

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "experiment_status")
  @Builder.Default
  private ExperimentStatus status = ExperimentStatus.DRAFT;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "created_by", nullable = false, updatable = false)
  private User createdBy;

  @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("id ASC")
  @Builder.Default
  private List<ExperimentVariant> variants = new ArrayList<>();

  @Column(name = "started_at")
  private OffsetDateTime startedAt;

  @Column(name = "finished_at")
  private OffsetDateTime finishedAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name = "updated_at", nullable = false)
  @Builder.Default
  private OffsetDateTime updatedAt = OffsetDateTime.now();

  public ExperimentVariant addVariant(
      String variantKey, String name, Target target, java.util.Map<String, Object> runtimeOptions) {
    ExperimentVariant variant =
        ExperimentVariant.builder()
            .experiment(this)
            .variantKey(variantKey)
            .name(name)
            .target(target)
            .runtimeOptions(runtimeOptions == null ? new java.util.HashMap<>() : runtimeOptions)
            .build();
    variants.add(variant);
    return variant;
  }

  @PrePersist
  void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    createdAt = now;
    updatedAt = now;
    applyDefaults();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
    applyDefaults();
  }

  private void applyDefaults() {
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    if (runMode == null) {
      runMode = RunMode.FULL_DATASET;
    }
    if (selectedCaseIds == null) {
      selectedCaseIds = new ArrayList<>();
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
    if (status == null) {
      status = ExperimentStatus.DRAFT;
    }
  }
}

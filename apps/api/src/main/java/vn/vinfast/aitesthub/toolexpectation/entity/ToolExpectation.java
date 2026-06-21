package vn.vinfast.aitesthub.toolexpectation.entity;

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
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "tool_expectations",
    indexes = {
      @Index(name = "idx_tool_exp_test_case_id", columnList = "test_case_id"),
      @Index(name = "idx_tool_exp_rubric_id", columnList = "rubric_id"),
      @Index(name = "idx_tool_exp_type", columnList = "expectation_type"),
      @Index(name = "idx_tool_exp_tool_name", columnList = "tool_name"),
      @Index(name = "idx_tool_exp_enabled", columnList = "test_case_id, enabled")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolExpectation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "test_case_id", nullable = false)
  private TestCase testCase;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "expectation_type", nullable = false, columnDefinition = "tool_expectation_type")
  private ToolExpectationType expectationType;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "target_source", nullable = false, columnDefinition = "target_source_type")
  @Builder.Default
  private TargetSourceType targetSource = TargetSourceType.normalized_tool_calls;

  @Column(name = "tool_name", length = 255)
  private String toolName;

  @Column(name = "agent_name", length = 255)
  private String agentName;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "argument_assertions", columnDefinition = "jsonb")
  @Builder.Default
  private List<Map<String, Object>> argumentAssertions = new ArrayList<>();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private List<String> sequence = new ArrayList<>();

  @Column(name = "min_calls")
  private Integer minCalls;

  @Column(name = "max_calls")
  private Integer maxCalls;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rubric_id")
  private Rubric rubric;

  @Column(name = "rubric_override", columnDefinition = "TEXT")
  private String rubricOverride;

  @Column(precision = 5, scale = 4)
  @Builder.Default
  private BigDecimal threshold = BigDecimal.valueOf(0.8);

  @Column(nullable = false)
  @Builder.Default
  private boolean required = true;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "severity_level")
  @Builder.Default
  private SeverityLevel severity = SeverityLevel.MAJOR;

  @Column(nullable = false)
  @Builder.Default
  private boolean enabled = true;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private Integer sortOrder = 0;

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
    if (targetSource == null) {
      targetSource = TargetSourceType.normalized_tool_calls;
    }
    if (argumentAssertions == null) {
      argumentAssertions = new ArrayList<>();
    }
    if (sequence == null) {
      sequence = new ArrayList<>();
    }
    if (threshold == null) {
      threshold = BigDecimal.valueOf(0.8);
    }
    if (severity == null) {
      severity = SeverityLevel.MAJOR;
    }
    if (sortOrder == null) {
      sortOrder = 0;
    }
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}

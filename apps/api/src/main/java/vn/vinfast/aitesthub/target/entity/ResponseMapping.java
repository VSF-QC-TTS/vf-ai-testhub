package vn.vinfast.aitesthub.target.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.target.enums.MissingFieldBehavior;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Entity
@Table(
    name = "response_mappings",
    uniqueConstraints = {
      @UniqueConstraint(name = "uq_response_mappings_target", columnNames = {"target_id"})
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseMapping {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "target_id", nullable = false)
  private Target target;

  @Column(name = "answer_path", length = 500)
  private String answerPath;

  @Column(name = "suggestions_path", length = 500)
  private String suggestionsPath;

  @Column(name = "intent_path", length = 500)
  private String intentPath;

  @Column(name = "confidence_path", length = 500)
  private String confidencePath;

  @Column(name = "sources_path", length = 500)
  private String sourcesPath;

  @Column(name = "retrieval_path", length = 500)
  private String retrievalPath;

  @Column(name = "memory_path", length = 500)
  private String memoryPath;

  @Column(name = "rewrite_path", length = 500)
  private String rewritePath;

  @Column(name = "agent_path", length = 500)
  private String agentPath;

  @Column(name = "tool_path", length = 500)
  private String toolPath;

  @Column(name = "tool_calls_path", length = 500)
  private String toolCallsPath;

  @Column(name = "trace_id_path", length = 500)
  private String traceIdPath;

  @Column(name = "latency_path", length = 500)
  private String latencyPath;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "custom_components")
  private List<Object> customComponents;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(
      name = "missing_field_behavior",
      nullable = false,
      columnDefinition = "missing_field_behavior")
  @Builder.Default
  private MissingFieldBehavior missingFieldBehavior = MissingFieldBehavior.FAIL;

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
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}

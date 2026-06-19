package vn.vinfast.aitesthub.target.entity;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.target.enums.HttpMethod;
import vn.vinfast.aitesthub.target.enums.TargetType;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Entity
@Table(
    name = "targets",
    uniqueConstraints = {
      @UniqueConstraint(name = "uq_targets_public_id", columnNames = {"public_id"}),
      @UniqueConstraint(name = "uq_targets_project_name", columnNames = {"project_id", "name"})
    },
    indexes = {
      @Index(name = "idx_targets_project_id", columnList = "project_id"),
      @Index(name = "idx_targets_env", columnList = "environment")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Target {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(length = 50)
  private String environment;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "target_type", nullable = false, columnDefinition = "target_type")
  @Builder.Default
  private TargetType targetType = TargetType.HTTP;

  // HTTP Target configs
  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(columnDefinition = "http_method")
  @Builder.Default
  private HttpMethod method = HttpMethod.POST;

  @Column(columnDefinition = "TEXT")
  private String url;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "query_params_template")
  private Map<String, Object> queryParamsTemplate;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "headers_template")
  private Map<String, Object> headersTemplate;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "body_template")
  private Map<String, Object> bodyTemplate;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "auth_config")
  private Map<String, Object> authConfig;

  // LLM Target configs
  @Column(name = "llm_provider", length = 100)
  private String llmProvider;

  @Column(name = "llm_model", length = 100)
  private String llmModel;

  @Column(name = "llm_base_url", columnDefinition = "TEXT")
  private String llmBaseUrl;

  @Column(name = "llm_key_ref", length = 255)
  private String llmKeyRef;

  // Common bindings
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "input_binding")
  private Map<String, Object> inputBinding;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "variable_bindings")
  private Map<String, Object> variableBindings;

  @Column(name = "timeout_ms", nullable = false)
  @Builder.Default
  private Integer timeoutMs = 30000;

  @Column(name = "is_default", nullable = false)
  @Builder.Default
  private boolean isDefault = false;

  @OneToOne(mappedBy = "target", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private ResponseMapping responseMapping;

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
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}

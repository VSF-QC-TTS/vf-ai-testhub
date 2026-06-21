package vn.vinfast.aitesthub.rubric.entity;

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
import java.util.HashMap;
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
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Entity
@Table(
    name = "rubrics",
    indexes = {
      @Index(name = "idx_rubrics_project_id", columnList = "project_id"),
      @Index(name = "idx_rubrics_dataset_id", columnList = "dataset_id"),
      @Index(name = "idx_rubrics_scope", columnList = "scope"),
      @Index(name = "idx_rubrics_category", columnList = "category"),
      @Index(name = "idx_rubrics_archived", columnList = "archived"),
      @Index(name = "idx_rubrics_created_by", columnList = "created_by")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rubric {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "rubric_scope")
  @Builder.Default
  private RubricScope scope = RubricScope.PROJECT;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id")
  private Project project;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "dataset_id")
  private Dataset dataset;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "rubric_category")
  @Builder.Default
  private RubricCategory category = RubricCategory.ANSWER_QUALITY;

  @Column(nullable = false, length = 10)
  @Builder.Default
  private String language = "vi";

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "default_threshold", nullable = false, precision = 5, scale = 4)
  @Builder.Default
  private BigDecimal defaultThreshold = BigDecimal.valueOf(0.8);

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> metadata = new HashMap<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", updatable = false)
  private User createdBy;

  @Column(nullable = false)
  @Builder.Default
  private boolean archived = false;

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
    if (scope == null) {
      scope = RubricScope.PROJECT;
    }
    if (category == null) {
      category = RubricCategory.ANSWER_QUALITY;
    }
    if (language == null || language.isBlank()) {
      language = "vi";
    }
    if (defaultThreshold == null) {
      defaultThreshold = BigDecimal.valueOf(0.8);
    }
    if (metadata == null) {
      metadata = new HashMap<>();
    }
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
  }
}

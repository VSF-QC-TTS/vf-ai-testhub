package vn.vinfast.aitesthub.experiment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import jakarta.persistence.UniqueConstraint;
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
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.target.entity.Target;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Entity
@Table(
    name = "experiment_variants",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uq_experiment_variants_key",
          columnNames = {"experiment_id", "variant_key"})
    },
    indexes = {
      @Index(name = "idx_experiment_variants_experiment", columnList = "experiment_id"),
      @Index(name = "idx_experiment_variants_target", columnList = "target_id"),
      @Index(name = "idx_experiment_variants_run", columnList = "run_id")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperimentVariant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "experiment_id", nullable = false)
  private Experiment experiment;

  @Column(name = "variant_key", nullable = false, length = 50)
  private String variantKey;

  @Column(nullable = false, length = 255)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "target_id", nullable = false)
  private Target target;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "run_id")
  private Run run;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "runtime_options", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, Object> runtimeOptions = new HashMap<>();

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
    if (runtimeOptions == null) {
      runtimeOptions = new HashMap<>();
    }
  }
}

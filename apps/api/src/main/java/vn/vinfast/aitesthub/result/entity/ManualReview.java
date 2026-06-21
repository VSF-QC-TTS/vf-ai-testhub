package vn.vinfast.aitesthub.result.entity;

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
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.user.entity.User;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Entity
@Table(
    name = "manual_reviews",
    uniqueConstraints = {
      @UniqueConstraint(name = "uq_manual_reviews_public_id", columnNames = "public_id"),
      @UniqueConstraint(name = "uq_manual_reviews_test_result", columnNames = "test_result_id")
    },
    indexes = {
      @Index(name = "idx_manual_reviews_test_result", columnList = "test_result_id"),
      @Index(name = "idx_manual_reviews_reviewed_by", columnList = "reviewed_by"),
      @Index(name = "idx_manual_reviews_final_status", columnList = "final_status"),
      @Index(name = "idx_manual_reviews_auto_status", columnList = "auto_status"),
      @Index(name = "idx_manual_reviews_reviewed_at", columnList = "reviewed_at")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "public_id", nullable = false, updatable = false, unique = true)
  @Builder.Default
  private UUID publicId = UUID.randomUUID();

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "test_result_id", nullable = false)
  private TestResult testResult;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "auto_status", nullable = false, columnDefinition = "review_status")
  private ReviewStatus autoStatus;

  @Column(name = "auto_reason", columnDefinition = "TEXT")
  private String autoReason;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "reviewed_status", columnDefinition = "review_status")
  private ReviewStatus reviewedStatus;

  @Column(name = "reviewer_note", columnDefinition = "TEXT")
  private String reviewerNote;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewed_by")
  private User reviewedBy;

  @Column(name = "reviewed_at")
  private OffsetDateTime reviewedAt;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "final_status", nullable = false, columnDefinition = "review_status")
  private ReviewStatus finalStatus;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private OffsetDateTime createdAt = OffsetDateTime.now();

  @Column(name = "updated_at", nullable = false)
  @Builder.Default
  private OffsetDateTime updatedAt = OffsetDateTime.now();

  @PrePersist
  void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    if (publicId == null) {
      publicId = UUID.randomUUID();
    }
    if (createdAt == null) {
      createdAt = now;
    }
    updatedAt = now;
    applyFinalStatus();
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = OffsetDateTime.now();
    applyFinalStatus();
  }

  public void applyFinalStatus() {
    finalStatus = reviewedStatus == null ? autoStatus : reviewedStatus;
  }
}

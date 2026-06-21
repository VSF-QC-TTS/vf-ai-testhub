package vn.vinfast.aitesthub.result.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.entity.TestResult;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Repository
public interface ManualReviewRepository extends JpaRepository<ManualReview, Long> {

  Optional<ManualReview> findByPublicId(UUID publicId);

  Optional<ManualReview> findByTestResult(TestResult testResult);

  List<ManualReview> findByTestResultIn(Collection<TestResult> testResults);
}

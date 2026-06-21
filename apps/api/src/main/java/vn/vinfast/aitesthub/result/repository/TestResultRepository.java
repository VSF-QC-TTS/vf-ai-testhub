package vn.vinfast.aitesthub.result.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {

  Optional<TestResult> findByRunAndTestCase(Run run, TestCase testCase);

  long countByRun(Run run);

  long countByRunAndStatus(Run run, ReviewStatus status);
}

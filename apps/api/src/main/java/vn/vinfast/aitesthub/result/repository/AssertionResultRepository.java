package vn.vinfast.aitesthub.result.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.result.entity.AssertionResult;
import vn.vinfast.aitesthub.result.entity.TestResult;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Repository
public interface AssertionResultRepository extends JpaRepository<AssertionResult, Long> {

  Optional<AssertionResult> findByTestResultAndAssertion(TestResult testResult, Assertion assertion);
}

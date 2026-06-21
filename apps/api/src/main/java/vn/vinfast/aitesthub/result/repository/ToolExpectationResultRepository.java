package vn.vinfast.aitesthub.result.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.entity.ToolExpectationResult;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Repository
public interface ToolExpectationResultRepository
    extends JpaRepository<ToolExpectationResult, Long> {

  Optional<ToolExpectationResult> findByTestResultAndToolExpectation(
      TestResult testResult, ToolExpectation toolExpectation);

  List<ToolExpectationResult> findByTestResultIn(Collection<TestResult> testResults);
}

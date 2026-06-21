package vn.vinfast.aitesthub.toolexpectation.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.toolexpectation.entity.ToolExpectation;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface ToolExpectationRepository extends JpaRepository<ToolExpectation, Long> {

  Optional<ToolExpectation> findByPublicId(UUID publicId);

  Page<ToolExpectation> findByTestCase(TestCase testCase, Pageable pageable);

  List<ToolExpectation> findByTestCaseInAndEnabledTrue(Collection<TestCase> testCases);
}

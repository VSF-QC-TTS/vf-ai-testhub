package vn.vinfast.aitesthub.assertion.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.assertion.entity.Assertion;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface AssertionRepository extends JpaRepository<Assertion, Long> {

  Optional<Assertion> findByPublicId(UUID publicId);

  Page<Assertion> findByTestCase(TestCase testCase, Pageable pageable);

  List<Assertion> findByTestCaseInAndEnabledTrue(Collection<TestCase> testCases);
}

package vn.vinfast.aitesthub.testcase.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.testcase.entity.TestCase;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface TestCaseRepository
    extends JpaRepository<TestCase, Long>, JpaSpecificationExecutor<TestCase> {

  Optional<TestCase> findByPublicId(UUID publicId);

  Optional<TestCase> findByDatasetAndExternalId(Dataset dataset, String externalId);
}

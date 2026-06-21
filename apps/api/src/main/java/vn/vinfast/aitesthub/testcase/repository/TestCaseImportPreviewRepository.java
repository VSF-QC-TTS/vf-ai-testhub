package vn.vinfast.aitesthub.testcase.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.testcase.entity.TestCaseImportPreview;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface TestCaseImportPreviewRepository
    extends JpaRepository<TestCaseImportPreview, Long> {

  Optional<TestCaseImportPreview> findByPublicId(UUID publicId);
}

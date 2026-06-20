package vn.vinfast.aitesthub.dataset.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.project.entity.Project;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/20/2026
 */
@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {

  Optional<Dataset> findByPublicId(UUID publicId);

  Optional<Dataset> findByProjectAndName(Project project, String name);

  Page<Dataset> findByProjectAndArchivedFalse(Project project, Pageable pageable);
}

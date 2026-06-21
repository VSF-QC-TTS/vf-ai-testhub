package vn.vinfast.aitesthub.run.repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface RunRepository extends JpaRepository<Run, Long> {

  Optional<Run> findByPublicId(UUID publicId);

  Page<Run> findByDataset(Dataset dataset, Pageable pageable);

  boolean existsByDatasetAndStatusIn(Dataset dataset, Collection<RunStatus> statuses);
}

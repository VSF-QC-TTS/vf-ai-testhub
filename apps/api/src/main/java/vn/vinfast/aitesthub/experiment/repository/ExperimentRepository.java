package vn.vinfast.aitesthub.experiment.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.experiment.entity.Experiment;
import vn.vinfast.aitesthub.project.entity.Project;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {

  Optional<Experiment> findByPublicId(UUID publicId);

  Page<Experiment> findByProject(Project project, Pageable pageable);
}

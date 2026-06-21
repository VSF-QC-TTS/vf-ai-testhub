package vn.vinfast.aitesthub.rubric.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.rubric.entity.Rubric;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Repository
public interface RubricRepository
    extends JpaRepository<Rubric, Long>, JpaSpecificationExecutor<Rubric> {

  Optional<Rubric> findByPublicId(UUID publicId);

  boolean existsByProjectAndNameAndArchivedFalse(Project project, String name);

  boolean existsByProjectAndNameAndArchivedFalseAndIdNot(Project project, String name, Long id);
}

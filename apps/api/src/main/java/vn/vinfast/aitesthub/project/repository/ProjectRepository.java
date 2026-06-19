package vn.vinfast.aitesthub.project.repository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/19/2026
 */


import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

  Optional<Project> findByPublicId(UUID publicId);

  Page<Project> findByArchivedFalse(Pageable pageable);

  Page<Project> findByOwnerIdAndArchivedFalse(Long ownerId, Pageable pageable);

  boolean existsByName(String name);

  boolean existsByNameAndIdNot(String name, Long id);
}

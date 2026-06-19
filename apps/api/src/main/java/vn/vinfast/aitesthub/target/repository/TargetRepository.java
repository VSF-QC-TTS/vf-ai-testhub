package vn.vinfast.aitesthub.target.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.target.entity.Target;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Repository
public interface TargetRepository extends JpaRepository<Target, Long> {

  Optional<Target> findByPublicId(UUID publicId);

  Page<Target> findByProjectPublicId(UUID projectPublicId, Pageable pageable);
  
  boolean existsByProjectPublicIdAndName(UUID projectPublicId, String name);
  
  boolean existsByProjectPublicIdAndNameAndPublicIdNot(UUID projectPublicId, String name, UUID publicId);
}

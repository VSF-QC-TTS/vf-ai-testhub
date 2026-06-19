package vn.vinfast.aitesthub.target.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Repository
public interface ResponseMappingRepository extends JpaRepository<ResponseMapping, Long> {

  Optional<ResponseMapping> findByTarget(Target target);
}

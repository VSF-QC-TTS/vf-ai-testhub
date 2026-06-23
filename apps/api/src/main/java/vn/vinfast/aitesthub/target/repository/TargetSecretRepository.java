package vn.vinfast.aitesthub.target.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.entity.TargetSecret;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
@Repository
public interface TargetSecretRepository extends JpaRepository<TargetSecret, Long> {

  List<TargetSecret> findByTarget(Target target);

  void deleteByTarget(Target target);
}

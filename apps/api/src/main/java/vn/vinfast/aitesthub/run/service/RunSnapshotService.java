package vn.vinfast.aitesthub.run.service;

import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;
import vn.vinfast.aitesthub.run.entity.Run;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public interface RunSnapshotService {

  /**
   * Assembles the immutable runner snapshot for a run.
   *
   * @param run the persisted {@link Run} with project, dataset, target, and run options
   * @return a complete {@link RunSnapshotDto} ready to serialize for the runner
   */
  RunSnapshotDto assembleSnapshot(Run run);
}

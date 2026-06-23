package vn.vinfast.aitesthub.target.service;

import vn.vinfast.aitesthub.target.request.TargetRequest;
import vn.vinfast.aitesthub.target.response.TargetTestResponse;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
public interface TargetTestService {

  /**
   * Pings the target configured in the request to verify connectivity and retrieve a sample response.
   *
   * @param request the configuration of the target to test
   * @return the result of the connection test
   */
  TargetTestResponse testConnection(TargetRequest request);
}

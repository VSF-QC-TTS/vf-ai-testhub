package vn.vinfast.aitesthub.target.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Validated
public interface ResponseMappingService {

  /**
   * Retrieves the response mapping for a given target.
   *
   * @param targetId the public ID of the {@link vn.vinfast.aitesthub.target.entity.Target}
   * @return the {@link ResponseMappingResponse} or null if not found
   */
  ResponseMappingResponse getResponseMapping(UUID targetId);

  /**
   * Creates or updates the response mapping for a target.
   *
   * @param targetId the public ID of the {@link vn.vinfast.aitesthub.target.entity.Target}
   * @param request  the validated {@link ResponseMappingRequest}
   * @return the saved {@link ResponseMappingResponse}
   */
  ResponseMappingResponse saveResponseMapping(UUID targetId, @Valid ResponseMappingRequest request);
}

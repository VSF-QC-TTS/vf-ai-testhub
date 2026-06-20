package vn.vinfast.aitesthub.target.service.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.target.entity.ResponseMapping;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.mapper.ResponseMappingMapper;
import vn.vinfast.aitesthub.target.repository.ResponseMappingRepository;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.target.request.ResponseMappingRequest;
import vn.vinfast.aitesthub.target.response.ResponseMappingResponse;
import vn.vinfast.aitesthub.target.service.ResponseMappingService;

/**
 * @author nghlong3004
 * @since 6/19/2026
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ResponseMappingServiceImpl implements ResponseMappingService {

  private final ResponseMappingRepository responseMappingRepository;
  private final TargetRepository targetRepository;
  private final ResponseMappingMapper responseMappingMapper;

  @Override
  @Transactional(readOnly = true)
  public ResponseMappingResponse getResponseMapping(UUID targetId) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));

    return responseMappingRepository.findByTarget(target)
        .map(responseMappingMapper::toResponse)
        .orElse(null);
  }

  @Override
  @Transactional
  public ResponseMappingResponse saveResponseMapping(UUID targetId, ResponseMappingRequest request) {
    Target target = targetRepository.findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));

    ResponseMapping mapping = responseMappingRepository.findByTarget(target)
        .orElseGet(() -> {
          ResponseMapping newMapping = responseMappingMapper.toEntity(request);
          newMapping.setTarget(target);
          return newMapping;
        });

    if (mapping.getId() != null) {
      responseMappingMapper.updateEntityFromRequest(request, mapping);
    }

    ResponseMapping saved = responseMappingRepository.save(mapping);
    return responseMappingMapper.toResponse(saved);
  }
}

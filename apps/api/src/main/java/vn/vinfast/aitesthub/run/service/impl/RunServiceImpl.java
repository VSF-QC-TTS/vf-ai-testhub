package vn.vinfast.aitesthub.run.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.run.dto.RunSnapshotDto;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.mapper.RunMapper;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;
import vn.vinfast.aitesthub.run.service.RunService;
import vn.vinfast.aitesthub.run.service.RunSnapshotService;
import vn.vinfast.aitesthub.run.stream.RunStreamPublisher;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RunServiceImpl implements RunService {

  private final RunRepository runRepository;
  private final DatasetRepository datasetRepository;
  private final TargetRepository targetRepository;
  private final UserRepository userRepository;
  private final RunSnapshotService runSnapshotService;
  private final RunStreamPublisher runStreamPublisher;
  private final RunMapper runMapper;
  private final ObjectMapper objectMapper;

  @Override
  @Transactional
  public RunResponse triggerRun(UUID datasetPublicId, RunRequest request, String username) {
    return triggerRun(datasetPublicId, request, username, false);
  }

  @Override
  @Transactional
  public RunResponse triggerExperimentRun(UUID datasetPublicId, RunRequest request, String username) {
    return triggerRun(datasetPublicId, request, username, true);
  }

  private RunResponse triggerRun(
      UUID datasetPublicId, RunRequest request, String username, boolean allowConcurrentDatasetRun) {
    Dataset dataset = datasetRepository.findByPublicId(datasetPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
    if (dataset.isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    Target target = targetRepository.findByPublicId(request.targetId())
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));
    if (!target.getProject().getId().equals(dataset.getProject().getId())) {
      throw new ResourceException(
          "Target does not belong to the dataset project",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUN_TARGET_PROJECT_MISMATCH");
    }
    if (!allowConcurrentDatasetRun
        && runRepository.existsByDatasetAndStatusIn(dataset, List.of(RunStatus.PENDING, RunStatus.RUNNING))) {
      throw new ResourceException(
          "Dataset already has a pending or running run",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUN_ALREADY_ACTIVE");
    }

    User triggeredBy = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));
    Run previousRun = resolvePreviousRun(request.previousRunId());

    Run run = buildPendingRun(dataset, target, triggeredBy, previousRun, request);
    run = runRepository.save(run);

    RunSnapshotDto snapshot = runSnapshotService.assembleSnapshot(run);
    applySnapshotCounters(run, snapshot);
    run.setConfigSnapshot(objectMapper.convertValue(snapshot, new TypeReference<Map<String, Object>>() {}));
    runStreamPublisher.publishRunJob(snapshot);
    run.setStatus(RunStatus.RUNNING);
    run.setStartedAt(OffsetDateTime.now());

    return runMapper.toResponse(run);
  }

  @Override
  public RunResponse getRun(UUID publicId) {
    return runRepository
        .findByPublicId(publicId)
        .map(runMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
  }

  @Override
  public Page<RunResponse> getRunsByDataset(UUID datasetPublicId, Pageable pageable) {
    Dataset dataset = datasetRepository.findByPublicId(datasetPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
    return runRepository.findByDataset(dataset, pageable).map(runMapper::toResponse);
  }

  private Run resolvePreviousRun(UUID previousRunId) {
    if (previousRunId == null) {
      return null;
    }
    return runRepository.findByPublicId(previousRunId)
        .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
  }

  private Run buildPendingRun(
      Dataset dataset, Target target, User triggeredBy, Run previousRun, RunRequest request) {
    return Run.builder()
        .project(dataset.getProject())
        .dataset(dataset)
        .target(target)
        .status(RunStatus.PENDING)
        .runMode(request.runMode() == null ? RunMode.FULL_DATASET : request.runMode())
        .includeLlmJudge(request.includeLlmJudge() == null || request.includeLlmJudge())
        .includeToolExpectations(
            request.includeToolExpectations() == null || request.includeToolExpectations())
        .maxConcurrency(request.maxConcurrency() == null ? 3 : request.maxConcurrency())
        .timeoutMs(request.timeoutMs() == null ? 30000 : request.timeoutMs())
        .retryCount(request.retryCount() == null ? 0 : request.retryCount())
        .triggeredBy(triggeredBy)
        .previousRun(previousRun)
        .selectedCaseIds(request.selectedCaseIds() == null ? List.of() : request.selectedCaseIds())
        .selectedSection(request.selectedSection())
        .build();
  }

  private void applySnapshotCounters(Run run, RunSnapshotDto snapshot) {
    int llmRubricCount =
        snapshot.testCases().stream()
            .flatMap(testCase -> testCase.assertions().stream())
            .filter(assertion -> assertion.type() == AssertionType.llm_rubric)
            .mapToInt(ignored -> 1)
            .sum();
    run.setTotalTestCases(snapshot.testCases().size());
    run.setLlmRubricCount(llmRubricCount);
    run.setEstimatedLlmCalls(run.isIncludeLlmJudge() ? llmRubricCount : 0);
  }
}

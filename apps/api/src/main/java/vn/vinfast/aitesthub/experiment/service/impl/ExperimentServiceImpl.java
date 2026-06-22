package vn.vinfast.aitesthub.experiment.service.impl;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.BusinessException;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.experiment.entity.Experiment;
import vn.vinfast.aitesthub.experiment.entity.ExperimentVariant;
import vn.vinfast.aitesthub.experiment.enums.ExperimentStatus;
import vn.vinfast.aitesthub.experiment.repository.ExperimentRepository;
import vn.vinfast.aitesthub.experiment.request.CreateExperimentRequest;
import vn.vinfast.aitesthub.experiment.request.ExperimentVariantRequest;
import vn.vinfast.aitesthub.experiment.response.ExperimentResponse;
import vn.vinfast.aitesthub.experiment.response.ExperimentVariantResponse;
import vn.vinfast.aitesthub.experiment.service.ExperimentService;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.result.response.RunComparisonResponse;
import vn.vinfast.aitesthub.result.service.RunComparisonService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.run.request.RunRequest;
import vn.vinfast.aitesthub.run.response.RunResponse;
import vn.vinfast.aitesthub.run.service.RunService;
import vn.vinfast.aitesthub.target.entity.Target;
import vn.vinfast.aitesthub.target.repository.TargetRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExperimentServiceImpl implements ExperimentService {

  private final ExperimentRepository experimentRepository;
  private final ProjectRepository projectRepository;
  private final DatasetRepository datasetRepository;
  private final TargetRepository targetRepository;
  private final UserRepository userRepository;
  private final RunRepository runRepository;
  private final RunService runService;
  private final RunComparisonService runComparisonService;

  @Override
  @Transactional
  public ExperimentResponse create(UUID projectId, CreateExperimentRequest request, String username) {
    Project project = findProject(projectId);
    Dataset dataset = findDataset(request.datasetId());
    if (!dataset.getProject().getId().equals(project.getId())) {
      throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Dataset must belong to the project.");
    }
    User createdBy =
        userRepository.findByUsername(username).orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));
    validateVariantKeys(request.variants());

    Experiment experiment =
        Experiment.builder()
            .project(project)
            .dataset(dataset)
            .name(request.name())
            .description(request.description())
            .runMode(request.runMode() == null ? RunMode.FULL_DATASET : request.runMode())
            .selectedCaseIds(request.selectedCaseIds() == null ? List.of() : request.selectedCaseIds())
            .selectedSection(request.selectedSection())
            .includeLlmJudge(request.includeLlmJudge() == null || request.includeLlmJudge())
            .includeToolExpectations(
                request.includeToolExpectations() == null || request.includeToolExpectations())
            .maxConcurrency(request.maxConcurrency() == null ? 3 : request.maxConcurrency())
            .timeoutMs(request.timeoutMs() == null ? 30000 : request.timeoutMs())
            .retryCount(request.retryCount() == null ? 0 : request.retryCount())
            .status(ExperimentStatus.DRAFT)
            .createdBy(createdBy)
            .build();

    for (ExperimentVariantRequest variantRequest : request.variants()) {
      Target target = findTarget(variantRequest.targetId());
      if (!target.getProject().getId().equals(project.getId())) {
        throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Variant target must belong to the project.");
      }
      experiment.addVariant(
          variantRequest.variantKey(),
          variantRequest.name(),
          target,
          variantRequest.runtimeOptions());
    }

    return toResponse(experimentRepository.save(experiment));
  }

  @Override
  public Page<ExperimentResponse> listByProject(UUID projectId, Pageable pageable) {
    Project project = findProject(projectId);
    return experimentRepository.findByProject(project, pageable).map(this::toResponse);
  }

  @Override
  public ExperimentResponse get(UUID experimentId) {
    return toResponse(refreshStatus(findExperiment(experimentId)));
  }

  @Override
  @Transactional
  public ExperimentResponse start(UUID experimentId, String username) {
    Experiment experiment = findExperiment(experimentId);
    if (experiment.getStatus() != ExperimentStatus.DRAFT) {
      throw new BusinessException(
          ErrorCode.EXPERIMENT_START_INVALID, "Only draft experiments can be started.");
    }
    if (experiment.getVariants().size() < 2) {
      throw new BusinessException(
          ErrorCode.EXPERIMENT_START_INVALID, "Experiment must have at least two variants.");
    }

    experiment.setStatus(ExperimentStatus.RUNNING);
    experiment.setStartedAt(OffsetDateTime.now());
    for (ExperimentVariant variant : experiment.getVariants()) {
      RunResponse runResponse =
          runService.triggerExperimentRun(
              experiment.getDataset().getPublicId(), toRunRequest(experiment, variant), username);
      Run run =
          runRepository
              .findByPublicId(runResponse.publicId())
              .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
      variant.setRun(run);
    }
    return toResponse(experimentRepository.save(experiment));
  }

  @Override
  public RunComparisonResponse compare(UUID experimentId) {
    Experiment experiment = findExperiment(experimentId);
    if (experiment.getVariants().size() != 2
        || experiment.getVariants().stream().anyMatch(variant -> variant.getRun() == null)) {
      throw new BusinessException(
          ErrorCode.EXPERIMENT_START_INVALID,
          "Experiment comparison requires exactly two started variants.");
    }
    UUID baseRunId = experiment.getVariants().get(0).getRun().getPublicId();
    UUID candidateRunId = experiment.getVariants().get(1).getRun().getPublicId();
    return runComparisonService.compareRuns(baseRunId, candidateRunId);
  }

  private Project findProject(UUID projectId) {
    return projectRepository
        .findByPublicId(projectId)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));
  }

  private Dataset findDataset(UUID datasetId) {
    return datasetRepository
        .findByPublicId(datasetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
  }

  private Target findTarget(UUID targetId) {
    return targetRepository
        .findByPublicId(targetId)
        .orElseThrow(() -> new ResourceException(ErrorCode.TARGET_CONNECTOR_NOT_FOUND));
  }

  private Experiment findExperiment(UUID experimentId) {
    return experimentRepository
        .findByPublicId(experimentId)
        .orElseThrow(() -> new ResourceException(ErrorCode.EXPERIMENT_NOT_FOUND));
  }

  private void validateVariantKeys(List<ExperimentVariantRequest> variants) {
    HashSet<String> keys = new HashSet<>();
    for (ExperimentVariantRequest variant : variants) {
      if (!keys.add(variant.variantKey())) {
        throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Variant keys must be unique.");
      }
    }
  }

  private RunRequest toRunRequest(Experiment experiment, ExperimentVariant variant) {
    return new RunRequest(
        variant.getTarget().getPublicId(),
        experiment.getRunMode(),
        experiment.getSelectedCaseIds(),
        experiment.getSelectedSection(),
        null,
        experiment.isIncludeLlmJudge(),
        experiment.isIncludeToolExpectations(),
        experiment.getMaxConcurrency(),
        experiment.getTimeoutMs(),
        experiment.getRetryCount());
  }

  private Experiment refreshStatus(Experiment experiment) {
    if (experiment.getStatus() != ExperimentStatus.RUNNING) {
      return experiment;
    }
    boolean allTerminal =
        experiment.getVariants().stream()
            .map(ExperimentVariant::getRun)
            .allMatch(run -> run != null && isTerminal(run.getStatus()));
    if (!allTerminal) {
      return experiment;
    }
    boolean anyFailed =
        experiment.getVariants().stream()
            .map(ExperimentVariant::getRun)
            .anyMatch(run -> run.getStatus() == RunStatus.FAILED || run.getStatus() == RunStatus.CANCELLED);
    experiment.setStatus(anyFailed ? ExperimentStatus.FAILED : ExperimentStatus.COMPLETED);
    experiment.setFinishedAt(OffsetDateTime.now());
    return experiment;
  }

  private boolean isTerminal(RunStatus status) {
    return status == RunStatus.COMPLETED || status == RunStatus.FAILED || status == RunStatus.CANCELLED;
  }

  private ExperimentResponse toResponse(Experiment experiment) {
    Experiment refreshed = refreshStatus(experiment);
    return ExperimentResponse.builder()
        .publicId(refreshed.getPublicId())
        .projectPublicId(refreshed.getProject().getPublicId())
        .datasetPublicId(refreshed.getDataset().getPublicId())
        .name(refreshed.getName())
        .description(refreshed.getDescription())
        .runMode(refreshed.getRunMode())
        .selectedCaseIds(refreshed.getSelectedCaseIds())
        .selectedSection(refreshed.getSelectedSection())
        .includeLlmJudge(refreshed.isIncludeLlmJudge())
        .includeToolExpectations(refreshed.isIncludeToolExpectations())
        .maxConcurrency(refreshed.getMaxConcurrency())
        .timeoutMs(refreshed.getTimeoutMs())
        .retryCount(refreshed.getRetryCount())
        .status(refreshed.getStatus())
        .createdByPublicId(refreshed.getCreatedBy().getPublicId())
        .startedAt(refreshed.getStartedAt())
        .finishedAt(refreshed.getFinishedAt())
        .variants(refreshed.getVariants().stream().map(this::toVariantResponse).toList())
        .createdAt(refreshed.getCreatedAt())
        .updatedAt(refreshed.getUpdatedAt())
        .build();
  }

  private ExperimentVariantResponse toVariantResponse(ExperimentVariant variant) {
    Run run = variant.getRun();
    return ExperimentVariantResponse.builder()
        .publicId(variant.getPublicId())
        .variantKey(variant.getVariantKey())
        .name(variant.getName())
        .targetPublicId(variant.getTarget().getPublicId())
        .targetName(variant.getTarget().getName())
        .runPublicId(run == null ? null : run.getPublicId())
        .runStatus(run == null ? null : run.getStatus())
        .runtimeOptions(variant.getRuntimeOptions() == null ? Map.of() : variant.getRuntimeOptions())
        .createdAt(variant.getCreatedAt())
        .updatedAt(variant.getUpdatedAt())
        .build();
  }
}

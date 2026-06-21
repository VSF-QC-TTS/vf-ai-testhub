package vn.vinfast.aitesthub.rubric.service.impl;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.dataset.repository.DatasetRepository;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.project.repository.ProjectRepository;
import vn.vinfast.aitesthub.rubric.entity.Rubric;
import vn.vinfast.aitesthub.rubric.enums.RubricCategory;
import vn.vinfast.aitesthub.rubric.enums.RubricScope;
import vn.vinfast.aitesthub.rubric.mapper.RubricMapper;
import vn.vinfast.aitesthub.rubric.repository.RubricRepository;
import vn.vinfast.aitesthub.rubric.request.CreateRubricRequest;
import vn.vinfast.aitesthub.rubric.request.RubricFilter;
import vn.vinfast.aitesthub.rubric.request.UpdateRubricRequest;
import vn.vinfast.aitesthub.rubric.response.RubricResponse;
import vn.vinfast.aitesthub.rubric.service.RubricService;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RubricServiceImpl implements RubricService {

  private static final BigDecimal DEFAULT_THRESHOLD = BigDecimal.valueOf(0.8);

  private final RubricRepository rubricRepository;
  private final ProjectRepository projectRepository;
  private final DatasetRepository datasetRepository;
  private final UserRepository userRepository;
  private final RubricMapper rubricMapper;

  @Override
  @Transactional
  public RubricResponse createRubric(
      UUID projectPublicId, CreateRubricRequest request, String username) {
    Project project = getActiveProject(projectPublicId);
    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));

    RubricScope scope = request.scope() == null ? RubricScope.PROJECT : request.scope();
    if (scope == RubricScope.GLOBAL) {
      throw new ResourceException(
          "Global rubrics cannot be created from a project endpoint",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUBRIC_SCOPE_INVALID");
    }
    if (rubricRepository.existsByProjectAndNameAndArchivedFalse(project, request.name())) {
      throw new ResourceException(
          "Rubric name must be unique within a project",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUBRIC_NAME_EXISTS");
    }

    Rubric rubric = rubricMapper.toEntity(request);
    rubric.setProject(project);
    rubric.setCreatedBy(currentUser);
    applyCreateDefaults(rubric, request, scope);
    attachScopedDataset(rubric, project, scope, request.datasetId());

    return rubricMapper.toResponse(rubricRepository.save(rubric));
  }

  @Override
  public RubricResponse getRubric(UUID publicId) {
    return rubricRepository
        .findByPublicId(publicId)
        .map(rubricMapper::toResponse)
        .orElseThrow(() -> new ResourceException(ErrorCode.RUBRIC_NOT_FOUND));
  }

  @Override
  public Page<RubricResponse> getRubricsByProject(
      UUID projectPublicId, RubricFilter filter, Pageable pageable) {
    Project project = projectRepository.findByPublicId(projectPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));

    return rubricRepository
        .findAll(toProjectSpecification(project, filter), pageable)
        .map(rubricMapper::toResponse);
  }

  @Override
  public Page<RubricResponse> getGlobalRubrics(RubricFilter filter, Pageable pageable) {
    return rubricRepository
        .findAll(toGlobalSpecification(filter), pageable)
        .map(rubricMapper::toResponse);
  }

  @Override
  @Transactional
  public RubricResponse updateRubric(
      UUID publicId, UpdateRubricRequest request, String username) {
    Rubric rubric = rubricRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.RUBRIC_NOT_FOUND));

    if (rubric.isArchived() && (request.archived() == null || request.archived())) {
      throw new ResourceException(ErrorCode.RUBRIC_ARCHIVED);
    }
    validateUpdateRequest(request);
    validateNameUpdate(rubric, request.name());

    rubricMapper.updateEntity(request, rubric);
    return rubricMapper.toResponse(rubric);
  }

  @Override
  @Transactional
  public void archiveRubric(UUID publicId, String username) {
    Rubric rubric = rubricRepository.findByPublicId(publicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.RUBRIC_NOT_FOUND));

    if (!rubric.isArchived()) {
      rubric.setArchived(true);
    }
  }

  private Project getActiveProject(UUID projectPublicId) {
    Project project = projectRepository.findByPublicId(projectPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.PROJECT_NOT_FOUND));
    if (project.isArchived()) {
      throw new ResourceException(
          "Cannot manage rubrics in an archived project",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "PROJECT_ARCHIVED");
    }
    return project;
  }

  private void applyCreateDefaults(
      Rubric rubric, CreateRubricRequest request, RubricScope scope) {
    rubric.setScope(scope);
    if (request.category() == null) {
      rubric.setCategory(RubricCategory.ANSWER_QUALITY);
    }
    if (request.language() == null || request.language().isBlank()) {
      rubric.setLanguage("vi");
    }
    if (request.defaultThreshold() == null) {
      rubric.setDefaultThreshold(DEFAULT_THRESHOLD);
    }
  }

  private void attachScopedDataset(
      Rubric rubric, Project project, RubricScope scope, UUID datasetPublicId) {
    if (scope != RubricScope.DATASET) {
      return;
    }
    if (datasetPublicId == null) {
      throw new ResourceException(
          "Dataset ID is required for dataset-scoped rubrics",
          422,
          "RUBRIC_DATASET_REQUIRED");
    }
    Dataset dataset = datasetRepository.findByPublicId(datasetPublicId)
        .orElseThrow(() -> new ResourceException(ErrorCode.DATASET_NOT_FOUND));
    if (!dataset.getProject().getId().equals(project.getId())) {
      throw new ResourceException(
          "Dataset does not belong to the target project",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUBRIC_DATASET_PROJECT_MISMATCH");
    }
    if (dataset.isArchived()) {
      throw new ResourceException(ErrorCode.DATASET_ARCHIVED);
    }
    rubric.setDataset(dataset);
  }

  private void validateUpdateRequest(UpdateRubricRequest request) {
    if (request.name() != null && request.name().isBlank()) {
      throw new ResourceException(
          "Name must not be blank", ErrorCode.VALIDATION_ERROR.getStatus(), "VALIDATION_ERROR");
    }
    if (request.content() != null && request.content().isBlank()) {
      throw new ResourceException(
          "Content must not be blank", ErrorCode.VALIDATION_ERROR.getStatus(), "VALIDATION_ERROR");
    }
    if (request.language() != null && request.language().isBlank()) {
      throw new ResourceException(
          "Language must not be blank", ErrorCode.VALIDATION_ERROR.getStatus(), "VALIDATION_ERROR");
    }
  }

  private void validateNameUpdate(Rubric rubric, String nextName) {
    if (nextName == null || nextName.equals(rubric.getName()) || rubric.getProject() == null) {
      return;
    }
    if (rubricRepository.existsByProjectAndNameAndArchivedFalseAndIdNot(
        rubric.getProject(), nextName, rubric.getId())) {
      throw new ResourceException(
          "Rubric name must be unique within a project",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUBRIC_NAME_EXISTS");
    }
  }

  private Specification<Rubric> toProjectSpecification(Project project, RubricFilter filter) {
    return (root, query, criteriaBuilder) -> {
      var predicates = new ArrayList<Predicate>();
      predicates.add(criteriaBuilder.equal(root.get("project"), project));
      appendCommonFilters(filter, root, criteriaBuilder, predicates);
      return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
    };
  }

  private Specification<Rubric> toGlobalSpecification(RubricFilter filter) {
    return (root, query, criteriaBuilder) -> {
      var predicates = new ArrayList<Predicate>();
      predicates.add(criteriaBuilder.equal(root.get("scope"), RubricScope.GLOBAL));
      appendCommonFilters(filter, root, criteriaBuilder, predicates);
      return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
    };
  }

  private void appendCommonFilters(
      RubricFilter filter,
      jakarta.persistence.criteria.Root<Rubric> root,
      jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
      ArrayList<Predicate> predicates) {
    if (filter == null || filter.archived() == null || !filter.archived()) {
      predicates.add(criteriaBuilder.isFalse(root.get("archived")));
    }
    if (filter == null) {
      return;
    }
    if (filter.category() != null) {
      predicates.add(criteriaBuilder.equal(root.get("category"), filter.category()));
    }
    if (filter.scope() != null) {
      predicates.add(criteriaBuilder.equal(root.get("scope"), filter.scope()));
    }
    if (hasText(filter.search())) {
      String keyword = "%" + filter.search().toLowerCase(Locale.ROOT) + "%";
      predicates.add(
          criteriaBuilder.or(
              criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), keyword),
              criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), keyword),
              criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), keyword)));
    }
  }

  private boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}

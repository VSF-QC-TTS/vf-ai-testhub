package vn.vinfast.aitesthub.run.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.run.enums.RunMode;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;

/**
 * Immutable payload shape published to the evaluation runner.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public record RunSnapshotDto(
    UUID runId,
    RunMode runMode,
    UUID projectId,
    UUID datasetId,
    TargetSnapshot target,
    Map<String, Object> responseMapping,
    List<TestCaseSnapshot> testCases,
    RunOptions options,
    OffsetDateTime createdAt
) {

  public record RunOptions(
      boolean includeLlmJudge,
      boolean includeToolExpectations,
      Integer maxConcurrency,
      Integer timeoutMs,
      Integer retryCount
  ) {}

  public record TargetSnapshot(
      UUID id,
      String name,
      String targetType,
      String method,
      String url,
      Map<String, Object> queryParamsTemplate,
      Map<String, Object> headersTemplate,
      Map<String, Object> bodyTemplate,
      Map<String, Object> authConfig,
      Map<String, Object> inputBinding,
      Map<String, Object> variableBindings,
      Integer timeoutMs
  ) {}

  public record TestCaseSnapshot(
      UUID id,
      String externalId,
      String sectionName,
      String name,
      String input,
      String expectedBehavior,
      String referenceAnswer,
      Map<String, Object> variables,
      List<String> tags,
      List<AssertionSnapshot> assertions,
      List<ToolExpectationSnapshot> toolExpectations
  ) {}

  public record AssertionSnapshot(
      UUID id,
      AssertionScope scope,
      AssertionType type,
      String targetComponent,
      String fieldPath,
      List<String> fieldPaths,
      Object expectedValue,
      RubricSnapshot rubric,
      String rubricOverride,
      Number threshold,
      Number weight,
      SeverityLevel severity
  ) {}

  public record ToolExpectationSnapshot(
      UUID id,
      ToolExpectationType expectationType,
      TargetSourceType targetSource,
      String toolName,
      String agentName,
      List<Map<String, Object>> argumentAssertions,
      List<String> sequence,
      Integer minCalls,
      Integer maxCalls,
      RubricSnapshot rubric,
      String rubricOverride,
      Number threshold,
      boolean required,
      SeverityLevel severity
  ) {}

  public record RubricSnapshot(
      UUID id,
      String scope,
      String category,
      String language,
      String content,
      Number defaultThreshold
  ) {}
}

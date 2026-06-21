package vn.vinfast.aitesthub.ai.draft;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;
import vn.vinfast.aitesthub.toolexpectation.enums.TargetSourceType;
import vn.vinfast.aitesthub.toolexpectation.enums.ToolExpectationType;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record ToolExpectationDraft(
    ToolExpectationType expectationType,
    TargetSourceType targetSource,
    String toolName,
    String agentName,
    List<Map<String, Object>> argumentAssertions,
    List<String> sequence,
    Integer minCalls,
    Integer maxCalls,
    UUID rubricId,
    String rubricOverride,
    BigDecimal threshold,
    Boolean required,
    SeverityLevel severity) {}

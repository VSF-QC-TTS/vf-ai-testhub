package vn.vinfast.aitesthub.ai.draft;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.assertion.enums.AssertionScope;
import vn.vinfast.aitesthub.assertion.enums.AssertionType;
import vn.vinfast.aitesthub.assertion.enums.SeverityLevel;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record AssertionDraft(
    AssertionScope scope,
    AssertionType type,
    String targetComponent,
    String fieldPath,
    List<String> fieldPaths,
    Object expectedValue,
    UUID rubricId,
    String rubricOverride,
    BigDecimal threshold,
    BigDecimal weight,
    SeverityLevel severity) {}

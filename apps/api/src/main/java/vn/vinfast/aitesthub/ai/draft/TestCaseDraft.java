package vn.vinfast.aitesthub.ai.draft;

import java.util.List;
import java.util.Map;
import lombok.Builder;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record TestCaseDraft(
    String draftId,
    String name,
    String description,
    String input,
    Map<String, Object> variables,
    String expectedBehavior,
    String referenceAnswer,
    String category,
    TestPriority priority,
    List<String> tags,
    List<AssertionDraft> suggestedAssertions,
    List<ToolExpectationDraft> suggestedToolExpectations) {}

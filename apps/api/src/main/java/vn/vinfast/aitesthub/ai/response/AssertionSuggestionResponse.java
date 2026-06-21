package vn.vinfast.aitesthub.ai.response;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.ai.draft.AssertionDraft;
import vn.vinfast.aitesthub.ai.draft.ToolExpectationDraft;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record AssertionSuggestionResponse(
    UUID testCaseId,
    List<AssertionDraft> assertions,
    List<ToolExpectationDraft> toolExpectations) {}

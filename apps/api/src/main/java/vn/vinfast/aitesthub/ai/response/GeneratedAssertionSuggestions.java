package vn.vinfast.aitesthub.ai.response;

import java.util.List;
import vn.vinfast.aitesthub.ai.draft.AssertionDraft;
import vn.vinfast.aitesthub.ai.draft.ToolExpectationDraft;

/**
 * Model-facing response schema for assertion and tool expectation suggestions.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record GeneratedAssertionSuggestions(
    List<AssertionDraft> assertions, List<ToolExpectationDraft> toolExpectations) {}

package vn.vinfast.aitesthub.ai.response;

import java.util.List;
import vn.vinfast.aitesthub.ai.draft.TestCaseDraft;

/**
 * Model-facing response schema for generated testcase drafts.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public record GeneratedTestCaseDrafts(List<TestCaseDraft> drafts) {}

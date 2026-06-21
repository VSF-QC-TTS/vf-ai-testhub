package vn.vinfast.aitesthub.ai.response;

import java.util.List;
import java.util.UUID;
import lombok.Builder;
import vn.vinfast.aitesthub.ai.draft.TestCaseDraft;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Builder
public record TestCaseDraftBatchResponse(
    UUID draftBatchId, UUID datasetId, List<TestCaseDraft> drafts) {}

package vn.vinfast.aitesthub.ai.service;

import vn.vinfast.aitesthub.ai.request.GenerateTestCasesRequest;
import vn.vinfast.aitesthub.ai.request.SuggestAssertionsRequest;
import vn.vinfast.aitesthub.ai.response.AssertionSuggestionResponse;
import vn.vinfast.aitesthub.ai.response.TestCaseDraftBatchResponse;

/**
 * Generates AI-assisted draft artifacts for QC review.
 *
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
public interface AIGeneratorService {

  /**
   * Generates testcase drafts from requirement/context without persisting them.
   *
   * @param request requirement text and optional project/dataset context
   * @return generated testcase draft batch for QC review
   */
  TestCaseDraftBatchResponse generateTestCases(GenerateTestCasesRequest request);

  /**
   * Suggests assertions and optional tool expectations for a testcase draft or existing testcase.
   *
   * @param request testcase content and response mapping/tool context
   * @return draft assertions and tool expectations for QC review
   */
  AssertionSuggestionResponse suggestAssertions(SuggestAssertionsRequest request);
}

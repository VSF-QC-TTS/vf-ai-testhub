package vn.vinfast.aitesthub.result.service.impl;

import java.util.List;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.mapper.ManualReviewMapper;
import vn.vinfast.aitesthub.result.repository.ManualReviewRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.request.ManualReviewBatchItem;
import vn.vinfast.aitesthub.result.request.ManualReviewBatchRequest;
import vn.vinfast.aitesthub.result.request.ManualReviewRequest;
import vn.vinfast.aitesthub.result.response.ManualReviewBatchResponse;
import vn.vinfast.aitesthub.result.response.ManualReviewResponse;
import vn.vinfast.aitesthub.result.service.ManualReviewService;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.run.repository.RunRepository;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManualReviewServiceImpl implements ManualReviewService {

  private final TestResultRepository testResultRepository;
  private final ManualReviewRepository manualReviewRepository;
  private final UserRepository userRepository;
  private final RunRepository runRepository;
  private final ManualReviewMapper manualReviewMapper;

  @Override
  @Transactional
  public ManualReviewResponse reviewResult(
      UUID testResultId, ManualReviewRequest request, String reviewerUsername) {
    TestResult testResult =
        testResultRepository
            .findByPublicId(testResultId)
            .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RESULT_NOT_FOUND));
    assertRunCompleted(testResult.getRun());

    User reviewer =
        userRepository
            .findByUsername(reviewerUsername)
            .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));
    return reviewSingleResult(testResult, request, reviewer);
  }

  @Override
  @Transactional
  public ManualReviewBatchResponse reviewRunResults(
      UUID runId, ManualReviewBatchRequest request, String reviewerUsername) {
    Run run =
        runRepository
            .findByPublicId(runId)
            .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RUN_NOT_FOUND));
    assertRunCompleted(run);
    User reviewer =
        userRepository
            .findByUsername(reviewerUsername)
            .orElseThrow(() -> new ResourceException(ErrorCode.USER_NOT_FOUND));
    List<ManualReviewResponse> reviews =
        request.reviews().stream()
            .map(item -> reviewBatchItem(run, item, reviewer))
            .toList();
    return ManualReviewBatchResponse.builder()
        .runPublicId(run.getPublicId())
        .reviewedCount(reviews.size())
        .reviews(reviews)
        .build();
  }

  private void applyReview(
      ManualReview manualReview,
      TestResult testResult,
      ManualReviewRequest request,
      User reviewer) {
    manualReview.setTestResult(testResult);
    manualReview.setAutoStatus(testResult.getStatus());
    manualReview.setAutoReason(testResult.getErrorMessage());
    manualReview.setReviewedStatus(request.reviewedStatus());
    manualReview.setReviewerNote(request.reviewerNote());
    manualReview.setReviewedBy(reviewer);
    manualReview.setReviewedAt(OffsetDateTime.now());
    manualReview.applyFinalStatus();
  }

  private ManualReviewResponse reviewBatchItem(
      Run run, ManualReviewBatchItem item, User reviewer) {
    TestResult testResult =
        testResultRepository
            .findByPublicId(item.testResultId())
            .orElseThrow(() -> new ResourceException(ErrorCode.EVALUATION_RESULT_NOT_FOUND));
    if (!testResult.getRun().getId().equals(run.getId())) {
      throw new ResourceException(
          "Reviewed result does not belong to the requested run",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "REVIEW_RESULT_RUN_MISMATCH");
    }
    ManualReviewRequest request =
        new ManualReviewRequest(item.reviewedStatus(), item.reviewerNote());
    return reviewSingleResult(testResult, request, reviewer);
  }

  private ManualReviewResponse reviewSingleResult(
      TestResult testResult, ManualReviewRequest request, User reviewer) {
    ManualReview manualReview =
        manualReviewRepository.findByTestResult(testResult).orElseGet(ManualReview::new);
    applyReview(manualReview, testResult, request, reviewer);
    return manualReviewMapper.toResponse(manualReviewRepository.save(manualReview));
  }

  private void assertRunCompleted(Run run) {
    if (run.getStatus() != RunStatus.COMPLETED) {
      throw new ResourceException(
          "Manual review is only allowed after the run is completed",
          ErrorCode.VALIDATION_ERROR.getStatus(),
          "RUN_NOT_COMPLETED");
    }
  }
}

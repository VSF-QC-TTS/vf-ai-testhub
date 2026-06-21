package vn.vinfast.aitesthub.result.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.vinfast.aitesthub.dataset.entity.Dataset;
import vn.vinfast.aitesthub.project.entity.Project;
import vn.vinfast.aitesthub.result.entity.ManualReview;
import vn.vinfast.aitesthub.result.entity.TestResult;
import vn.vinfast.aitesthub.result.enums.ReviewStatus;
import vn.vinfast.aitesthub.result.mapper.ManualReviewMapper;
import vn.vinfast.aitesthub.result.repository.ManualReviewRepository;
import vn.vinfast.aitesthub.result.repository.TestResultRepository;
import vn.vinfast.aitesthub.result.request.ManualReviewRequest;
import vn.vinfast.aitesthub.result.service.impl.ManualReviewServiceImpl;
import vn.vinfast.aitesthub.run.entity.Run;
import vn.vinfast.aitesthub.run.enums.RunStatus;
import vn.vinfast.aitesthub.testcase.entity.TestCase;
import vn.vinfast.aitesthub.user.entity.User;
import vn.vinfast.aitesthub.user.repository.UserRepository;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/22/2026
 */
@ExtendWith(MockitoExtension.class)
class ManualReviewServiceImplTest {

  @Mock private TestResultRepository testResultRepository;
  @Mock private ManualReviewRepository manualReviewRepository;
  @Mock private UserRepository userRepository;
  @Spy private ManualReviewMapper manualReviewMapper = Mappers.getMapper(ManualReviewMapper.class);

  private ManualReviewServiceImpl manualReviewService;
  private TestResult testResult;
  private User reviewer;

  private final UUID testResultPublicId = UUID.randomUUID();
  private final UUID reviewerPublicId = UUID.randomUUID();
  private final String reviewerUsername = "lead@test.com";

  @BeforeEach
  void setUp() {
    manualReviewService =
        new ManualReviewServiceImpl(
            testResultRepository, manualReviewRepository, userRepository, manualReviewMapper);

    Project project = Project.builder().id(1L).publicId(UUID.randomUUID()).name("Bot").build();
    Dataset dataset =
        Dataset.builder().id(2L).publicId(UUID.randomUUID()).project(project).name("Regression").build();
    Run run =
        Run.builder()
            .id(3L)
            .publicId(UUID.randomUUID())
            .project(project)
            .dataset(dataset)
            .status(RunStatus.COMPLETED)
            .build();
    TestCase testCase =
        TestCase.builder()
            .id(4L)
            .publicId(UUID.randomUUID())
            .dataset(dataset)
            .name("Case")
            .input("hello")
            .build();
    testResult =
        TestResult.builder()
            .id(5L)
            .publicId(testResultPublicId)
            .run(run)
            .testCase(testCase)
            .status(ReviewStatus.FAILED)
            .errorMessage("Answer missed required warranty policy")
            .build();
    reviewer =
        User.builder()
            .id(6L)
            .publicId(reviewerPublicId)
            .username(reviewerUsername)
            .build();
  }

  @Test
  void reviewResult_newReview_usesReviewedStatusAsFinalStatus() {
    ManualReviewRequest request =
        new ManualReviewRequest(ReviewStatus.PASSED, "Answer is acceptable after QC review");
    UUID reviewPublicId = UUID.randomUUID();

    when(testResultRepository.findByPublicId(testResultPublicId)).thenReturn(Optional.of(testResult));
    when(userRepository.findByUsername(reviewerUsername)).thenReturn(Optional.of(reviewer));
    when(manualReviewRepository.findByTestResult(testResult)).thenReturn(Optional.empty());
    when(manualReviewRepository.save(any(ManualReview.class)))
        .thenAnswer(
            invocation -> {
              ManualReview review = invocation.getArgument(0);
              review.setId(7L);
              review.setPublicId(reviewPublicId);
              review.setCreatedAt(OffsetDateTime.now());
              review.setUpdatedAt(OffsetDateTime.now());
              return review;
            });

    var response =
        manualReviewService.reviewResult(testResultPublicId, request, reviewerUsername);

    ArgumentCaptor<ManualReview> captor = ArgumentCaptor.forClass(ManualReview.class);
    verify(manualReviewRepository).save(captor.capture());
    ManualReview saved = captor.getValue();
    assertThat(saved.getAutoStatus()).isEqualTo(ReviewStatus.FAILED);
    assertThat(saved.getAutoReason()).isEqualTo("Answer missed required warranty policy");
    assertThat(saved.getReviewedStatus()).isEqualTo(ReviewStatus.PASSED);
    assertThat(saved.getFinalStatus()).isEqualTo(ReviewStatus.PASSED);
    assertThat(saved.getReviewedBy()).isEqualTo(reviewer);
    assertThat(saved.getReviewedAt()).isNotNull();
    assertThat(response.publicId()).isEqualTo(reviewPublicId);
    assertThat(response.reviewedByPublicId()).isEqualTo(reviewerPublicId);
    assertThat(response.finalStatus()).isEqualTo(ReviewStatus.PASSED);
  }

  @Test
  void reviewResult_existingReview_updatesOverrideDecision() {
    ManualReview existing =
        ManualReview.builder()
            .id(7L)
            .publicId(UUID.randomUUID())
            .testResult(testResult)
            .autoStatus(ReviewStatus.FAILED)
            .autoReason("Old reason")
            .reviewedStatus(ReviewStatus.FAILED)
            .reviewerNote("Old note")
            .reviewedBy(reviewer)
            .reviewedAt(OffsetDateTime.now().minusDays(1))
            .finalStatus(ReviewStatus.FAILED)
            .createdAt(OffsetDateTime.now().minusDays(1))
            .updatedAt(OffsetDateTime.now().minusDays(1))
            .build();
    ManualReviewRequest request = new ManualReviewRequest(ReviewStatus.UNCERTAIN, "Needs a rerun");

    when(testResultRepository.findByPublicId(testResultPublicId)).thenReturn(Optional.of(testResult));
    when(userRepository.findByUsername(reviewerUsername)).thenReturn(Optional.of(reviewer));
    when(manualReviewRepository.findByTestResult(testResult)).thenReturn(Optional.of(existing));
    when(manualReviewRepository.save(any(ManualReview.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var response =
        manualReviewService.reviewResult(testResultPublicId, request, reviewerUsername);

    assertThat(existing.getReviewedStatus()).isEqualTo(ReviewStatus.UNCERTAIN);
    assertThat(existing.getReviewerNote()).isEqualTo("Needs a rerun");
    assertThat(existing.getAutoReason()).isEqualTo("Answer missed required warranty policy");
    assertThat(existing.getFinalStatus()).isEqualTo(ReviewStatus.UNCERTAIN);
    assertThat(response.finalStatus()).isEqualTo(ReviewStatus.UNCERTAIN);
  }
}

package vn.vinfast.aitesthub.testcase.service;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;
import vn.vinfast.aitesthub.testcase.request.ConfirmTestCaseImportRequest;
import vn.vinfast.aitesthub.testcase.response.ImportConfirmResponse;
import vn.vinfast.aitesthub.testcase.response.ImportPreviewResponse;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Validated
public interface TestCaseImportService {

  /**
   * Parses and stores an import preview for a dataset.
   *
   * @param datasetPublicId the public ID of the target {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param file the uploaded CSV or Excel file
   * @param username the username of the authenticated user creating the preview
   * @return the import preview response
   */
  ImportPreviewResponse previewImport(UUID datasetPublicId, MultipartFile file, String username);

  /**
   * Confirms a previously created import preview and persists valid test cases.
   *
   * @param datasetPublicId the public ID of the target {@link vn.vinfast.aitesthub.dataset.entity.Dataset}
   * @param request the validated {@link ConfirmTestCaseImportRequest}
   * @param username the username of the authenticated user confirming the import
   * @return the import confirmation response
   */
  ImportConfirmResponse confirmImport(
      UUID datasetPublicId, @Valid ConfirmTestCaseImportRequest request, String username);
}

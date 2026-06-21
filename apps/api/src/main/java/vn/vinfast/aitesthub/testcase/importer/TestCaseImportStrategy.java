package vn.vinfast.aitesthub.testcase.importer;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public interface TestCaseImportStrategy {

  /**
   * Checks whether this strategy supports the uploaded file name.
   *
   * @param fileName the uploaded file name
   * @return {@code true} when this strategy can parse the file
   */
  boolean supports(String fileName);

  /**
   * Parses uploaded file content into header columns and data rows.
   *
   * @param content the uploaded file bytes
   * @return the parsed import file
   */
  ParsedImportFile parse(byte[] content);
}

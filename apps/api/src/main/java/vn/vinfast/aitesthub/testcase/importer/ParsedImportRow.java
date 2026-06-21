package vn.vinfast.aitesthub.testcase.importer;

import java.util.Map;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public record ParsedImportRow(int rowNumber, Map<String, String> values) {}

package vn.vinfast.aitesthub.testcase.importer;

import java.util.List;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
public record ParsedImportFile(List<String> columns, List<ParsedImportRow> rows) {}

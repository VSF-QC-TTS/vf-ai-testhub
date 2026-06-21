package vn.vinfast.aitesthub.testcase.importer;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
class ExcelTestCaseImportStrategyTest {

  private final ExcelTestCaseImportStrategy strategy = new ExcelTestCaseImportStrategy();

  @Test
  void parse_readsFirstSheetRows() throws Exception {
    byte[] workbookBytes;
    try (var workbook = new XSSFWorkbook()) {
      var sheet = workbook.createSheet("cases");
      var header = sheet.createRow(0);
      header.createCell(0).setCellValue("id");
      header.createCell(1).setCellValue("custom_nlp_sample");
      var row = sheet.createRow(1);
      row.createCell(0).setCellValue("TC001");
      row.createCell(1).setCellValue("VinFast VF 8 có mấy phiên bản?");
      var output = new ByteArrayOutputStream();
      workbook.write(output);
      workbookBytes = output.toByteArray();
    }

    ParsedImportFile result = strategy.parse(workbookBytes);

    assertThat(result.columns()).containsExactly("id", "custom_nlp_sample");
    assertThat(result.rows()).hasSize(1);
    assertThat(result.rows().getFirst().values().get("id")).isEqualTo("TC001");
  }
}

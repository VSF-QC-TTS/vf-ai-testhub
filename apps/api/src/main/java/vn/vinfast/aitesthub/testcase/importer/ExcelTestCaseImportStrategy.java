package vn.vinfast.aitesthub.testcase.importer;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Component
public class ExcelTestCaseImportStrategy implements TestCaseImportStrategy {

  @Override
  public boolean supports(String fileName) {
    if (fileName == null) {
      return false;
    }
    String normalized = fileName.toLowerCase();
    return normalized.endsWith(".xlsx") || normalized.endsWith(".xls");
  }

  @Override
  public ParsedImportFile parse(byte[] content) {
    try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(content))) {
      var sheet = workbook.getSheetAt(0);
      if (sheet == null || sheet.getPhysicalNumberOfRows() == 0) {
        throw new ResourceException(ErrorCode.IMPORT_FILE_EMPTY);
      }

      DataFormatter formatter = new DataFormatter();
      Row headerRow = sheet.getRow(sheet.getFirstRowNum());
      List<String> columns = readColumns(headerRow, formatter);
      if (columns.isEmpty()) {
        throw new ResourceException(ErrorCode.IMPORT_FILE_EMPTY);
      }

      List<ParsedImportRow> rows = new ArrayList<>();
      for (int rowIndex = sheet.getFirstRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
          continue;
        }
        Map<String, String> values = readRow(columns, row, formatter);
        if (values.values().stream().allMatch(String::isBlank)) {
          continue;
        }
        rows.add(new ParsedImportRow(rowIndex + 1, values));
      }
      return new ParsedImportFile(columns, rows);
    } catch (ResourceException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new ResourceException("Excel file could not be parsed", ErrorCode.IMPORT_FILE_INVALID_FORMAT.getStatus(), "IMPORT_FILE_INVALID_FORMAT");
    }
  }

  private List<String> readColumns(Row headerRow, DataFormatter formatter) {
    List<String> columns = new ArrayList<>();
    if (headerRow == null) {
      return columns;
    }
    for (int cellIndex = 0; cellIndex < headerRow.getLastCellNum(); cellIndex++) {
      String value = formatter.formatCellValue(headerRow.getCell(cellIndex)).trim();
      if (!value.isBlank()) {
        columns.add(value);
      }
    }
    return columns;
  }

  private Map<String, String> readRow(List<String> columns, Row row, DataFormatter formatter) {
    Map<String, String> values = new LinkedHashMap<>();
    for (int cellIndex = 0; cellIndex < columns.size(); cellIndex++) {
      values.put(columns.get(cellIndex), formatter.formatCellValue(row.getCell(cellIndex)).trim());
    }
    return values;
  }
}

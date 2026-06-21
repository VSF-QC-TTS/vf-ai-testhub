package vn.vinfast.aitesthub.testcase.importer;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import vn.vinfast.aitesthub.exception.ErrorCode;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Component
public class CsvTestCaseImportStrategy implements TestCaseImportStrategy {

  @Override
  public boolean supports(String fileName) {
    return fileName != null && fileName.toLowerCase().endsWith(".csv");
  }

  @Override
  public ParsedImportFile parse(byte[] content) {
    try (var reader =
        new BufferedReader(
            new InputStreamReader(new ByteArrayInputStream(content), StandardCharsets.UTF_8))) {
      String headerLine = reader.readLine();
      if (headerLine == null || headerLine.isBlank()) {
        throw new ResourceException(ErrorCode.IMPORT_FILE_EMPTY);
      }

      List<String> columns = parseLine(headerLine);
      List<ParsedImportRow> rows = new ArrayList<>();
      String line;
      int rowNumber = 1;
      while ((line = reader.readLine()) != null) {
        rowNumber++;
        List<String> values = parseLine(line);
        if (values.stream().allMatch(String::isBlank)) {
          continue;
        }
        rows.add(new ParsedImportRow(rowNumber, toRow(columns, values)));
      }
      return new ParsedImportFile(columns, rows);
    } catch (ResourceException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new ResourceException("CSV file could not be parsed", ErrorCode.IMPORT_FILE_INVALID_FORMAT.getStatus(), "IMPORT_FILE_INVALID_FORMAT");
    }
  }

  private List<String> parseLine(String line) {
    List<String> values = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean quoted = false;
    for (int index = 0; index < line.length(); index++) {
      char ch = line.charAt(index);
      if (ch == '"') {
        if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
          current.append('"');
          index++;
        } else {
          quoted = !quoted;
        }
      } else if (ch == ',' && !quoted) {
        values.add(current.toString().trim());
        current.setLength(0);
      } else {
        current.append(ch);
      }
    }
    values.add(current.toString().trim());
    return values;
  }

  private Map<String, String> toRow(List<String> columns, List<String> values) {
    Map<String, String> row = new LinkedHashMap<>();
    for (int index = 0; index < columns.size(); index++) {
      String value = index < values.size() ? values.get(index) : "";
      row.put(columns.get(index), value);
    }
    return row;
  }
}

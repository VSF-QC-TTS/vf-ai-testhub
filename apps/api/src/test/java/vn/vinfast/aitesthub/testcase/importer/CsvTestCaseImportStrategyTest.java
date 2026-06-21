package vn.vinfast.aitesthub.testcase.importer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import vn.vinfast.aitesthub.exception.ResourceException;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
class CsvTestCaseImportStrategyTest {

  private final CsvTestCaseImportStrategy strategy = new CsvTestCaseImportStrategy();

  @Test
  void parse_handlesQuotedCsvValues() {
    String csv =
        "id,section_name,custom_nlp_sample,custom_nlp_expected_dialog\n"
            + "TC001,Auth,\"How do I log in, exactly?\",\"Bot explains \"\"login\"\" steps\"";

    ParsedImportFile result = strategy.parse(csv.getBytes(StandardCharsets.UTF_8));

    assertThat(result.columns()).containsExactly("id", "section_name", "custom_nlp_sample", "custom_nlp_expected_dialog");
    assertThat(result.rows()).hasSize(1);
    assertThat(result.rows().getFirst().values().get("custom_nlp_sample"))
        .isEqualTo("How do I log in, exactly?");
    assertThat(result.rows().getFirst().values().get("custom_nlp_expected_dialog"))
        .isEqualTo("Bot explains \"login\" steps");
  }

  @Test
  void parse_emptyFile_throwsException() {
    assertThatThrownBy(() -> strategy.parse(new byte[0]))
        .isInstanceOf(ResourceException.class)
        .hasFieldOrPropertyWithValue("response.code", "IMPORT_FILE_EMPTY");
  }
}

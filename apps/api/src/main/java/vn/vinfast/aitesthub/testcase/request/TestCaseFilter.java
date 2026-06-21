package vn.vinfast.aitesthub.testcase.request;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.vinfast.aitesthub.testcase.enums.TestCaseSource;
import vn.vinfast.aitesthub.testcase.enums.TestPriority;

/**
 * @author nghlong3004 (Long Nguyen Hoang)
 * @since 6/21/2026
 */
@Schema(description = "Filter parameters for test case listing")
public record TestCaseFilter(
    @Schema(description = "Section name filter", nullable = true) String sectionName,
    @Schema(description = "Priority filter", nullable = true) TestPriority priority,
    @Schema(description = "Enabled status filter", nullable = true) Boolean enabled,
    @Schema(description = "Source filter", nullable = true) TestCaseSource source,
    @Schema(description = "Single tag filter", nullable = true) String tag,
    @Schema(description = "Keyword search over name, input, and expected behavior", nullable = true) String search
) {}

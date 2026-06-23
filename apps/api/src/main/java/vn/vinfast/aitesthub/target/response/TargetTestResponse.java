package vn.vinfast.aitesthub.target.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @author nghlong3004
 * @since 6/23/2026
 */
@Schema(description = "Response payload after testing a target connection")
public record TargetTestResponse(
    @Schema(description = "HTTP Status code returned from the target API", example = "200")
    int statusCode,

    @Schema(description = "Response time in milliseconds", example = "120")
    long responseTimeMs,

    @Schema(description = "Raw JSON response body", example = "{\"answer\":\"Hello\"}")
    String responseBody,

    @Schema(description = "Any error message if the connection failed", nullable = true)
    String errorMessage
) {}
